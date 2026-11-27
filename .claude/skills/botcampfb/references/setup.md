# Cài đặt và kết nối

## 1. Access Token Meta (khuyên dùng System User, không hết hạn)
1. business.facebook.com → Cài đặt doanh nghiệp → Người dùng → **Người dùng hệ thống** → Thêm (Admin).
2. **Chỉ định tài sản** → chọn tài khoản quảng cáo, quyền *Quản lý chiến dịch*.
3. developers.facebook.com → tạo App loại *Business*, gắn vào Business.
4. Quay lại System User → **Tạo mã mới** → chọn App → tick `ads_management`, `ads_read` → Hết hạn: *Không bao giờ*.
5. ID tài khoản quảng cáo: dạng `act_1234567890` trong Trình quản lý quảng cáo.

Chỉ cần đọc số (bot ở chế độ propose) thì `ads_read` là đủ. Muốn bot tự tắt/chỉnh ngân sách thì cần thêm `ads_management`.

## 2. Chạy trên máy
```bash
cp .env.example .env               # điền token + ID
cp config.example.yaml config.yaml # sửa ngưỡng
python -m fbads_bot check
python -m fbads_bot run
```

## 3. Telegram
@BotFather → `/newbot` → lấy token. Nhắn 1 tin cho bot, rồi mở `https://api.telegram.org/bot<TOKEN>/getUpdates` để lấy `chat.id`. Điền `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## 4. Chạy tự động trên GitHub Actions
- Đặt code ở thư mục `fbads-bot/` trong repo, workflow ở `.github/workflows/fbads-bot.yml`. Lịch `17 1-15/2 * * *` UTC tương đương 2 tiếng/lần, 8h–22h giờ VN.
- Repo → Settings → Secrets and variables → Actions: thêm `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` (+ tuỳ chọn `ANTHROPIC_API_KEY`, `TELEGRAM_*`).
- Commit `fbads-bot/config.yaml` (không chứa bí mật). State (cooldown, lệnh chờ) lưu qua actions/cache.
- Duyệt lệnh: tab Actions → FB Ads Bot → Run workflow → command `approve`, ids `all` hoặc danh sách id.
- Workflow chỉ chạy theo lịch khi nằm trên nhánh mặc định.

## 5. Lỗi Meta API thường gặp
| Mã | Ý nghĩa | Cách xử lý |
|---|---|---|
| 190 | Token hết hạn / sai | Tạo lại token System User |
| 200 / 10 | Thiếu quyền | Cấp `ads_management`/`ads_read`, chỉ định tài sản cho System User |
| 100 | Tham số sai (thường do sai ID tài khoản, ngân sách dưới mức tối thiểu) | Kiểm tra `act_` ID, mức ngân sách tối thiểu |
| 17 / 4 / 613 / 80004 | Bị giới hạn tốc độ | Bot tự thử lại; nếu vẫn lỗi thì giãn lịch chạy |
| 2635 / version | Phiên bản Graph API cũ | Đổi `api_version` trong config lên bản mới |
