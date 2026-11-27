"""Đọc config.yaml + biến môi trường (.env)."""
from __future__ import annotations

import os
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def load_config(path: str | None = None) -> dict:
    load_dotenv(ROOT / ".env")
    p = Path(path) if path else ROOT / "config.yaml"
    if not p.exists():
        fallback = ROOT / "config.example.yaml"
        print(f"[config] Không thấy {p.name}, dùng tạm {fallback.name}")
        p = fallback
    cfg = yaml.safe_load(p.read_text(encoding="utf-8")) or {}
    cfg.setdefault("mode", "propose")
    cfg.setdefault("api_version", "v24.0")
    cfg.setdefault("currency_offset", 1)
    cfg.setdefault("result_action_types", ["lead"])
    cfg.setdefault("guardrails", {})
    cfg.setdefault("rules", [])
    cfg.setdefault("state_file", "state/state.json")
    cfg["state_path"] = str((ROOT / cfg["state_file"]).resolve()) if not os.path.isabs(cfg["state_file"]) \
        else cfg["state_file"]
    if cfg["mode"] not in ("propose", "approve", "auto"):
        raise ValueError("mode phải là propose | approve | auto")
    return cfg
