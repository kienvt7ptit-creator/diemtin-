"""Dòng lệnh: python -m fbads_bot <lệnh>

  check                 Kiểm tra token + tài khoản quảng cáo
  run                   Chạy bộ luật (mặc định theo 'mode' trong config)
  pending               Xem lệnh đang chờ duyệt
  approve <id..|all>    Duyệt và thực thi lệnh chờ
  reject  <id..|all>    Huỷ lệnh chờ
  report                Báo cáo phân tích bằng AI (không thay đổi gì)
  copy                  AI viết content quảng cáo từ brief
"""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timedelta

from . import ai_advisor
from .config import load_config
from .executor import execute
from .metrics import merge_objects, normalize
from .notifier import format_run, send
from .rules import parse_rules, evaluate, RuleError
from .state import State, now_utc


def make_client(cfg: dict, demo: bool):
    if demo:
        from .demo import DemoClient
        return DemoClient()
    from .meta_api import MetaClient
    return MetaClient(os.getenv("META_ACCESS_TOKEN", ""),
                      os.getenv("META_AD_ACCOUNT_ID", "") or str(cfg.get("ad_account_id", "")),
                      api_version=cfg["api_version"])


def collect(client, cfg: dict, needs: set[tuple[str, str]]) -> dict:
    objects = {lvl: client.list_objects(lvl) for lvl in {lvl for lvl, _ in needs}}
    data = {}
    for level, window in sorted(needs):
        rows = [normalize(r, level, cfg["result_action_types"], cfg.get("revenue_action_types"))
                for r in client.insights(level, window)]
        data[(level, window)] = merge_objects(rows, objects[level], level, int(cfg["currency_offset"]))
    return data


def _needs(rules, ai: bool) -> set[tuple[str, str]]:
    needs = {(r.level, r.window) for r in rules} | {("adset", "today")}
    if ai:
        needs |= {("adset", "last_7d"), ("ad", "today")}
    return needs


def cmd_check(cfg, args):
    client = make_client(cfg, args.demo)
    acc = client.check()
    print("Kết nối OK:")
    for k, v in acc.items():
        print(f"  {k}: {v}")
    rules = parse_rules(cfg["rules"])
    print(f"Đã nạp {len(rules)} luật. Chế độ: {cfg['mode']}")


def cmd_run(cfg, args):
    mode = args.mode or cfg["mode"]
    rules = parse_rules(cfg["rules"])
    client = make_client(cfg, args.demo)
    state = State(cfg["state_path"] if not args.demo else cfg["state_path"].replace(".json", ".demo.json"))
    account = client.check()
    data = collect(client, cfg, _needs(rules, args.ai))
    actions, alerts, notes = evaluate(rules, data, cfg["guardrails"], state)
    acts = [a.to_dict() for a in actions]
    alts = [a.to_dict() for a in alerts]
    results = None
    if mode == "auto" and acts:
        results = execute(acts, client, state, int(cfg["currency_offset"]))
    elif mode == "approve":
        for a in acts:
            state.add_pending(a)
    text = format_run(mode, acts, alts, notes, results, account.get("name", ""))
    if args.ai:
        text += "\n\n🧠 Phân tích AI:\n" + ai_advisor.analyze(data, acts, alts, account, cfg)
    send(text, quiet=args.quiet)
    state.save()
    if results and not all(r["ok"] for r in results):
        return 2
    return 0


def _select_pending(state: State, ids: list[str]) -> list[dict]:
    if ids == ["all"]:
        return list(state.pending.values())
    missing = [i for i in ids if i not in state.pending]
    if missing:
        print(f"Không thấy lệnh chờ: {', '.join(missing)}")
    return [state.pending[i] for i in ids if i in state.pending]


def cmd_pending(cfg, args):
    state = State(cfg["state_path"])
    if not state.pending:
        print("Không có lệnh nào chờ duyệt.")
        return
    print(format_run("approve", list(state.pending.values()), [], []))


def cmd_approve(cfg, args):
    state = State(cfg["state_path"])
    chosen = _select_pending(state, args.ids)
    ttl = timedelta(hours=float(cfg["guardrails"].get("pending_ttl_hours", 12)))
    fresh = []
    for a in chosen:
        state.pop_pending(a["id"])
        if now_utc() - datetime.fromisoformat(a["created_at"]) > ttl:
            print(f"[{a['id']}] quá hạn duyệt ({ttl}), bỏ. Chạy lại 'run' để có đề xuất mới.")
        else:
            fresh.append(a)
    if fresh:
        client = make_client(cfg, False)
        results = execute(fresh, client, state, int(cfg["currency_offset"]))
        send(format_run("auto", fresh, [], [], results))
    state.save()


def cmd_reject(cfg, args):
    state = State(cfg["state_path"])
    for a in _select_pending(state, args.ids):
        state.pop_pending(a["id"])
        state.log({**a, "rejected_at": now_utc().isoformat()})
        print(f"Đã huỷ [{a['id']}] {a['obj_name']}")
    state.save()


def cmd_report(cfg, args):
    rules = parse_rules(cfg["rules"])
    client = make_client(cfg, args.demo)
    account = client.check()
    data = collect(client, cfg, _needs(rules, True))
    actions, alerts, _ = evaluate(rules, data, cfg["guardrails"], State(os.devnull))
    acts, alts = [a.to_dict() for a in actions], [a.to_dict() for a in alerts]
    send("🧠 Báo cáo AI · " + account.get("name", "") + "\n\n" +
         ai_advisor.analyze(data, acts, alts, account, cfg), quiet=args.quiet)


def cmd_copy(cfg, args):
    brief = args.brief or ""
    if args.brief_file:
        with open(args.brief_file, encoding="utf-8") as f:
            brief = f.read()
    if not brief.strip():
        sys.exit("Cần --brief \"...\" hoặc --brief-file brief.txt")
    winners = None
    if args.with_winners:
        client = make_client(cfg, args.demo)
        rows = collect(client, cfg, {("ad", "last_7d")})[("ad", "last_7d")]
        rows = [r for r in rows if r.get("cpr")]
        winners = [{"ad": r["name"], "cpr": round(r["cpr"]), "ctr": round(r["ctr"], 2)}
                   for r in sorted(rows, key=lambda r: r["cpr"])[:5]]
    print(ai_advisor.write_copies(brief, args.n, winners))


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="fbads_bot", description="Trợ lý AI chạy quảng cáo Facebook tự động")
    p.add_argument("--config", help="đường dẫn config.yaml")
    sub = p.add_subparsers(dest="cmd", required=True)

    def common(sp, demo=True):
        if demo:
            sp.add_argument("--demo", action="store_true", help="dùng dữ liệu mẫu, không gọi Meta")
        sp.add_argument("--quiet", action="store_true", help="không in ra màn hình (chỉ gửi Telegram)")

    sp = sub.add_parser("check"); common(sp); sp.set_defaults(fn=cmd_check)
    sp = sub.add_parser("run"); common(sp)
    sp.add_argument("--mode", choices=["propose", "approve", "auto"], help="ghi đè mode trong config")
    sp.add_argument("--ai", action="store_true", help="kèm phân tích của Claude")
    sp.set_defaults(fn=cmd_run)
    sp = sub.add_parser("pending"); sp.set_defaults(fn=cmd_pending)
    sp = sub.add_parser("approve"); sp.add_argument("ids", nargs="+"); sp.set_defaults(fn=cmd_approve)
    sp = sub.add_parser("reject"); sp.add_argument("ids", nargs="+"); sp.set_defaults(fn=cmd_reject)
    sp = sub.add_parser("report"); common(sp); sp.set_defaults(fn=cmd_report)
    sp = sub.add_parser("copy"); common(sp)
    sp.add_argument("--brief"); sp.add_argument("--brief-file")
    sp.add_argument("--n", type=int, default=5)
    sp.add_argument("--with-winners", action="store_true", help="học từ các ad đang hiệu quả")
    sp.set_defaults(fn=cmd_copy)

    args = p.parse_args(argv)
    try:
        cfg = load_config(args.config)
        if args.cmd == "run" and args.demo and (args.mode or cfg["mode"]) == "auto":
            print("[demo] auto: chỉ ghi vào dữ liệu giả lập")
        return args.fn(cfg, args) or 0
    except (RuleError, ValueError) as e:
        print(f"Lỗi cấu hình: {e}", file=sys.stderr)
        return 1
