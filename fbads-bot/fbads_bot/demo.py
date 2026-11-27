"""Client giả lập đọc dữ liệu mẫu: chạy thử bot khi chưa có token Meta."""
from __future__ import annotations

import copy
import json
from pathlib import Path

FIXTURE = Path(__file__).resolve().parent.parent / "fixtures" / "demo.json"


class DemoClient:
    def __init__(self, path: Path = FIXTURE):
        self.data = json.loads(Path(path).read_text(encoding="utf-8"))
        self.writes: list[tuple] = []

    def check(self) -> dict:
        return self.data["account"]

    def insights(self, level: str, date_preset: str) -> list[dict]:
        by_level = self.data["insights"][level]
        return copy.deepcopy(by_level.get(date_preset) or by_level["today"])

    def list_objects(self, level: str) -> list[dict]:
        return copy.deepcopy(self.data["objects"][level])

    def get_object(self, obj_id: str, fields: str = "") -> dict:
        for lvl in ("adset", "ad"):
            for o in self.data["objects"][lvl]:
                if o["id"] == obj_id:
                    return o
        return {"id": obj_id, "effective_status": "UNKNOWN"}

    def set_status(self, obj_id: str, status: str) -> dict:
        self.writes.append(("status", obj_id, status))
        self.get_object(obj_id)["effective_status"] = status
        return {"success": True}

    def set_daily_budget(self, obj_id: str, api_amount: int) -> dict:
        self.writes.append(("daily_budget", obj_id, api_amount))
        self.get_object(obj_id)["daily_budget"] = str(api_amount)
        return {"success": True}
