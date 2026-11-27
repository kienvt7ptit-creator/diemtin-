"""Lưu trạng thái giữa các lần chạy: lần đổi gần nhất (cooldown), lệnh chờ duyệt, lịch sử."""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class State:
    def __init__(self, path: str | os.PathLike):
        self.path = Path(path)
        self.data = {"last_change": {}, "pending": {}, "history": []}
        if self.path.exists():
            try:
                self.data.update(json.loads(self.path.read_text(encoding="utf-8")))
            except (ValueError, OSError):
                pass  # file hỏng -> bắt đầu lại, không chặn bot

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.data["history"] = self.data["history"][-500:]
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(self.path)

    # cooldown
    def last_change(self, obj_id: str) -> datetime | None:
        v = self.data["last_change"].get(obj_id)
        return datetime.fromisoformat(v) if v else None

    def mark_changed(self, obj_id: str, when: datetime | None = None) -> None:
        self.data["last_change"][obj_id] = (when or now_utc()).isoformat()

    # pending approvals
    def add_pending(self, action: dict) -> None:
        self.data["pending"][action["id"]] = action

    def pop_pending(self, action_id: str) -> dict | None:
        return self.data["pending"].pop(action_id, None)

    @property
    def pending(self) -> dict:
        return self.data["pending"]

    def log(self, entry: dict) -> None:
        self.data["history"].append(entry)
