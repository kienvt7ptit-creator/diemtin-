"""Thực thi hành động lên Meta, kiểm tra lại trạng thái ngay trước khi ghi."""
from __future__ import annotations

from .meta_api import MetaAPIError
from .notifier import money
from .state import State, now_utc


def execute(actions: list[dict], client, state: State, currency_offset: int) -> list[dict]:
    results = []
    for a in actions:
        res = {"id": a["id"], "obj_name": a["obj_name"], "action": a["action"], "ok": False, "msg": ""}
        try:
            live = client.get_object(a["obj_id"])
            if live.get("effective_status", live.get("status")) != "ACTIVE":
                res["msg"] = f"bỏ qua: hiện trạng thái {live.get('effective_status') or live.get('status')}"
                results.append(res)
                continue
            if a["action"] == "pause":
                client.set_status(a["obj_id"], "PAUSED")
                res["msg"] = "đã tắt"
            elif a["action"] in ("scale_budget", "reduce_budget"):
                live_budget = float(live.get("daily_budget") or 0) / currency_offset
                if a.get("current_budget") and abs(live_budget - a["current_budget"]) > 1:
                    res["msg"] = (f"bỏ qua: ngân sách đã bị đổi ({money(a['current_budget'])} → "
                                  f"{money(live_budget)}) kể từ lúc đề xuất")
                    results.append(res)
                    continue
                client.set_daily_budget(a["obj_id"], round(a["new_budget"] * currency_offset))
                res["msg"] = f"ngân sách {money(a['current_budget'])} → {money(a['new_budget'])}"
            else:
                res["msg"] = "không có gì để làm"
                results.append(res)
                continue
            res["ok"] = True
            state.mark_changed(a["obj_id"])
        except MetaAPIError as e:
            res["msg"] = f"lỗi: {e}"
        state.log({**a, "executed_at": now_utc().isoformat(), "ok": res["ok"], "result": res["msg"]})
        results.append(res)
    return results
