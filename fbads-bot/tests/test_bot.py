from datetime import timedelta

import pytest

from fbads_bot.cli import collect, main
from fbads_bot.config import load_config
from fbads_bot.demo import DemoClient
from fbads_bot.executor import execute
from fbads_bot.metrics import normalize
from fbads_bot.rules import RuleError, evaluate, parse_condition, parse_rules
from fbads_bot.state import State, now_utc


@pytest.fixture
def cfg():
    return load_config()


@pytest.fixture
def data(cfg):
    rules = parse_rules(cfg["rules"])
    return collect(DemoClient(), cfg, {(r.level, r.window) for r in rules} | {("adset", "today")})


def run(cfg, data, tmp_path, guard=None):
    rules = parse_rules(cfg["rules"])
    state = State(tmp_path / "s.json")
    acts, alerts, notes = evaluate(rules, data, guard or cfg["guardrails"], state)
    return {a.obj_name: a for a in acts}, alerts, notes, state


def test_parse_condition():
    assert parse_condition("spend >= 200000") == ("spend", ">=", 200000.0)
    assert parse_condition(" ctr<0.6 ") == ("ctr", "<", 0.6)
    with pytest.raises(RuleError):
        parse_condition("spend >= abc")
    with pytest.raises(RuleError):
        parse_condition("lợi_nhuận > 1")


def test_rule_validation():
    with pytest.raises(RuleError):
        parse_rules([{"name": "x", "level": "ad", "action": "scale_budget", "percent": 10,
                      "conditions": ["spend > 1"]}])
    with pytest.raises(RuleError):
        parse_rules([{"name": "x", "action": "pause", "conditions": []}])


def test_normalize_results_and_cpr():
    m = normalize({"adset_id": "1", "adset_name": "a", "spend": "300000", "impressions": "10000",
                   "inline_link_clicks": "100",
                   "actions": [{"action_type": "lead", "value": "2"},
                               {"action_type": "link_click", "value": "100"}]},
                  "adset", ["lead"])
    assert m["results"] == 2 and m["cpr"] == 150000 and m["cpc"] == 3000


def test_demo_decisions(cfg, data, tmp_path):
    acts, alerts, notes, _ = run(cfg, data, tmp_path)
    assert acts["Tệp 25-45 Hà Nội"].action == "pause"
    # khớp cả pause (today) và reduce (3 ngày) -> pause thắng
    assert acts["Sở thích đầu tư BĐS"].action == "pause"
    assert acts["Ảnh phối cảnh tĩnh"].action == "pause"
    scale = acts["Lookalike 1% khách cũ"]
    assert scale.action == "scale_budget" and scale.new_budget == 960000
    assert "[GIỮ] Remarketing web 30 ngày" not in acts  # nhãn bảo vệ
    assert "Broad toàn quốc" not in acts  # CBO
    assert any("CBO" in n for n in notes)
    assert {a.rule for a in alerts} >= {"Mỏi quảng cáo (tần suất cao)", "CPM cao bất thường"}


def test_scale_clamped_by_guardrails(cfg, data, tmp_path):
    guard = dict(cfg["guardrails"], max_scale_percent=10, max_daily_budget=850000)
    acts, *_ = run(cfg, data, tmp_path, guard)
    a = acts["Lookalike 1% khách cũ"]
    assert a.percent == 10 and a.new_budget == 850000


def test_cooldown_and_action_limit(cfg, data, tmp_path):
    rules = parse_rules(cfg["rules"])
    state = State(tmp_path / "s.json")
    state.mark_changed("as1", now_utc() - timedelta(hours=2))
    acts, _, notes = evaluate(rules, data, dict(cfg["guardrails"], max_actions_per_run=2), state)
    assert all(a.obj_id != "as1" for a in acts)
    assert len(acts) == 2 and all(a.action == "pause" for a in acts)
    assert any("cooldown" in n for n in notes) and any("Giới hạn" in n for n in notes)


def test_spend_cap_alert(cfg, data, tmp_path):
    _, alerts, *_ = run(cfg, data, tmp_path, dict(cfg["guardrails"], account_daily_spend_cap=1000000))
    assert alerts[0].obj_id == "account"


def test_execute_rechecks_live_budget(cfg, data, tmp_path):
    acts, _, _, state = run(cfg, data, tmp_path)
    client = DemoClient()
    client.get_object("as2")["daily_budget"] = "700000"  # ai đó vừa sửa tay
    res = execute([acts["Lookalike 1% khách cũ"].to_dict(), acts["Tệp 25-45 Hà Nội"].to_dict()],
                  client, state, 1)
    assert not res[0]["ok"] and "đã bị đổi" in res[0]["msg"]
    assert res[1]["ok"] and client.writes == [("status", "as1", "PAUSED")]
    assert state.last_change("as1") is not None


def test_cli_demo_run(capsys):
    assert main(["run", "--demo"]) == 0
    out = capsys.readouterr().out
    assert "ĐỀ XUẤT" in out and "TĂNG NS" in out


class _Resp:
    def __init__(self, status, body):
        self.status_code, self._body, self.text = status, body, ""
        self.ok = status < 400

    def json(self):
        return self._body


class _Session:
    def __init__(self, responses):
        self.responses, self.calls = list(responses), []

    def request(self, method, url, params=None, data=None, timeout=None):
        self.calls.append((method, url, params, data))
        return self.responses.pop(0)


def test_meta_client_paging_retry_and_write(monkeypatch):
    from fbads_bot import meta_api
    monkeypatch.setattr(meta_api.time, "sleep", lambda s: None)
    sess = _Session([
        _Resp(400, {"error": {"code": 17, "message": "User request limit reached"}}),
        _Resp(200, {"data": [{"adset_id": "1"}], "paging": {"next": "https://graph.facebook.com/next"}}),
        _Resp(200, {"data": [{"adset_id": "2"}]}),
        _Resp(200, {"success": True}),
        _Resp(400, {"error": {"code": 100, "message": "Invalid parameter"}}),
    ])
    c = meta_api.MetaClient("tok", "123", session=sess)
    rows = c.insights("adset", "today")
    assert [r["adset_id"] for r in rows] == ["1", "2"]
    method, url, params, _ = sess.calls[0]
    assert url.endswith("/act_123/insights") and params["level"] == "adset" and params["access_token"] == "tok"
    assert "access_token" not in (sess.calls[2][2] or {})  # link next đã có sẵn token
    c.set_daily_budget("1", 960000)
    assert sess.calls[3][3] == {"daily_budget": "960000", "access_token": "tok"}
    with pytest.raises(meta_api.MetaAPIError):  # lỗi không thử lại được -> raise ngay
        c.set_status("1", "PAUSED")
