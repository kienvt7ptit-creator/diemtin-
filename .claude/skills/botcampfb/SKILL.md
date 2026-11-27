---
name: botcampfb
description: "botcampfb — trợ lý AI chạy camp quảng cáo Facebook (Meta Ads) tự động: đọc số liệu adset/ad qua Meta Marketing API, áp bộ luật để TẮT adset/ad đốt tiền, TĂNG/GIẢM ngân sách winner, cảnh báo tần suất/CPM/trần chi tiêu, có chốt an toàn (propose/approve/auto, cooldown, nhãn [GIỮ]); Claude phân tích số liệu tiếng Việt và viết content quảng cáo đúng chính sách Meta. Kèm sẵn code bot Python + lịch chạy GitHub Actions + báo Telegram. Dùng khi người dùng nói: botcampfb, bot camp, chạy camp fb, tối ưu camp, tắt/bật adset, scale ngân sách, CPL/CPR cao, đọc số liệu quảng cáo, phân tích Ads Manager, viết content/caption quảng cáo Facebook, đặt luật tự động cho quảng cáo, kết nối token Meta — kể cả khi chỉ dán bảng số liệu hay ảnh chụp Trình quản lý quảng cáo mà không nhắc tên skill."
---

# botcampfb: trợ lý AI chạy camp FB Ads

Skill này có 2 nửa:
1. **Bot thật** trong `scripts/` (Python). Bot đọc Meta API, áp luật và thực hiện thay đổi có chốt an toàn.
2. **Bộ não chạy camp** (phần dưới). Đây là cách đọc số, chẩn đoán và ra quyết định. Dùng được cả khi chưa có token: người dùng dán số liệu hoặc ảnh chụp là phân tích được.

Tài liệu thêm, đọc khi cần:
- `references/playbook.md`: ngưỡng tham khảo theo ngành, bảng chẩn đoán triệu chứng → nguyên nhân → việc cần làm, quy tắc scale. **Đọc trước khi phân tích hoặc sửa luật.**
- `references/setup.md`: lấy System User token, ID tài khoản, Telegram, GitHub Actions Secrets, xử lý lỗi Meta API thường gặp.

## Xác định người dùng đang cần gì

| Người dùng nói / gửi | Làm gì |
|---|---|
| Dán bảng số, file CSV export, ảnh chụp Ads Manager | Phân tích tay theo playbook (mục A) |
| "chạy bot", "check camp", có token/ID tài khoản | Chạy bot (mục B) |
| "viết content", "caption", brief dự án | Viết content (mục C) |
| "đổi ngưỡng", "thêm luật", "đừng tắt adset X" | Sửa `config.yaml` (mục D) |
| "cài đặt", "kết nối", "chạy tự động hằng ngày" | Theo `references/setup.md` |

Thiếu thông tin quan trọng thì hỏi gọn trong 1 câu: mục tiêu là lead, tin nhắn hay đơn hàng? CPR mục tiêu bao nhiêu? Tiền tệ gì? Còn không thì dùng mặc định trong `scripts/config.example.yaml` và nói rõ là đang dùng mặc định.

## A. Phân tích số liệu (không cần token)

1. Chuẩn hoá về các chỉ số: chi tiêu, kết quả, CPR (= chi/kết quả), CTR liên kết, CPM, tần suất, ROAS nếu có.
2. Đối chiếu với **bộ luật mặc định** (giống hệt bot, để kết luận tay và bot không lệch nhau):
   - Tắt: hôm nay chi ≥ 300k và 0 kết quả; hôm nay chi ≥ 500k và CPR > 250k; ad có ≥ 3.000 hiển thị, CTR < 0,6% và 0 kết quả.
   - Tăng 20%: 3 ngày gần nhất ≥ 5 kết quả, CPR ≤ 120k, tần suất < 2,5.
   - Giảm 30%: 3 ngày chi ≥ 1 triệu, CPR trong khoảng 180k–250k.
   - Cảnh báo: tần suất 7 ngày ≥ 3,5; CPM ≥ 150k khi có ≥ 2.000 hiển thị.

   Nếu người dùng đã có `config.yaml` riêng thì dùng ngưỡng của họ. Ngưỡng trên dành cho lead BĐS VND, ngành khác xem playbook.
3. Chẩn đoán *vì sao*, không chỉ *cái gì* (bảng trong playbook). Ví dụ: CTR tốt mà CPR cao thì vấn đề nằm ở form hoặc kịch bản tư vấn, không phải creative.
4. Báo cáo theo khung dưới đây, viết ngắn để đọc trên điện thoại, không dùng bảng markdown dài:

```
📊 Tổng quan: tổng chi, tổng KQ, CPR TB, so với mục tiêu
⛔ Nên tắt: tên · lý do bằng số
🚀 Nên tăng: tên · NS hiện tại → NS mới · lý do
🔻 Nên giảm / ⚠️ Theo dõi: ...
🔍 Chẩn đoán: 2-4 ý nguyên nhân gốc
✅ Việc làm ngay: tối đa 5 gạch đầu dòng
```
Chưa đủ dữ liệu (chi thấp, < 3 kết quả) thì nói thẳng "chưa đủ dữ liệu để kết luận", đừng gượng ra quyết định. Không bịa số.

## B. Chạy bot

Thư mục skill có thể là chỉ-đọc, nên copy ra chỗ làm việc trước (bot ghi state, config vào thư mục của nó):

```bash
cp -r <đường-dẫn-skill>/scripts ./fbads-bot && cd fbads-bot && pip install -r requirements.txt
python -m fbads_bot run --demo          # chạy thử với dữ liệu mẫu, không cần token
```

Nếu repo của người dùng đã có sẵn thư mục `fbads-bot/` thì dùng luôn thư mục đó, không copy đè, vì có thể đã chứa config và state riêng.

Lệnh (thêm `--demo` để thử):

| Lệnh | Tác dụng |
|---|---|
| `check` | Kiểm tra token + tài khoản, liệt kê số luật |
| `run` | Áp luật theo `mode` trong config |
| `run --mode auto` / `--mode approve` | Ghi đè chế độ |
| `run --ai` | Kèm phân tích Claude (cần `ANTHROPIC_API_KEY`) |
| `pending` · `approve <id…/all>` · `reject <id…/all>` | Duyệt lệnh chờ |
| `report` | Báo cáo AI, không thay đổi gì |
| `copy --brief "…" [--with-winners] [--n 5]` | AI viết content |

Thông tin bí mật đặt trong `.env` (copy từ `.env.example`): `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, tuỳ chọn thêm `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. Đừng bao giờ in token ra màn hình hay commit file `.env`.

**Về an toàn.** Bot thay đổi tiền thật, nên:
- Mặc định là `propose`. Chỉ chạy `--mode auto` hoặc `approve` khi người dùng yêu cầu rõ trong lượt hiện tại. Lần đầu kết nối tài khoản thật, luôn chạy `propose` trước, cho người dùng xem đề xuất rồi mới hỏi có thực hiện không.
- Khuyên lộ trình: 1 tuần `propose` để chỉnh ngưỡng → `approve` → `auto`.
- Chốt có sẵn: nhãn `[GIỮ]`/`[KEEP]` trong tên thì bot bỏ qua; cooldown 24h/đối tượng; tăng tối đa 20%/lần (tăng hơn dễ làm adset quay lại giai đoạn học); ngân sách sàn/trần; tối đa N hành động/lần; kiểm tra lại trạng thái thật trước khi ghi; không chỉnh ngân sách CBO.

Đọc kết quả bot và giải thích lại cho người dùng bằng lời thường: hành động nào, vì sao, và những gì bị bỏ qua (cooldown, CBO, nhãn bảo vệ).

## C. Viết content quảng cáo

Có API key thì có thể dùng `python -m fbads_bot copy --brief "…"`. Không có thì tự viết theo khung này, cho mỗi mẫu:
- Góc tiếp cận (nỗi đau / lợi ích / bằng chứng xã hội / khan hiếm có thật / câu chuyện)
- Primary text: câu đầu ≤ 125 ký tự là hook, tổng ≤ 600 ký tự, emoji vừa phải
- Headline ≤ 40 ký tự · Description ≤ 30 ký tự · nút CTA của Meta
- Gợi ý hình/video 1 dòng · tệp đối tượng để test

Tuân thủ chính sách Meta để tránh bị từ chối quảng cáo: không cam kết lợi nhuận hay tăng giá chắc chắn, không nhắm vào đặc điểm cá nhân ("Bạn đang nợ nần?"), không giật tít sai sự thật. BĐS chỉ ghi thông tin pháp lý khi brief có. Nếu biết ad nào đang có CPR tốt nhất thì học phong cách của nó, đừng chép.

## D. Sửa luật

Luật nằm trong `config.yaml` (copy từ `config.example.yaml`):

```yaml
- name: "Đốt tiền không ra kết quả"
  level: adset            # adset | ad
  window: today           # today | yesterday | last_3d | last_7d | last_14d | last_30d | this_month
  conditions: ["spend >= 300000", "results == 0"]   # tất cả phải đúng, dạng "chỉ_số toán_tử số"
  action: pause           # pause | scale_budget | reduce_budget | alert
  # percent: 20           # cho scale_budget / reduce_budget (chỉ level adset)
```
Chỉ số: `spend, impressions, reach, frequency, clicks, link_clicks, ctr (%), cpm, cpc, results, cpr, revenue, roas, daily_budget, spend_pct_budget`. "Kết quả" là tổng các `result_action_types` (lead, tin nhắn, mua hàng…). Một đối tượng khớp nhiều luật thì ưu tiên TẮT > GIẢM > TĂNG.

Sửa xong thì chạy `python -m fbads_bot check` để kiểm tra cú pháp, rồi `run --demo` hoặc `run` (propose) để xem tác động trước khi dùng thật. Tiền tệ không phải VND thì đặt `currency_offset` (USD = 100).
