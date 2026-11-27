"""Chuẩn hoá dữ liệu insights của Meta thành các chỉ số dễ đặt luật."""
from __future__ import annotations

from typing import Any

# Các chỉ số dùng được trong điều kiện luật
METRICS = {
    "spend", "impressions", "reach", "frequency", "clicks", "link_clicks", "ctr",
    "cpm", "cpc", "results", "cpr", "revenue", "roas", "daily_budget",
    "spend_pct_budget",
}


def _f(v: Any) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _sum_actions(items: list[dict] | None, types: list[str]) -> float:
    if not items:
        return 0.0
    wanted = set(types)
    return sum(_f(a.get("value")) for a in items if a.get("action_type") in wanted)


def normalize(row: dict, level: str, result_action_types: list[str],
              revenue_action_types: list[str] | None = None) -> dict:
    """Biến 1 dòng insights thành dict chỉ số. cpr/roas = None nếu không tính được."""
    spend = _f(row.get("spend"))
    impressions = _f(row.get("impressions"))
    link_clicks = _f(row.get("inline_link_clicks"))
    clicks = _f(row.get("clicks"))
    results = _sum_actions(row.get("actions"), result_action_types)
    revenue = _sum_actions(row.get("action_values"), revenue_action_types or [
        "offsite_conversion.fb_pixel_purchase", "purchase", "omni_purchase"])
    ctr = _f(row.get("inline_link_click_ctr")) if row.get("inline_link_click_ctr") is not None \
        else _f(row.get("ctr"))
    obj_id = row.get(f"{level}_id") or row.get("id")
    return {
        "id": obj_id,
        "name": row.get(f"{level}_name") or row.get("name") or obj_id,
        "level": level,
        "campaign_id": row.get("campaign_id"),
        "campaign_name": row.get("campaign_name", ""),
        "adset_id": row.get("adset_id"),
        "spend": spend,
        "impressions": impressions,
        "reach": _f(row.get("reach")),
        "frequency": _f(row.get("frequency")),
        "clicks": clicks,
        "link_clicks": link_clicks,
        "ctr": ctr,  # % (link CTR nếu có)
        "cpm": _f(row.get("cpm")) or (spend / impressions * 1000 if impressions else 0.0),
        "cpc": (spend / link_clicks) if link_clicks else None,
        "results": results,
        "cpr": (spend / results) if results else None,
        "revenue": revenue,
        "roas": (revenue / spend) if spend and revenue else None,
    }


def merge_objects(rows: list[dict], objects: list[dict], level: str, currency_offset: int) -> list[dict]:
    """Gắn trạng thái + ngân sách vào số liệu. Object ACTIVE nhưng chưa có số liệu vẫn được giữ (spend=0)."""
    by_id = {o["id"]: o for o in objects}
    seen = set()
    out = []
    for r in rows:
        o = by_id.get(r["id"], {})
        out.append(_attach(r, o, level, currency_offset))
        seen.add(r["id"])
    for oid, o in by_id.items():
        if oid in seen:
            continue
        empty = normalize({"id": oid, "name": o.get("name"),
                           "campaign_id": (o.get("campaign") or {}).get("id"),
                           "campaign_name": (o.get("campaign") or {}).get("name", ""),
                           "adset_id": o.get("adset_id")}, level, [])
        out.append(_attach(empty, o, level, currency_offset))
    return out


def _attach(r: dict, o: dict, level: str, offset: int) -> dict:
    r = dict(r)
    r["status"] = o.get("effective_status") or o.get("status") or "UNKNOWN"
    if not r.get("campaign_name"):
        r["campaign_name"] = (o.get("campaign") or {}).get("name", "")
    if level == "adset":
        if o.get("daily_budget"):
            r["daily_budget"] = _f(o["daily_budget"]) / offset
            r["budget_owner"] = "adset"
        elif (o.get("campaign") or {}).get("daily_budget"):
            r["daily_budget"] = _f(o["campaign"]["daily_budget"]) / offset
            r["budget_owner"] = "campaign"  # CBO
        elif o.get("lifetime_budget") or (o.get("campaign") or {}).get("lifetime_budget"):
            r["daily_budget"] = None
            r["budget_owner"] = "lifetime"
        else:
            r["daily_budget"] = None
            r["budget_owner"] = None
        r["spend_pct_budget"] = (r["spend"] / r["daily_budget"] * 100) if r.get("daily_budget") else None
    else:
        r["daily_budget"] = None
        r["budget_owner"] = None
        r["spend_pct_budget"] = None
    return r
