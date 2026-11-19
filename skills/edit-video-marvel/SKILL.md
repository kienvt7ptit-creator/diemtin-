---
name: "edit-video-marvel"
description: "Dựng video cho Kiên theo phong cách trailer điện ảnh siêu anh hùng (kiểu Marvel): hook cold-open, nhạc epic dựng dần, cắt theo beat, speed ramp, tiêu đề slam kim loại, letterbox, grade teal–orange, kết bằng thẻ thương hiệu. Gộp toàn bộ kỹ năng đã huấn luyện (Loại 2 YouTube/Shorts, Loại 3 TikTok/Facebook, quy tắc edit Kiên, video-shotcraft, Remotion, HyperFrames, media-use, vidIQ, ElevenLabs, Canva, Drive, Notion). Dùng khi Kiên nói: edit video Marvel, làm kiểu trailer Marvel/Avengers, video siêu anh hùng, video epic/điện ảnh hoành tráng, teaser dự án kiểu phim bom tấn, làm giống video biệt thự rừng / xen kẽ talking head BĐS với ảnh phối cảnh, chữ to kiểu số lăn – chữ viết tay – thẻ ảnh nổi."
---

# Edit video Marvel — trailer bom tấn cho Kiên

Xưng **"em – anh"**. Mục tiêu: biến cảnh quay của Kiên (dự án BĐS, đời thường, talking-head) thành một video có **ngữ pháp trailer phim siêu anh hùng**: mở bằng cú hook lạnh, nhạc dựng dần lên đỉnh, cắt đúng phách, tiêu đề đập mạnh, kết bằng thẻ thương hiệu riêng của Kiên.

Đọc thêm khi cần:
- `references/ngu-phap-marvel.md` — cấu trúc 5 hồi, kho hiệu ứng, bảng màu, font, thông số chuẩn.
- `references/ban-do-skill-plugin.md` — skill/plugin nào làm bước nào, gọi thế nào, lỗi hay gặp.
- `references/quy-tac-kien.md` — toàn bộ quy tắc cố định của Kiên (bắt buộc đọc trước khi dựng).
- `references/mau-xen-ke-talking-head-bds.md` — **mẫu học từ video Biệt thự Rừng**: dòng thời gian từng giây, 12 hiệu ứng chữ (T1–T12), 8 kỹ thuật B-roll (B1–B8), 7 chuyển cảnh (X1–X7), cấu trúc nhạc/SFX, bảng màu và font đo từ video.
- `templates/` — component Remotion mẫu:
  - Trailer: `MarvelTitle.tsx`, `Letterbox.tsx`, `BrandFlip.tsx`, `beats.py`.
  - Mẫu xen kẽ: `TextFx.tsx` (TypeOn, BlurIn, NumberRoll, KeywordStack, CtaLock, bảng COLORS/FONTS), `BrollFx.tsx` (KenBurns, FloatCard, CardGrid, whipStyle, LeakFlash, SoftLeak), `fonts.ts` (nạp Anton, Montserrat, Great Vibes, Be Vietnam Pro có tiếng Việt).

## 0. Bản quyền & thương hiệu (luôn áp dụng)
- **Chỉ học phong cách, không lấy tài sản của Marvel/Disney.** Không dùng logo "MARVEL STUDIOS", không dùng nhạc chính thức (Avengers theme…), không chèn cảnh phim, không dùng tên/trang phục nhân vật làm hình ảnh chính.
- Intro kiểu "lật trang truyện tranh + khối chữ đỏ" phải ra **thẻ thương hiệu của Kiên** ("KIÊN BÁN NHÀ" hoặc tên dự án), dùng ảnh/clip của chính Kiên — xem `templates/BrandFlip.tsx`.
- Nhạc: chỉ lấy từ catalog có bản quyền (media-use `--type bgm`, vidIQ `generate_music`, ElevenLabs music) với intent kiểu "epic orchestral trailer, hybrid, braam, rising".
- Tiêu đề video được dùng chữ "phong cách Marvel / kiểu Avengers" như mô tả, không giả làm sản phẩm chính thức.

## 1. Chọn chế độ theo nguồn Kiên gửi
| Nguồn | Chế độ | Khung | Độ dài |
|---|---|---|---|
| Nhiều cảnh đời thường / flycam / nội khu, có hoặc không có voice | **M1 – Trailer thuần** | 9:16 1080×1920 (kèm 16:9 nếu có nguồn ngang) | 60–90s |
| Kiên nói thẳng camera về một dự án/tin tức | **M2 – Talking-head bọc trailer**: cold open + intro thương hiệu 6–8s, thân bài giữ đúng Loại 2/Loại 3, chèn 2–3 "khoảnh khắc trailer" ở ý đắt nhất, outro trailer | 9:16 (Loại 3) hoặc 16:9 (Loại 2 Kiểu L) | >1 phút |
| Chỉ có ảnh phối cảnh / ảnh tĩnh / mặt bằng | **M3 – Teaser ảnh**: 2.5D parallax, push-in, light sweep, chữ slam | 9:16 + 16:9 | 30–60s |
| Kiên nói tại dự án + có bộ ảnh/video phối cảnh, nhà mẫu; hoặc Kiên nói "làm giống video biệt thự rừng / xen kẽ talking head" | **M4 – Xen kẽ talking-head BĐS** (theo `references/mau-xen-ke-talking-head-bds.md`): voice liền mạch, A-roll ~25% (hook, giá, CTA), B-roll ~75%, chữ to đổi mỗi 1–2s, không phụ đề full | 9:16 | 1:20–1:45 |

Kiên đã nói rõ chế độ → làm luôn, không hỏi lại. Chưa rõ → nhìn contact sheet, đề xuất 1 chế độ kèm lý do rồi hỏi **một** câu.

## 2. Cấu trúc 5 hồi (khung xương mọi video Marvel)
1. **Cold open (0–5s)** — 3 cảnh mạnh nhất, mỗi cảnh ~9 frame cắt cứng, rồi **6 frame đen im lặng**, rồi câu hook (shotcraft `trailer-grammar-moves` kiểu A). Một câu thoại/voice gây tò mò: "Có một dự án… thay đổi cả bờ Đông Hà Nội."
2. **Thẻ thương hiệu (5–10s)** — BrandFlip: ảnh của Kiên lật nhanh dưới khối chữ đỏ, chốt bằng chữ "KIÊN BÁN NHÀ" + SFX braam.
3. **Dựng tình huống (10–35%)** — nhịp chậm, cảnh dài 3–5s, voice kể, chữ kicker nhỏ; nhạc tầng thấp (pad + ostinato).
4. **Leo thang (35–80%)** — cắt theo beat, cảnh ngắn dần (2s → 1s → nửa phách), xen **thẻ chữ đen** (kiểu B: "VỊ TRÍ" / "TIẾN ĐỘ" / "GIÁ"), speed ramp vào khoảnh khắc đắt, riser trước mỗi đỉnh.
5. **Đỉnh & chốt (80–100%)** — cú **smash cut** từ ồn ào sang tĩnh lặng (kiểu C), tiêu đề lớn slam, logo/tên dự án, CTA, thẻ "COMING SOON / MỞ BÁN 12.2026", button kiểu post-credit (1 câu đùa hoặc gợi tập sau) nếu Kiên muốn.

Chi tiết từng hồi + số frame: `references/ngu-phap-marvel.md`.

**M4 dùng khung nội dung riêng** (đã đo từ video mẫu): hook câu hỏi 0–4s → "Qua video này" 5–7s → tên dự án 8–10s → quy mô → các dòng sản phẩm (lưới thẻ) → điểm khác biệt thiết kế (chuỗi ảnh nội thất, 1 ảnh = 1 ý) → cảnh quan, diện tích (thẻ ảnh nổi + số) → giá (A-roll trong nhà mẫu) → chính sách thanh toán (số lớn liên tiếp, nhạc dồn) → CTA "Inbox ngay nhận layout chi tiết". Có thể ghép hồi 1–2 của trailer Marvel lên đầu M4.

## 3. Quy tắc cố định của Kiên — KHÔNG được phá
(Đầy đủ ở `references/quy-tac-kien.md`.)
- **Không zoom A-roll, không rung, không chớp/strobe, không icon neon, không thanh tiến trình, không SFX theo từng từ, không khung bình chọn, không thanh comment cuối.**
- Chữ không che mặt/miệng. Vùng an toàn TikTok: trên 0–230, dưới 1440–1920, cột phải x940–1080 y900–1440.
- BrandBug top 238 scale 0.75; LikeSub ở giây 10 (`translateY(-1110px)` trên khung dọc).
- Màu da: `curves 0/0 0.5/0.53 1/1`; mặt tối dùng `0/0 0.25/0.31 0.5/0.59 0.8/0.86 1/0.98`; cấm mức 0.5→0.69.
- Loudness voice -14 LUFS; chuỗi voice: highpass 90 → afftdn → compressor → loudnorm -14.
- Độ dài trên 1 phút (trừ teaser M3 nếu Kiên yêu cầu ngắn). Không đoạn B-roll im lặng.
- Nói sai số → ghép âm tiết đúng của chính Kiên; dữ kiện sai → cắt và báo lại.

**Cách giữ chất "Marvel" mà không phá quy tắc:**
- Thay rung camera bằng **chuyển động có kiểm soát trên B-roll** (push-in chậm, parallax 2.5D, crash-zoom chỉ trên B-roll/ảnh, không trên A-roll).
- Thay chớp trắng bằng **dip to black 4–6 frame**, light leak mềm (opacity ≤0.35, ≥8 frame), hoặc cắt cứng vào đen.
- Tiêu đề hiện bằng **scale + blur 0,2–0,3s rồi đứng yên**, không giật.
- Chỉ bật flash/shake khi Kiên **ghi rõ trong tin nhắn** cho video đó; vẫn không bao giờ áp lên A-roll.
- Ba kỹ thuật của video mẫu M4 trái quy tắc nên **mặc định tắt**: punch-in A-roll (X7), whip-blur (X2), light leak lóe (X3). Kiên nói "chuyển cảnh như video mẫu" / "làm y video biệt thự rừng" thì coi là cho phép và bật cả ba cho video đó.

## 4. Quy trình
1. **Nhận nguồn** — từ Mac (Remote Control) hoặc Google Drive (`mcp__Google_Drive__search_files` → `download_file_content`). Tách audio `-c:a copy`, làm contact sheet đầu/giữa/cuối mỗi clip, chấm điểm cảnh "anh hùng" (đi về camera, low-angle, flycam lướt, cửa mở, ánh nắng, người nhìn xa).
2. **ASR** (sherpa-onnx hoặc media-use transcription) → cắt "ờ/ơ/a" → sửa tên dự án, con số; câu có ngày/số liệu dễ lỗi thời thì báo Kiên.
3. **Nhạc trước, hình sau** — chọn BGM epic có bản quyền (media-use `resolve --type bgm --intent "epic hybrid orchestral trailer, slow build, braams, final hit"`; hoặc vidIQ `generate_music`). Chạy `templates/beats.py` để lấy lưới beat (BPM, t0, downbeat, hit lớn). **Lưới chưa đạt (residual ≤ ±15ms) thì chưa dựng storyboard** (shotcraft `music-beat-sync.md`).
4. **Storyboard JSON** — mỗi cảnh: `{from_s, to_s, src, in_s, hoi, hieu_ung, chu, sfx}`; mọi cắt cảnh hồi 4–5 neo vào beat; tính bằng giây thực, chỉ đổi sang frame ở bước Remotion.
5. **Grade** — A-roll: scale/fps 30 + curves da Kiên + `eq=saturation=1.05:contrast=1.03`. B-roll: teal–orange nhẹ (`colorbalance=rs=.04:bs=-.04:rh=-.03:bh=.05`, contrast 1.08), vignette nhẹ. Kiểm tra màu da sau grade, da lệch thì ưu tiên da. Broad polish/LUT: media-use `references/media-treatments.md`.
6. **Dựng Remotion** (stack chuẩn của Kiên) — dùng component trong `templates/` + kiểu N/L (`src/lsb/LSB.tsx`, `src/loc/LOC.tsx`) hoặc Metro/T5B (`src/metro/MET.tsx`, `src/top5/T5B.tsx`) cho phần thân M2. Letterbox 2.39:1 chỉ cho cảnh B-roll điện ảnh; bỏ letterbox khi có chữ phụ đề để không chật khung.
   - Muốn HTML/GSAP/shader thay Remotion → HyperFrames (skill `hyperframes` là cửa vào).
7. **Âm thanh** — BGM -20 đến -24 LUFS dưới voice (duck 6–8 dB khi có voice), SFX khung: braam ở thẻ thương hiệu, whoosh ở speed ramp, riser 2–4s trước đỉnh, hit ở tiêu đề slam, sub-drop ở smash cut, im lặng tuyệt đối 0.5–1s trước câu chốt. SFX bám hành động hình, không bám từng chữ. Tổng mix -14 LUFS, true peak ≤ -1 dBTP.
8. **Render** — `npx remotion render … --timeout=120000` + cache flag, nén `crf 25`. Ra 2 bản: có BGM / không BGM (`--props=props-nobgm.json`). Có nguồn ngang thì thêm 16:9.
9. **Kiểm tra cuối** — contact sheet bản render; checklist mục 6; đo LUFS bằng `ffmpeg -af ebur128`; xem cắt cảnh lệch beat ≤ 3 frame.
10. **Giao** — `SendUserFile` (file >25MB thì tách rồi concat), lưu Downloads. Kèm: tiêu đề (vidIQ `generate_titles` + `score_title`), thumbnail (vidIQ `generate_thumbnail`/`score_thumbnail` hoặc Canva), hashtag. Ghi doc vào project "sản xuất video" (`marvel-<du-an>-video.md`).

## 5. Chữ & đồ họa
- **Bộ chữ M4** (dùng được cho mọi chế độ): 4 vai font — condensed in hoa cho từ khóa, sans hình học đậm cho số, chữ viết tay đè chéo cho từ cảm xúc, sans mảnh cho kicker. Số trên nền tối → vàng kem/xanh ngọc; trên nền sáng → navy/xanh lá đậm; mỗi khung 1 màu nhấn. Hiệu ứng: gõ từng ký tự, blur-in, số lăn slot, chữ ra bằng motion-blur, chữ sau lưng người. Chi tiết T1–T12.
- **Tiêu đề slam** (`MarvelTitle`): Anton/Oswald/Bebas Neue in hoa, tracking rộng, gradient kim loại (bạc → trắng, viền tối), hoặc khối đỏ #C8102E chữ trắng. Hiện bằng scale 1.15→1 + blur 12→0 trong 6–8 frame, giữ 1,5–2,5s. Chỉ 6–8 khoảnh khắc mỗi video.
- **Thẻ chữ đen** giữa các cảnh: nền đen, chữ trắng 1–3 từ, 1.05→1 trong 5 frame rồi đứng yên, mỗi thẻ 0,6–1s, đặt trên beat.
- **Kicker nhỏ** kiểu chú thích phim: "HÀ NỘI · 2026", "CHƯƠNG I: VỊ TRÍ" (Oswald 28–34, tracking 0.3em, opacity 0.85).
- **Phụ đề** khi có voice: theo Loại 3 (SubSmall trắng, y≈1150–1250) hoặc Kiểu N (cụm 2–3 từ, Anton 64–72, từ khóa vàng). Ẩn phụ đề khi tiêu đề slam đang hiện.
- Anti-slop (skill-nghia): không glow neon, không gradient tím–xanh "AI", không emoji, không icon Lucide sáo rỗng.

## 6. Checklist trước khi giao
- [ ] Không có logo/nhạc/cảnh phim của Marvel/Disney.
- [ ] Cold open có 6 frame đen im lặng; có thẻ thương hiệu của Kiên.
- [ ] Mọi cắt cảnh hồi 4–5 lệch beat ≤ 3 frame; smash cut rơi đúng hit cuối.
- [ ] Không zoom A-roll, không rung, không chớp, không neon; chữ không che mặt.
- [ ] BrandBug top 238, LikeSub giây 10, vùng an toàn TikTok sạch.
- [ ] Da đúng curves của Kiên sau grade teal–orange.
- [ ] Voice -14 LUFS, BGM duck, true peak ≤ -1 dBTP.
- [ ] Trên 1 phút (trừ teaser được yêu cầu), không B-roll im lặng.
- [ ] (M4) Chữ to đổi mỗi 1–2s, cảnh 2,5–4s; số chính sách đúng với tài liệu chủ đầu tư; CTA giữ ≥ 4s.
- [ ] Đủ bản: 9:16 có BGM, 9:16 không BGM, (16:9 nếu có nguồn ngang); tiêu đề + thumbnail + hashtag.
