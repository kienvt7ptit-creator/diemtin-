"""Định dạng báo cáo và gửi Telegram (nếu có cấu hình)."""
from __future__ import annotations

import os

import requests

ICON = {"pause": "⛔ TẮT", "scale_budget": "🚀 TĂNG NS", "reduce_budget": "🔻 GIẢM NS", "alert": "⚠️"}


def money(v) -> str:
    return "-" if v is None else f"{float(v):,.0f}".replace(",", ".")


def fmt_metrics(m: dict) -> str:
    parts = [f"chi {money(m.get('spend'))}", f"KQ {m.get('results', 0):g}" if m.get("results") is not None else ""]
    if m.get("cpr") is not None:
        parts.append(f"CPR {money(m['cpr'])}")
    if m.get("ctr"):
        parts.append(f"CTR {m['ctr']:.2f}%")
    if m.get("frequency"):
        parts.append(f"tần suất {m['frequency']:.2f}")
    if m.get("roas"):
        parts.append(f"ROAS {m['roas']:.2f}")
    return ", ".join(p for p in parts if p)


def format_run(mode: str, actions: list[dict], alerts: list[dict], notes: list[str],
               results: list[dict] | None = None, account_name: str = "") -> str:
    head = {"propose": "ĐỀ XUẤT (chưa thực hiện)", "approve": "CHỜ DUYỆT",
            "auto": "ĐÃ TỰ ĐỘNG THỰC HIỆN"}.get(mode, mode)
    lines = [f"🤖 FB Ads Bot {('· ' + account_name) if account_name else ''}", f"Chế độ: {head}", ""]
    if not actions and not alerts:
        lines.append("✅ Không có gì cần xử lý. Mọi thứ trong ngưỡng.")
    elif not actions:
        lines.append("✅ Không có hành động nào cần làm.")
    by_id = {r["id"]: r for r in (results or [])}
    for a in actions:
        line = f"{ICON[a['action']]} [{a['id']}] {a['obj_name']}"
        if a.get("new_budget"):
            line += f": {money(a['current_budget'])} → {money(a['new_budget'])} (+{a['percent']:g}%)" \
                if a["action"] == "scale_budget" else \
                f": {money(a['current_budget'])} → {money(a['new_budget'])} (-{a['percent']:g}%)"
        lines.append(line)
        lines.append(f"   • Luật: {a['rule']} · {a['reason']}")
        lines.append(f"   • Số liệu: {fmt_metrics(a['metrics'])}")
        if a["id"] in by_id:
            r = by_id[a["id"]]
            lines.append(f"   • Kết quả: {'✅' if r['ok'] else '❌'} {r['msg']}")
    if alerts:
        lines += ["", "Cảnh báo:"]
        for a in alerts:
            lines.append(f"⚠️ {a['obj_name']}: {a['rule']} · {a['reason']} · {fmt_metrics(a['metrics'])}")
    if notes:
        lines += ["", "Ghi chú:"] + [f"· {n}" for n in notes[:15]]
    if mode == "approve" and actions:
        lines += ["", "Duyệt: python -m fbads_bot approve <id> | approve all"]
    return "\n".join(lines)


def send(text: str, quiet: bool = False) -> None:
    if not quiet:
        print(text)
    token, chat = os.getenv("TELEGRAM_BOT_TOKEN"), os.getenv("TELEGRAM_CHAT_ID")
    if not (token and chat):
        return
    for i in range(0, len(text), 3900):  # Telegram giới hạn 4096 ký tự/tin
        try:
            requests.post(f"https://api.telegram.org/bot{token}/sendMessage",
                          data={"chat_id": chat, "text": text[i:i + 3900],
                                "disable_web_page_preview": "true"}, timeout=20)
        except requests.RequestException as e:
            print(f"[telegram] gửi thất bại: {e}")
