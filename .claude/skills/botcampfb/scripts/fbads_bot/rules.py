"""Bộ máy luật: đọc luật từ config, so với số liệu, ra danh sách hành động đã qua chốt an toàn."""
from __future__ import annotations

import hashlib
import math
import operator
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta

from .metrics import METRICS
from .state import State, now_utc

OPS = {">=": operator.ge, "<=": operator.le, ">": operator.gt, "<": operator.lt,
       "==": operator.eq, "!=": operator.ne}
COND_RE = re.compile(r"^\s*([a-z_]+)\s*(>=|<=|==|!=|>|<)\s*(-?\d+(?:\.\d+)?)\s*$")
ACTIONS = {"pause", "scale_budget", "reduce_budget", "alert"}
PRIORITY = {"pause": 0, "reduce_budget": 1, "scale_budget": 2}
WINDOWS = {"today", "yesterday", "last_3d", "last_7d", "last_14d", "last_30d", "this_month"}


class RuleError(ValueError):
    pass


@dataclass
class Rule:
    name: str
    level: str
    window: str
    conditions: list[tuple[str, str, float]]
    action: str
    percent: float = 0.0

    def matches(self, m: dict) -> bool:
        for metric, op, value in self.conditions:
            actual = m.get(metric)
            if actual is None:  # ví dụ cpr khi chưa có kết quả -> điều kiện không thoả
                return False
            if not OPS[op](float(actual), value):
                return False
        return True

    def describe(self) -> str:
        return " và ".join(f"{a} {o} {v:g}" for a, o, v in self.conditions)


@dataclass
class Action:
    id: str
    rule: str
    level: str
    window: str
    obj_id: str
    obj_name: str
    campaign_name: str
    action: str
    reason: str
    metrics: dict
    percent: float = 0.0
    current_budget: float | None = None
    new_budget: float | None = None
    created_at: str = field(default_factory=lambda: now_utc().isoformat())

    def to_dict(self) -> dict:
        return asdict(self)


def parse_condition(text: str) -> tuple[str, str, float]:
    m = COND_RE.match(str(text))
    if not m:
        raise RuleError(f"Điều kiện không hợp lệ: '{text}'. Dạng đúng: 'spend >= 200000'")
    metric, op, val = m.group(1), m.group(2), float(m.group(3))
    if metric not in METRICS:
        raise RuleError(f"Chỉ số '{metric}' không hỗ trợ. Dùng: {', '.join(sorted(METRICS))}")
    return metric, op, val


def parse_rules(raw: list[dict]) -> list[Rule]:
    rules = []
    for i, r in enumerate(raw or []):
        name = r.get("name") or f"rule_{i + 1}"
        level = r.get("level", "adset")
        window = r.get("window", "today")
        action = r.get("action")
        if level not in ("adset", "ad"):
            raise RuleError(f"[{name}] level phải là adset hoặc ad")
        if window not in WINDOWS:
            raise RuleError(f"[{name}] window '{window}' không hỗ trợ. Dùng: {', '.join(sorted(WINDOWS))}")
        if action not in ACTIONS:
            raise RuleError(f"[{name}] action phải là một trong {sorted(ACTIONS)}")
        if action in ("scale_budget", "reduce_budget") and level != "adset":
            raise RuleError(f"[{name}] chỉnh ngân sách chỉ áp dụng cho level adset")
        conds = [parse_condition(c) for c in r.get("conditions", [])]
        if not conds:
            raise RuleError(f"[{name}] cần ít nhất 1 điều kiện")
        pct = float(r.get("percent", 0))
        if action in ("scale_budget", "reduce_budget") and not (0 < pct <= 100):
            raise RuleError(f"[{name}] percent phải trong (0, 100]")
        rules.append(Rule(name, level, window, conds, action, pct))
    return rules


def _action_id(obj_id: str, action: str, rule: str, day: str) -> str:
    return hashlib.sha1(f"{obj_id}|{action}|{rule}|{day}".encode()).hexdigest()[:8]


def _round_budget(v: float, step: float) -> float:
    return float(math.floor(v / step) * step) if step else round(v, 2)


def _snapshot(m: dict) -> dict:
    keys = ["spend", "results", "cpr", "ctr", "cpm", "frequency", "roas", "daily_budget", "link_clicks"]
    return {k: (round(m[k], 2) if isinstance(m.get(k), float) else m.get(k)) for k in keys}


def _protected(m: dict, patterns: list[str]) -> bool:
    text = f"{m.get('name', '')} {m.get('campaign_name', '')}".lower()
    return any(p.lower() in text for p in patterns or [])


def evaluate(rules: list[Rule], data: dict[tuple[str, str], list[dict]], guard: dict,
             state: State, now: datetime | None = None) -> tuple[list[Action], list[Action], list[str]]:
    """Trả về (hành động, cảnh báo, ghi chú bỏ qua).

    data: {(level, window): [metrics đã merge trạng thái/ngân sách]}
    """
    now = now or now_utc()
    day = now.strftime("%Y-%m-%d")
    cooldown = timedelta(hours=float(guard.get("cooldown_hours", 24)))
    max_scale = float(guard.get("max_scale_percent", 30))
    max_reduce = float(guard.get("max_reduce_percent", 50))
    min_budget = float(guard.get("min_daily_budget", 0))
    max_budget = float(guard.get("max_daily_budget", float("inf")))
    step = float(guard.get("budget_round_to", 0))
    protect = guard.get("protect_name_contains", [])

    chosen: dict[str, Action] = {}
    alerts: list[Action] = []
    notes: list[str] = []

    for rule in rules:
        for m in data.get((rule.level, rule.window), []):
            if m.get("status") not in (None, "ACTIVE"):
                continue
            if not rule.matches(m):
                continue
            label = f"{m['name']} ({rule.level})"
            act = Action(
                id=_action_id(m["id"], rule.action, rule.name, day), rule=rule.name, level=rule.level,
                window=rule.window, obj_id=m["id"], obj_name=m["name"],
                campaign_name=m.get("campaign_name", ""), action=rule.action,
                reason=f"{rule.describe()} [{rule.window}]", metrics=_snapshot(m), percent=rule.percent,
                current_budget=m.get("daily_budget"),
            )
            if rule.action == "alert":
                alerts.append(act)
                continue
            if _protected(m, protect):
                notes.append(f"Bỏ qua {label}: tên có nhãn bảo vệ ({rule.name})")
                continue
            last = state.last_change(m["id"])
            if last and now - last < cooldown:
                notes.append(f"Bỏ qua {label}: vừa chỉnh lúc {last:%d/%m %H:%M} UTC, đang cooldown ({rule.name})")
                continue
            if rule.action in ("scale_budget", "reduce_budget"):
                owner = m.get("budget_owner")
                cur = m.get("daily_budget")
                if owner != "adset" or not cur:
                    why = "ngân sách ở cấp campaign (CBO)" if owner == "campaign" else "không có daily budget ở adset"
                    notes.append(f"Bỏ qua {label}: {why} ({rule.name})")
                    continue
                if rule.action == "scale_budget":
                    pct = min(rule.percent, max_scale)
                    new = min(_round_budget(cur * (1 + pct / 100), step), max_budget)
                else:
                    pct = min(rule.percent, max_reduce)
                    new = max(_round_budget(cur * (1 - pct / 100), step), min_budget)
                if abs(new - cur) < 1e-6:
                    notes.append(f"Bỏ qua {label}: ngân sách đã chạm trần/sàn ({rule.name})")
                    continue
                act.percent, act.new_budget = pct, new
            prev = chosen.get(m["id"])
            if prev is None or PRIORITY[act.action] < PRIORITY[prev.action]:
                chosen[m["id"]] = act

    actions = sorted(chosen.values(), key=lambda a: PRIORITY[a.action])
    limit = int(guard.get("max_actions_per_run", 20))
    if len(actions) > limit:
        notes.append(f"Giới hạn {limit} hành động/lần chạy: hoãn {len(actions) - limit} hành động")
        actions = actions[:limit]

    cap = guard.get("account_daily_spend_cap")
    today_rows = data.get(("adset", "today"), [])
    if cap and today_rows:
        total = sum(r["spend"] for r in today_rows)
        if total >= float(cap):
            alerts.insert(0, Action(
                id=_action_id("account", "alert", "spend_cap", day), rule="Trần chi tiêu tài khoản",
                level="account", window="today", obj_id="account", obj_name="Toàn tài khoản",
                campaign_name="", action="alert",
                reason=f"Tổng chi hôm nay {total:,.0f} ≥ trần {float(cap):,.0f}",
                metrics={"spend": round(total, 2)}))
    return actions, alerts, notes
