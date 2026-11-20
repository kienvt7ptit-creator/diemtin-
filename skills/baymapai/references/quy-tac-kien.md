# Quy tắc edit cố định của Kiên (gộp từ Loại 2, Loại 3 và quy-tac-edit-kien.md)

Nếu project "sản xuất video" có `claude/quy-tac-edit-kien.md` bản mới hơn thì bản đó thắng file này.

## Giao tiếp
- Xưng "em – anh".
- Câu có ngày tháng/số liệu dễ lỗi thời → báo Kiên trước khi xuất.
- Nói sai số → ghép âm tiết đúng của chính Kiên. Sai dữ kiện → cắt và báo lại.
- Tên dự án sửa theo tên chính thức.

## Hình
- Không zoom A-roll. Không rung. Không chớp. Không icon neon. Không thanh tiến trình.
- Không khung bình chọn, không thanh comment cuối.
- Chữ không che mặt hay miệng.
- Vùng an toàn TikTok (khung 1080×1920): trên 0–230 bị che; dưới 1440–1920 bị che; cột phải x940–1080, y900–1440 bị che.
- BrandBug top 238 scale 0.75. LikeSub ở giây 10, `translateY(-1110px)`.
- Watermark kênh: "Kiên Bán Nhà" viết tay mờ hoặc BrandBug.

## Màu da
- Mặc định: `curves=all='0/0 0.5/0.53 1/1'`.
- Mặt tối: `curves=all='0/0 0.25/0.31 0.5/0.59 0.8/0.86 1/0.98'`.
- Cấm mức 0.5→0.69.
- Grade A-roll chuẩn: `scale=1080:1920,fps=30,curves…,eq=saturation=1.05:contrast=1.03`.

## Âm
- Voice: `highpass=f=90,afftdn,acompressor,loudnorm=I=-14`.
- Không SFX theo từng từ. Không đoạn B-roll im lặng.

## Độ dài & xuất
- Trên 1 phút.
- Remotion render với cache flag và `--timeout=120000`, nén crf 25.
- Gửi bằng SendUserFile, lưu Downloads; >25MB tách rồi concat. Ghi doc vào project.
