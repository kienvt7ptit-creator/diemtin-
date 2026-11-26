---
name: "baymapai"
description: "baymapAI — dựng video \"map flying\" BĐS cho Kiên: bản đồ vệ tinh làm sân khấu, camera bay/zoom/nghiêng/xoay, ranh dự án tự vẽ phát sáng, mặt bằng hiện trong ranh, ghim logo, sông neon + chữ chạy dọc sông, chữ 3D quy mô, thẻ ảnh bay, nhãn đường dóng, loạt ghim hạ tầng/KCN, kính lúp tìm dự án, tỉnh tô màu + vòng cung kết nối, làm tối + chữ giữa, end card liên hệ. Học từ video King Park (Bắc Ninh). Dùng khi Kiên nói: baymapAI, bay map, map flying, video bản đồ, phân tích vị trí/quy hoạch/kết nối vùng trên bản đồ, làm giống video King Park."
---

# baymapAI — video map flying BĐS

Xưng **"em – anh"**. Tài liệu chi tiết:
- `references/mau-map-flying.md` — dòng thời gian video mẫu King Park từng giây, 16 kỹ thuật **MF1–MF16** kèm thông số, màu, chữ, âm thanh, cách lấy nguồn bản đồ. **Đọc trước khi dựng.**
- `references/mau-palm-river.md` — **mẫu học từ video Palm River**: khoanh lô đất phát sáng, logo dự án đứng trên khu đất, thẻ bài báo đánh dấu vàng (cách chụp bài thật), chữ 3D trên mặt đất, vòng khoanh nét đứt, dip đen, bản đồ tối, so sánh "lên bàn cân" (mã PR1–PR17).
- `references/quy-tac-kien.md` — quy tắc edit cố định của Kiên (bắt buộc).
- `templates/` — Remotion:
  - `MapFx.tsx`: `MapCamera` (bay/zoom/nghiêng/xoay theo keyframe), `DrawPath` (ranh tự vẽ, sông neon, chữ dọc path), `ClipReveal` (mặt bằng hiện trong ranh), `MapPin`, `Callout` (đường dóng thẳng/gấp khúc), `Arc` (vòng cung nối), `Magnifier` (kính lúp + zoom xuyên), `DimCenterText`, `Text3D`, `Tower3D`/`TowerY` (tháp 3D, chữ Y), `ParcelGlow` (lô đất phát sáng), `Billboard` (logo đứng trên khu đất), `Ring` (vòng khoanh, nét đứt), `GroundText` (chữ trên mặt đất), `NewsCard` (thẻ bài báo), `DipBlack`.
  - `MapDemo.example.tsx`: composition mẫu 12s dùng đủ các hiệu ứng trên.
  - `TextFx.tsx`, `BrollFx.tsx`, `fonts.ts`: chữ (gõ, số lăn, blur-in), thẻ ảnh nổi, font có tiếng Việt.

## 1. Khi nào dùng
Video phân tích **vị trí, quy mô, quy hoạch, hạ tầng, kết nối vùng** của một dự án. Nội dung chủ yếu là lời bình + bản đồ; Kiên xuất hiện ở hook, giá và CTA.

## 2. Khung nội dung (1:30–2:00, dọc 1080×1920)
| Đoạn | Thời lượng | Hình | Kỹ thuật |
|---|---|---|---|
| Hook | 0–3s | Ranh dự án tự vẽ, mặt bằng hiện ra, ghim logo rơi | MF1, MF2, MF3 |
| Vị trí | 3–8s | Zoom vọt ra cấp tỉnh, ranh tỉnh phát sáng, ghim tỉnh → bay vào lại | MF4, MF5 |
| Quy mô | 8–16s | Sông neon + chữ dọc sông, chữ 3D diện tích, tổng vốn | MF6, MF7 |
| Sản phẩm | 16–35s | Camera nghiêng vào mặt bằng; thẻ ảnh số căn bay vào; nhãn tiện ích có đường dóng | MF8, MF9 |
| Hạ tầng / vùng | 35–60s | Zoom ra, loạt ghim KCN/tiện ích mọc theo nhịp, mốc sự kiện | MF11 |
| Tìm dự án | 60–66s | Kính lúp "tìm kiếm: … → kết quả: <dự án>", zoom xuyên kính | MF12 |
| Kết nối vùng | 66–85s | Tỉnh tô màu, vòng cung nối về dự án, nhãn số căn | MF13 |
| So sánh giá | 85–92s | Mây chuyển cảnh, làm tối + "Ngược lại / - NẾU GIÁ HỢP LÝ -" | MF14, MF15 |
| Lý do mua | 92–103s | 4 nhãn cam đường dóng gấp khúc lần lượt | MF10 |
| Chốt | 103–110s | Orbit quanh dự án + câu hỏi chốt | MF16, MF15 |
| Kiên + CTA | 110–120s | Thẻ ảnh Kiên bật lên từ góc → end card: tên, slogan, SĐT | thẻ nổi |

Nhịp: **3–6s một hành động bản đồ**, không để khung đứng yên quá 2s (luôn có drift/zoom chậm).

## 3. Quy trình
1. **Kịch bản + voice**: chia kịch bản theo bảng trên. Voice của Kiên (thu thật) hoặc TTS (ElevenLabs/vidIQ), chuẩn hóa -14 LUFS: `highpass=f=90,afftdn,acompressor,loudnorm=I=-14`.
2. **Nguồn bản đồ** (chọn 1):
   - **Google Earth Studio** — dựng camera bay thật (zoom, orbit, tilt), xuất chuỗi ảnh 1080×1920 30fps → nền video; overlay vẽ bằng code. Giống video mẫu nhất.
   - **Ảnh vệ tinh tĩnh lớn** (≥ 6000px) + `MapCamera` — nhanh, tất định, đủ zoom/pan/xoay/nghiêng nhẹ.
   - **MapLibre / Mapbox / Cesium** qua skill `remotion:remotion-maps` khi cần toạ độ thật, Turf, địa hình 3D.
   - Luôn giữ dòng ghi nguồn ảnh vệ tinh theo điều khoản nhà cung cấp.
3. **Vẽ lớp bản đồ**: ranh dự án, ranh tỉnh, sông, điểm ghim — vẽ path SVG theo đúng toạ độ pixel của tấm bản đồ (Figma/Illustrator) hoặc GeoJSON ranh hành chính. Mặt bằng quy hoạch: ảnh chính thức của chủ đầu tư, nắn vào ranh.
4. **Camera**: viết `CamKey[]` theo bảng khung nội dung; zoom nội suy log (đều mắt); crash zoom 12–18 frame; orbit 3–4s.
5. **Dựng Remotion**: copy `templates/*` vào `src/`, gọi `loadFxFonts()` ở Root, bắt đầu từ `MapDemo.example.tsx`. Lưu ý:
   - `Magnifier` dùng frame tuyệt đối — **không bọc trong `<Sequence>`**; camera lúc dùng kính không xoay/nghiêng.
   - Chữ gradient cần `lineHeight ≥ 1.25` + `paddingTop` để không cắt dấu tiếng Việt.
6. **Âm thanh**: nhạc nền nhịp đều dưới voice (duck 6–8 dB); **boom** ở mỗi cú zoom và mỗi số liệu lớn; **whoosh/pop nhỏ** ở mỗi ghim, thẻ, nhãn; outro 5s chỉ còn nhạc. Tổng -14 LUFS, true peak ≤ -1 dBTP.
7. **Render**: `npx remotion render <Comp> out/<ten>.mp4` (crf 25), xem contact sheet đầu/giữa/cuối trước khi giao.
8. **Giao**: SendUserFile (tách ≤ 25MB nếu cần), kèm tiêu đề + thumbnail (vidIQ / Canva).

## 4. Quy tắc của Kiên áp dụng ở đây
- Toàn bộ chuyển động bản đồ (zoom, bay, orbit) là đồ họa → **được phép**. Quy tắc "không zoom/rung A-roll" vẫn giữ cho phần Kiên xuất hiện.
- Không chớp trắng: chuyển cảnh dùng mây trắng mềm (MF14), cắt cứng, hoặc dip đen.
- Không icon neon kiểu game; glow chỉ dùng cho ranh/sông/nhãn, vừa phải.
- Vùng an toàn TikTok: không đặt nhãn ở trên 0–230, dưới 1440–1920, cột phải x940–1080 y900–1440.
- BrandBug top 238 scale 0.75; LikeSub giây 10; video trên 1 phút.
- Số liệu (diện tích, số căn, giá, mốc thời gian) phải khớp tài liệu chủ đầu tư; số dễ lỗi thời → báo Kiên.

## 4b. Chuẩn "phân tích có bằng chứng" (học từ Palm River)
- Lô đất dự án luôn **khoanh viền trắng + nền vàng cam phát sáng**; logo dự án đứng phía trên khu đất ở cảnh mở đầu.
- Mỗi con số quan trọng có **thẻ bài báo thật** (đánh dấu vàng câu trích, ghi nguồn) trượt lên nửa dưới khung.
- Chuyển chương bằng dip đen 6 frame; hook giữa khung 2 dòng trắng/cam.

## 5. Checklist trước khi giao
- [ ] Mỗi 3–6s có một hành động bản đồ; không khung chết > 2s.
- [ ] Ranh dự án/sông/tỉnh khớp ảnh vệ tinh; ghim đúng vị trí thật.
- [ ] Có dòng ghi nguồn ảnh vệ tinh.
- [ ] Nhãn không ra ngoài vùng an toàn; chữ tiếng Việt đủ dấu.
- [ ] Kiên xuất hiện ở hook/giá/CTA; end card có thông tin liên hệ của Kiên.
- [ ] Voice -14 LUFS; boom/whoosh khớp chuyển động; outro chỉ nhạc.
