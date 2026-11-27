"""Phần 'trợ lý AI': Claude đọc số liệu + đề xuất của bộ luật, viết phân tích và content quảng cáo.

AI chỉ PHÂN TÍCH và GỢI Ý. Mọi thay đổi trên tài khoản quảng cáo chỉ đi qua bộ luật + chốt an toàn.
"""
from __future__ import annotations

import json
import os

MODEL = os.getenv("FBADS_AI_MODEL", "claude-opus-5-5")

SYSTEM_ANALYST = """Bạn là chuyên gia chạy quảng cáo Facebook (Meta Ads) cho thị trường Việt Nam, \
đặc biệt là bất động sản và dịch vụ cần thu lead (form, tin nhắn, cuộc gọi).
Bạn nhận số liệu thật của tài khoản (JSON) và danh sách hành động mà bộ luật tự động đã đề xuất.
Nhiệm vụ: viết báo cáo ngắn gọn bằng tiếng Việt cho chủ tài khoản đọc trên điện thoại.

Cấu trúc:
1. Tổng quan (2-3 câu): tổng chi, tổng kết quả, CPR trung bình, xu hướng hôm nay so với 7 ngày.
2. Nhóm tốt: adset/ad đáng giữ hoặc tăng, kèm lý do bằng số.
3. Nhóm có vấn đề: nêu chẩn đoán cụ thể (CTR thấp → creative/hook yếu; CPM cao → tệp hẹp/cạnh tranh; \
CTR tốt nhưng CPR cao → landing/form/kịch bản tư vấn; tần suất cao → mỏi quảng cáo).
4. Nhận xét về các hành động bộ luật đề xuất: đồng ý hay cần cân nhắc, vì sao.
5. Việc nên làm tiếp (tối đa 5 gạch đầu dòng, hành động được ngay).

Quy tắc: chỉ dựa trên số liệu được cung cấp, không bịa số. Đơn vị tiền theo tài khoản. \
Nếu dữ liệu quá ít để kết luận (chi tiêu thấp, ít kết quả) thì nói rõ là chưa đủ dữ liệu. \
Không dùng markdown bảng; dùng gạch đầu dòng ngắn."""

SYSTEM_COPY = """Bạn là copywriter quảng cáo Facebook cho thị trường Việt Nam. \
Viết content tuân thủ Chính sách quảng cáo của Meta: không cam kết lợi nhuận chắc chắn, không phóng đại \
sai sự thật, không nhắm vào đặc điểm cá nhân của người xem ("Bạn đang nợ nần?"), không giật tít gây hiểu lầm. \
Với bất động sản: không hứa hẹn tăng giá, ghi rõ thông tin pháp lý nếu brief có."""


def _client():
    import anthropic  # import muộn: bot vẫn chạy được khi không dùng AI
    return anthropic.Anthropic()


def _ask(system: str, user: str, effort: str = "medium", max_tokens: int = 16000) -> str:
    import anthropic
    client = _client()
    try:
        with client.beta.messages.stream(
            model=MODEL,
            max_tokens=max_tokens,
            system=system,
            output_config={"effort": effort},
            # Nếu model từ chối vì bộ lọc an toàn, API tự chạy lại trên model dự phòng phù hợp
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            messages=[{"role": "user", "content": user}],
        ) as stream:
            msg = stream.get_final_message()
    except (anthropic.AuthenticationError, TypeError):
        # TypeError: SDK không tìm thấy thông tin xác thực nào
        return "[AI] Thiếu hoặc sai ANTHROPIC_API_KEY (đặt trong .env hoặc GitHub Secrets)."
    except anthropic.RateLimitError:
        return "[AI] Đang bị giới hạn tốc độ, thử lại sau."
    except anthropic.APIStatusError as e:
        return f"[AI] Lỗi API {e.status_code}: {e.message}"
    except anthropic.APIConnectionError:
        return "[AI] Không kết nối được tới Anthropic API."
    if msg.stop_reason == "refusal":
        return "[AI] Yêu cầu bị từ chối bởi bộ lọc an toàn."
    text = "".join(b.text for b in msg.content if b.type == "text").strip()
    if msg.stop_reason == "max_tokens":
        text += "\n[AI] (bị cắt do đạt giới hạn độ dài)"
    return text


def _compact(rows: list[dict], top: int = 40) -> list[dict]:
    keep = ["name", "campaign_name", "status", "spend", "results", "cpr", "ctr", "cpm",
            "frequency", "roas", "daily_budget", "budget_owner"]
    rows = sorted(rows, key=lambda r: r.get("spend", 0), reverse=True)[:top]
    return [{k: (round(r[k], 2) if isinstance(r.get(k), float) else r.get(k)) for k in keep if k in r}
            for r in rows]


def analyze(data: dict, actions: list[dict], alerts: list[dict], account: dict, cfg: dict) -> str:
    payload = {
        "tai_khoan": account,
        "loai_ket_qua": cfg.get("result_action_types"),
        "muc_tieu": cfg.get("goals", {}),
        "adset_hom_nay": _compact(data.get(("adset", "today"), [])),
        "adset_7_ngay": _compact(data.get(("adset", "last_7d"), [])),
        "ad_hom_nay": _compact(data.get(("ad", "today"), []), top=25),
        "hanh_dong_bo_luat_de_xuat": [
            {k: a[k] for k in ("action", "obj_name", "rule", "reason", "current_budget", "new_budget")}
            for a in actions],
        "canh_bao": [{k: a[k] for k in ("obj_name", "rule", "reason")} for a in alerts],
    }
    return _ask(SYSTEM_ANALYST,
                "Số liệu tài khoản:\n```json\n" + json.dumps(payload, ensure_ascii=False, indent=1) + "\n```")


def write_copies(brief: str, n: int = 5, winners: list[dict] | None = None) -> str:
    extra = ""
    if winners:
        extra = ("\n\nCác quảng cáo đang hiệu quả nhất (học phong cách, đừng chép):\n"
                 + json.dumps(winners, ensure_ascii=False, indent=1))
    prompt = (f"Brief sản phẩm/dự án:\n{brief}{extra}\n\n"
              f"Viết {n} mẫu quảng cáo khác nhau về góc tiếp cận (nỗi đau, lợi ích, bằng chứng xã hội, "
              "khan hiếm có thật, câu chuyện). Mỗi mẫu gồm:\n"
              "- Góc tiếp cận\n- Primary text (≤ 125 ký tự cho câu đầu, tổng ≤ 600 ký tự, có emoji vừa phải)\n"
              "- Headline (≤ 40 ký tự)\n- Description (≤ 30 ký tự)\n- CTA đề xuất (nút của Meta)\n"
              "- Gợi ý hình/video 1 dòng\n- Tệp đối tượng gợi ý để test")
    return _ask(SYSTEM_COPY, prompt, effort="medium")
