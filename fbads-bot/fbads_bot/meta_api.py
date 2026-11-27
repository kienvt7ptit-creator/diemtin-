"""Client tối giản cho Meta (Facebook) Marketing API.

Chỉ dùng các endpoint cần cho bot:
- GET  /act_{id}/insights   : số liệu theo adset / ad
- GET  /act_{id}/adsets|ads : trạng thái, ngân sách
- POST /{object_id}         : đổi status (PAUSED/ACTIVE) hoặc daily_budget
"""
from __future__ import annotations

import json
import time
from typing import Any

import requests

# Mã lỗi Meta nên thử lại (rate limit / lỗi tạm thời)
RETRYABLE_CODES = {1, 2, 4, 17, 32, 341, 613, 80000, 80003, 80004}

INSIGHT_FIELDS = [
    "campaign_id", "campaign_name", "adset_id", "adset_name", "ad_id", "ad_name",
    "spend", "impressions", "reach", "frequency", "clicks", "inline_link_clicks",
    "inline_link_click_ctr", "ctr", "cpm", "cpc", "actions", "action_values",
    "purchase_roas",
]

OBJECT_FIELDS = {
    "adset": "id,name,status,effective_status,daily_budget,lifetime_budget,"
             "campaign{id,name,daily_budget,lifetime_budget}",
    "ad": "id,name,status,effective_status,adset_id,campaign{id,name}",
}


class MetaAPIError(Exception):
    def __init__(self, message: str, code: int | None = None, payload: Any = None):
        super().__init__(message)
        self.code = code
        self.payload = payload


class MetaClient:
    def __init__(self, access_token: str, ad_account_id: str, api_version: str = "v24.0",
                 timeout: int = 30, max_retries: int = 4, session: requests.Session | None = None):
        if not access_token:
            raise ValueError("Thiếu META_ACCESS_TOKEN")
        if not ad_account_id:
            raise ValueError("Thiếu META_AD_ACCOUNT_ID")
        self.token = access_token
        self.account = ad_account_id if ad_account_id.startswith("act_") else f"act_{ad_account_id}"
        self.base = f"https://graph.facebook.com/{api_version}"
        self.timeout = timeout
        self.max_retries = max_retries
        self.http = session or requests.Session()

    # ---------- low level ----------
    def _request(self, method: str, url: str, params: dict | None = None,
                 data: dict | None = None, add_token: bool = True) -> dict:
        params = dict(params or {})
        if add_token and data is None:
            params["access_token"] = self.token
        elif add_token:
            data = dict(data)
            data["access_token"] = self.token
        last_err: Exception | None = None
        for attempt in range(self.max_retries + 1):
            try:
                resp = self.http.request(method, url, params=params, data=data, timeout=self.timeout)
            except requests.RequestException as e:  # lỗi mạng
                last_err = e
            else:
                try:
                    body = resp.json()
                except ValueError:
                    body = {"error": {"message": resp.text[:300]}}
                if resp.ok and "error" not in body:
                    return body
                err = body.get("error", {})
                code = err.get("code")
                last_err = MetaAPIError(
                    f"Meta API {resp.status_code}: {err.get('message', 'unknown error')}"
                    f" (code={code}, subcode={err.get('error_subcode')})",
                    code=code, payload=err)
                if not (code in RETRYABLE_CODES or resp.status_code >= 500):
                    raise last_err
            if attempt < self.max_retries:
                time.sleep(min(60, 5 * 2 ** attempt))
        raise last_err  # type: ignore[misc]

    def _paged(self, path: str, params: dict) -> list[dict]:
        url = f"{self.base}/{path}"
        out: list[dict] = []
        body = self._request("GET", url, params=params)
        while True:
            out.extend(body.get("data", []))
            nxt = body.get("paging", {}).get("next")
            if not nxt:
                return out
            # link "next" đã kèm sẵn tham số (kể cả token)
            body = self._request("GET", nxt, add_token=False)

    # ---------- read ----------
    def check(self) -> dict:
        return self._request("GET", f"{self.base}/{self.account}",
                             params={"fields": "name,currency,account_status,timezone_name,amount_spent"})

    def insights(self, level: str, date_preset: str) -> list[dict]:
        return self._paged(f"{self.account}/insights", {
            "level": level,
            "date_preset": date_preset,
            "fields": ",".join(INSIGHT_FIELDS),
            "limit": 500,
            "filtering": json.dumps([{
                "field": f"{level}.effective_status", "operator": "IN",
                "value": ["ACTIVE"],
            }]),
        })

    def list_objects(self, level: str) -> list[dict]:
        edge = "adsets" if level == "adset" else "ads"
        return self._paged(f"{self.account}/{edge}", {
            "fields": OBJECT_FIELDS[level],
            "limit": 500,
            "effective_status": json.dumps(["ACTIVE"]),
        })

    def get_object(self, obj_id: str, fields: str = "id,name,status,effective_status,daily_budget") -> dict:
        return self._request("GET", f"{self.base}/{obj_id}", params={"fields": fields})

    # ---------- write ----------
    def set_status(self, obj_id: str, status: str) -> dict:
        assert status in ("PAUSED", "ACTIVE")
        return self._request("POST", f"{self.base}/{obj_id}", data={"status": status})

    def set_daily_budget(self, obj_id: str, api_amount: int) -> dict:
        return self._request("POST", f"{self.base}/{obj_id}", data={"daily_budget": str(int(api_amount))})
