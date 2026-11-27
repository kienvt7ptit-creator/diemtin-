# 🤖 FB Ads Bot: Trợ lý AI chạy camp quảng cáo Facebook tự động

Bot đọc số liệu tài khoản quảng cáo qua **Meta Marketing API**, so với **bộ luật** bạn đặt trong `config.yaml`
rồi **tắt adset/ad đốt tiền** và **tăng/giảm ngân sách** adset theo hiệu quả. Kết quả gửi báo cáo về Telegram.
**Claude (AI)** phân tích số liệu bằng tiếng Việt và viết content quảng cáo mới.

> An toàn trước tiên: mặc định bot ở chế độ `propose`, **chỉ đề xuất, không đụng vào camp**.
> AI chỉ phân tích và gợi ý. Mọi thay đổi trên tài khoản chỉ đi qua bộ luật và các chốt an toàn.

## Bot làm được gì

| Việc | Cách làm |
|---|---|
| Tắt adset/ad kém | Ví dụ: chi ≥ 300k mà 0 kết quả, CPR > 250k, CTR < 0,6% |
| Tăng ngân sách winner | Ví dụ: 3 ngày ≥ 5 kết quả, CPR ≤ 120k, tần suất < 2,5 → +20% |
| Giảm ngân sách | CPR 3 ngày hơi cao → −30% |
| Cảnh báo | Tần suất cao (mỏi quảng cáo), CPM bất thường, vượt trần chi tiêu tài khoản |
| Phân tích AI | Tổng quan, nhóm tốt/xấu, chẩn đoán nguyên nhân, việc nên làm |
| Viết content AI | 5 mẫu quảng cáo theo nhiều góc, đúng chính sách Meta, học từ ad đang hiệu quả |

**Các chốt an toàn** (trong `guardrails`): nhãn `[GIỮ]`/`[KEEP]` để bot không đụng vào, cooldown 24h/đối tượng,
trần % tăng/giảm, ngân sách sàn/trần, tối đa N hành động/lần. Trước khi ghi, bot đọc lại trạng thái thật:
nếu bạn vừa sửa tay ngân sách thì bot bỏ qua. Bot không chỉnh ngân sách CBO (ngân sách cấp campaign).

## 1. Chạy thử ngay (không cần token)

```bash
cd fbads-bot
pip install -r requirements.txt
python -m fbads_bot run --demo
```

## 2. Kết nối tài khoản thật

**a) Lấy Access Token (khuyên dùng System User, token không hết hạn):**
1. Vào [business.facebook.com](https://business.facebook.com) → Cài đặt doanh nghiệp → Người dùng → **Người dùng hệ thống** → Thêm (vai trò Admin).
2. **Chỉ định tài sản**: chọn tài khoản quảng cáo, quyền *Quản lý chiến dịch*.
3. Tạo App tại [developers.facebook.com](https://developers.facebook.com) (loại *Business*), gắn vào Business.
4. Quay lại System User → **Tạo mã mới** → chọn App → tick `ads_management`, `ads_read` → Hết hạn: *Không bao giờ*.

**b) ID tài khoản quảng cáo:** trong Trình quản lý quảng cáo, dạng `act_1234567890`.

**c) Tạo file cấu hình:**
```bash
cp .env.example .env               # điền META_ACCESS_TOKEN, META_AD_ACCOUNT_ID
cp config.example.yaml config.yaml # sửa ngưỡng cho hợp ngành của bạn
python -m fbads_bot check          # kiểm tra kết nối
python -m fbads_bot run            # chạy chế độ đề xuất
```

## 3. Các lệnh

| Lệnh | Tác dụng |
|---|---|
| `run` | Chạy bộ luật theo `mode` trong config |
| `run --mode auto` | Tự thực hiện luôn |
| `run --ai` | Kèm phân tích của Claude |
| `pending` | Xem các đề xuất chờ duyệt (mode `approve`) |
| `approve <id> [id...]` / `approve all` | Duyệt và thực thi |
| `reject <id>` / `reject all` | Huỷ đề xuất |
| `report` | Báo cáo AI, không thay đổi gì |
| `copy --brief "Dự án X, căn 2PN từ 2 tỷ, ..." --with-winners` | AI viết 5 mẫu content |

Thêm `--demo` vào hầu hết các lệnh để thử với dữ liệu mẫu.

## 4. Lộ trình bật tự động (khuyên dùng)

1. **Tuần 1, `mode: propose`**: đọc đề xuất mỗi ngày, chỉnh ngưỡng trong `config.yaml` tới khi bạn đồng ý ≥ 90%.
2. **Tuần 2, `mode: approve`**: bot lưu đề xuất, bạn duyệt bằng `approve`.
3. **Sau đó, `mode: auto`**: bot tự xử lý, bạn chỉ đọc báo cáo Telegram.

## 5. Chạy tự động trên GitHub Actions (miễn phí)

File `.github/workflows/fbads-bot.yml` chạy bot khoảng 2 tiếng/lần, từ 8h đến 22h giờ Việt Nam.
1. Repo → **Settings → Secrets and variables → Actions** → thêm `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`
   (tuỳ chọn: `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
2. Commit `fbads-bot/config.yaml` (không chứa bí mật) để đặt luật. Nếu không có, bot dùng `config.example.yaml`.
3. Duyệt hoặc chạy tay: tab **Actions → FB Ads Bot → Run workflow**, chọn lệnh `approve`/`report`...

Chưa thêm Secrets thì workflow tự bỏ qua, không báo lỗi.

**Telegram:** nhắn [@BotFather](https://t.me/BotFather) → `/newbot` để lấy token. Nhắn 1 tin cho bot,
rồi mở `https://api.telegram.org/bot<TOKEN>/getUpdates` để lấy `chat.id`.

## 6. Viết luật

```yaml
- name: "Đốt tiền không ra kết quả"
  level: adset          # adset | ad
  window: today         # today | yesterday | last_3d | last_7d | last_14d | last_30d | this_month
  conditions: ["spend >= 300000", "results == 0"]   # tất cả phải đúng
  action: pause         # pause | scale_budget | reduce_budget | alert
  # percent: 20         # dùng cho scale_budget / reduce_budget
```
Chỉ số: `spend, impressions, reach, frequency, clicks, link_clicks, ctr (%), cpm, cpc, results, cpr, revenue, roas, daily_budget, spend_pct_budget`.
"Kết quả" (`results`) là tổng các loại hành động bạn khai trong `result_action_types` (lead, tin nhắn, mua hàng...).

## Cấu trúc

```
fbads-bot/
├── fbads_bot/
│   ├── meta_api.py     # gọi Meta Marketing API (retry, phân trang)
│   ├── metrics.py      # chuẩn hoá chỉ số: CPR, CTR, ROAS...
│   ├── rules.py        # bộ máy luật + chốt an toàn
│   ├── executor.py     # thực thi, kiểm tra lại trước khi ghi
│   ├── ai_advisor.py   # Claude: phân tích + viết content
│   ├── notifier.py     # báo cáo + Telegram
│   ├── state.py        # cooldown, lệnh chờ duyệt, lịch sử
│   └── cli.py          # dòng lệnh
├── config.example.yaml
├── fixtures/demo.json  # dữ liệu mẫu
└── tests/
```

Chạy test: `python -m pytest -q`
