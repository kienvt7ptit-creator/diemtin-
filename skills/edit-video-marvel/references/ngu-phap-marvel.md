# Ngữ pháp trailer siêu anh hùng — chi tiết kỹ thuật

Mọi số frame tính ở 30fps. Thời điểm tính theo giây thực trước, chỉ quy ra frame khi đưa vào Remotion.

## 1. Năm hồi và thông số

| Hồi | Tỉ lệ thời lượng (video 75s) | Độ dài cảnh | Nhạc | Hiệu ứng chính (thẻ video-shotcraft) |
|---|---|---|---|---|
| 1. Cold open | 0–5s | 9f mỗi cảnh ×3, đen 6f | im hoặc 1 tiếng drone | `trailer-grammar-moves` (A), `edit-hook-moves` |
| 2. Thẻ thương hiệu | 5–10s | ảnh lật 2–3f/ảnh trong 1,5s | braam + hit | `brand-frame-snap`, `logo-shrink-wordmark-lockup`, `panel-grid-moves` (lưới ô truyện tranh) |
| 3. Dựng tình huống | 10–28s | 3–5s | pad + ostinato thấp | `crane-rise-reveal`, `depth-layer-moves`, `light-play-moves`, `letterspace-materialize` |
| 4. Leo thang | 28–60s | 2s → 1s → 0,5 phách | trống vào, riser | `beat-cut-moves`, `montage-rhythm-moves`, `speed-ramp-freeze`, `trailer-grammar-moves` (B), `quad-split-parallel-scenes`, `rhythm-interrupt-moves` |
| 5. Đỉnh & chốt | 60–75s+ | đỉnh 0,5 phách → tĩnh 3s | full orchestra → sub-drop → im | `trailer-grammar-moves` (C smash cut), `slam-entrance-moves`, `text-as-mask`, `grain-dissolve` |

Video M2 (talking-head) dài 1:45–2:20: hồi 1–2 giữ nguyên (~10s), thân bài là Loại 2/Loại 3, chèn 2–3 "khoảnh khắc trailer" (thẻ chữ đen + B-roll beat-cut 4–6s) ở ý đắt, outro hồi 5 rút gọn 8–10s.

## 2. Kho hiệu ứng được phép

| Hiệu ứng | Làm thế nào | Giới hạn theo quy tắc Kiên |
|---|---|---|
| Speed ramp | 100% → 30% trong 6f quanh khoảnh khắc, giữ 0,5–1s, về 100%; Remotion `playbackRate` theo đoạn hoặc ffmpeg `setpts` tách đoạn | chỉ B-roll; nguồn nên 50/60fps |
| Freeze frame | `speed-ramp-freeze`: dừng 1 frame 0,6–1s + tiêu đề slam | không trên A-roll đang nói |
| Push-in chậm | scale 1→1.06 trong cả cảnh | **B-roll/ảnh** chỉ; A-roll không zoom |
| Crash zoom | `crash-zoom-punch` 1→1.35 trong 4f | chỉ ảnh/B-roll, không rung kèm |
| Parallax 2.5D | tách lớp ảnh (media-use remove background / Canva separate-image-layers), lớp trước 1.08, lớp sau 1.02 | — |
| Letterbox 2.39:1 | 2 thanh đen trượt vào 10f | chỉ cảnh điện ảnh không phụ đề |
| Light leak | Remotion `light-leaks.md`, opacity ≤ 0.35, ≥ 8f | không dùng như chớp |
| Dip to black | 4–6f | thay cho flash trắng |
| Smash cut | cắt cứng từ chuyển động mạnh nhất sang khung tĩnh | đúng hit cuối |
| Ô truyện tranh | `panel-grid-moves`, viền đen 8px, 2–4 ô, mỗi ô 1 cảnh | — |
| Text mask | chữ tên dự án làm cửa sổ chứa flycam (`text-as-mask`) | — |
| Grain | lớp phủ cố định opacity 0.04–0.06 | — |

**Cấm mặc định:** camera shake, strobe/flash trắng, glitch RGB nặng, icon neon, chữ bay nhảy theo từng từ. Chỉ mở khi Kiên ghi rõ, và vẫn không áp lên A-roll.

## 3. Màu
- B-roll: teal vùng tối, cam vùng sáng, tương phản 1.06–1.1, saturation 1.05, vignette 0.15–0.25.
  `ffmpeg … -vf "colorbalance=rs=.04:bs=-.04:rh=-.03:bh=.05,eq=contrast=1.08:saturation=1.05,vignette=PI/5"`
- A-roll: chỉ curves da Kiên + `eq=saturation=1.05:contrast=1.03`, tối đa thêm `colorbalance` một nửa mức trên. Da luôn ưu tiên.
- Bảng màu đồ họa: đỏ thương hiệu #C8102E, đen #0B0B0C (không dùng #000 cho nền chữ, trừ khung đen cold open), trắng kem #F4F1EA, bạc #C9CED6, vàng nhấn #F2B705 cho con số.

## 4. Chữ
- Display: Anton / Bebas Neue / Oswald 700, in hoa, tracking 0.04–0.12em.
- Kicker: Oswald 500, 28–34px, tracking 0.3em.
- Phụ đề: theo Loại 2/3.
- Kim loại: `linear-gradient(180deg,#FFFFFF 0%,#C9CED6 45%,#6E7480 55%,#E8EBF0 100%)` + `-webkit-background-clip:text` + text-stroke 1.5px rgba(0,0,0,.6) + drop-shadow 0 6px 18px rgba(0,0,0,.55).

## 5. Âm thanh (chi tiết)
| Thời điểm | Âm | Mức |
|---|---|---|
| Cold open cảnh 1–3 | whoosh ngắn mỗi cut | -18 dB |
| Đen 6f | im hoàn toàn | — |
| Thẻ thương hiệu | braam + boom | -10 dB |
| Hồi 3 | BGM pad | -24 LUFS dưới voice |
| Trước mỗi đỉnh | riser 2–4s | tăng dần đến -12 dB |
| Tiêu đề slam | hit/impact | -12 dB |
| Smash cut | sub-drop rồi im 0,5–1s | -10 dB |
| Outro | BGM sting cuối, fade 1,7s | — |

SFX quản lý trong một bảng `{from, src, volume}[]` ở file Main, không rải trong component (shotcraft `sound-design.md` S2). Không dùng âm thanh kiểu game/cartoon.

## 6. Hook & tiêu đề mẫu (BĐS)
- "Một dự án… sẽ thay đổi cả bờ Đông."
- "Họ nói thị trường đóng băng. Họ đã sai."
- "Chương I: Vị trí. Chương II: Tiến độ. Chương III: Giá."
- Tiêu đề video: "[Tên dự án] – Bom tấn bờ Đông 2026?", "Trailer [dự án]: cơ hội hay cái bẫy?"
- Thẻ cuối: "MỞ BÁN · 12.2026", "COMING SOON", "Phần 2: Bảng giá chi tiết".
