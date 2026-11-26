# Mẫu học: video bay map "Palm River" (Q2 cũ, TP.HCM – 2:32)

Nguồn: video Kiên gửi ngày 26/11/2026 (kênh SMART Bất Động Sản; chỉ học kỹ thuật). 720×1280, 30fps, 152s.
Khác King Park: **nhịp báo chí – phân tích**. Bản đồ vệ tinh tối màu làm nền, mọi luận điểm đều có **bằng chứng**: lô đất khoanh sáng, logo dự án đứng trên khu đất, **ảnh chụp bài báo đánh dấu vàng**, ảnh cũ/mới so sánh, bản đồ quy hoạch.

## 1. Dòng thời gian rút gọn
| Giây | Kỹ thuật |
|---|---|
| 0–5 | Từ vệ tinh cấp vùng zoom vào; **ranh quận viền trắng mảnh** tự vẽ; chữ 2 tầng "THỊ TRƯỜNG CĂN HỘ CAO CẤP (cam) / TẠI QUẬN 2 HIỆN NAY (trắng)" |
| 4–5 | **Làm tối + hook giữa khung**: "CÓ THỂ THẤY (trắng) / ĐIỀU RẤT RÕ (cam)" |
| 6–8 | **Thẻ bài báo** trượt từ đáy lên chiếm nửa dưới, tiêu đề đánh **dấu vàng**; chữ "QUỸ ĐẤT ĐẸP / ĐÃ HẾT" phía trên |
| 8–20 | Lần lượt từng dự án lân cận: bay tới → **logo dự án trắng phát sáng đứng trên khu đất** → lô đất/khối nhà **tô cam** bên dưới, tên phân khu viết nghiêng quanh lô |
| 13–20 | **Sông tô vàng đậm + chữ chạy dọc sông** ("Sông Sài Gòn"), **đại lộ tô đỏ** + nhãn chạy dọc đường |
| 19 | Thẻ bài báo nhỏ ở góc dưới phải trong lúc bản đồ vẫn chạy |
| 21–24 | **Bản đồ chế độ tối (dark map)** đường cam, metro xanh → khối 3D dự án **cam trong suốt phát sáng** + logo trên đầu |
| 24, 50, 61, 73 | **Dip đen** 3–6 frame chuyển chương |
| 25–30 | Phối cảnh + nội thất (ảnh chủ đầu tư) zoom chậm |
| 32–35 | Logo dự án to giữa bản đồ tối → bản đồ kết nối: metro, sân vận động, ga, khu đô thị |
| 38–40 | **Lô đất khoanh trắng + nền vàng cam** + tên khu "NAM RẠCH CHIẾC" cam đậm dưới lô |
| 41–45 | Ranh phường **tô đỏ sẫm**, các phân khu tô màu khác (xanh, vàng) – bản đồ quy hoạch |
| 41–45 | **Chữ 3D nằm trên mặt đất** "TỌA ĐỘ VÀNG / CUỐI CÙNG" trượt ngang theo camera |
| 53–60 | **Ảnh tư liệu khung trắng mỏng nghiêng** đặt trên bản đồ + chú thích "Bản đồ Thủ Thiêm – Năm 2012" (so sánh xưa/nay) |
| 64–65 | Khu đất khoanh trắng + thẻ bài báo nhỏ góc trái dưới |
| 68–69 | Lô dự án viền cam trên phối cảnh, chữ "RESIDENTIAL COMPOUND ĐÚNG NGHĨA" cam |
| 80–98 | B-roll lifestyle + chữ trắng in hoa giữa khung ("WELLNESS URBAN LIVING", "MẬT ĐỘ XANH LỚN" cam) |
| 99–105 | Khối 3D cam + logo; chữ trên mặt đất "HỆ SINH THÁI / PALM CITY" |
| 106–111 | **Bài báo cuộn**: thẻ to giữa khung, dòng trích dẫn tô vàng, chữ trích dẫn đọc theo voice |
| 120 | Khối 3D chủ đầu tư **vàng trong suốt** + logo chủ đầu tư |
| 125–131 | **Nền giấy kẻ ô (grid)**: "NẾU ĐẶT … LÊN BÀN CÂN" – đặt các dự án cạnh nhau so sánh |
| 132–139 | **Bản đồ vị trí chính thức + vòng tròn đỏ nét đứt** quanh dự án + **icon tiện ích vàng nét mảnh** bật quanh (giáo dục, giải trí, thương mại, y tế) |
| 141–151 | Lô dự án khoanh **vòng cam mảnh**, ranh khu Đông viền trắng, câu hỏi chốt "CÒN DỰ ÁN NÀO ĐỦ TIỀM NĂNG?" |

## 2. Kỹ thuật (mã PR1–PR17) và component
| Mã | Kỹ thuật | Component (`templates/MapFx.tsx`) |
|---|---|---|
| PR1 | Ranh hành chính viền trắng mảnh tự vẽ | `DrawPath color="#fff" width={3}` |
| PR2 | Làm tối + hook 2 dòng trắng/cam giữa khung | `CenterHook` (trong GamudaCP) / `DimCenterText` |
| PR3 | **Thẻ bài báo trượt lên nửa dưới, tiêu đề dấu vàng** | `NewsCard` |
| PR4 | **Logo dự án đứng trên khu đất, luôn quay về camera** | `Billboard` + logo SVG |
| PR5 | Sông tô vàng đậm + chữ dọc sông; đại lộ tô đỏ + nhãn dọc đường | `DrawPath label=…` |
| PR6 | Khối 3D dự án cam/vàng trong suốt + logo trên đầu | `Tower3D/TowerY facade="rgba(255,160,40,.55)"` + `Billboard` |
| PR7 | Bản đồ chế độ tối (đường cam, metro xanh) | tấm bản đồ dark (MapLibre style tối) |
| PR8 | **Lô đất viền trắng + nền vàng cam phát sáng**, tên khu cam dưới lô | `ParcelGlow` + `Callout`/chữ |
| PR9 | Ranh phường tô đỏ sẫm, phân khu tô màu | `DrawPath fillOpacity` |
| PR10 | **Chữ 3D nằm trên mặt đất** trượt ngang | `GroundText` |
| PR11 | Ảnh tư liệu khung trắng nghiêng + chú thích năm | `FlyCard` (viền trắng 2px, rotate -4°) |
| PR12 | Bài báo cuộn, câu trích tô vàng | `NewsCard scrollTo=…` |
| PR13 | Dip đen chuyển chương | `DipBlack` |
| PR14 | B-roll lifestyle + chữ trắng in hoa | `Photo` (GamudaCP) |
| PR15 | Nền giấy kẻ ô so sánh dự án "lên bàn cân" | (thủ công) |
| PR16 | **Vòng tròn đỏ nét đứt** quanh dự án trên bản đồ vị trí + icon tiện ích vàng | `Ring dashed` |
| PR17 | Vòng cam mảnh khoanh dự án trên vệ tinh | `Ring` |

## 3. Cách lấy bằng chứng bài báo (PR3/PR12) – đúng và minh bạch
1. Tìm bài trên báo chính thống (Tuổi Trẻ, VnExpress, CafeF…) có nhắc đúng con số dùng trong voice.
2. Chụp **bài thật** bằng Playwright (cần mở host CSS/ảnh của báo, ví dụ `static-tuoitre.tuoitre.vn`, `cdn2.tuoitre.vn`, `static.mediacdn.vn`, `ims.mediacdn.vn`; không mở host quảng cáo).
3. Ẩn quảng cáo/thanh dính; **chỉ đánh dấu vàng** câu then chốt bằng `<mark>` – không sửa chữ của bài.
4. Chụp riêng tiêu đề + đoạn trích, ghép thành thẻ trắng; dưới thẻ ghi "Nguồn: Báo … (tên miền)".
5. Đặt thẻ đúng lúc voice nói con số đó (≥ 2,5s để kịp đọc).

## 4. Logo dự án (PR4)
- Lấy từ brochure/tài liệu chủ đầu tư. Nếu là ảnh độ phân giải thấp: tách theo độ sáng → `potrace` thành SVG cho biểu tượng; wordmark gõ lại bằng font serif tương tự (Cormorant Garamond, giãn chữ 0,16em).
- Billboard đứng gần camera nên **bị phóng to do phối cảnh**: dùng `scale` 0,4–0,6 và `lift` 150–200px; không đặt logo trùng vùng chữ lớn.

## 5. Áp dụng cho Kiên
- Tất cả là đồ hoạ trên bản đồ → dùng thẳng. Dip đen thay cho chớp trắng.
- Mỗi số liệu quan trọng (số căn, quy mô, thời điểm) nên có 1 thẻ bài báo trích dẫn.
- Âm lượng chuẩn -14 LUFS; số điện thoại chạy ngang mờ; nguồn ảnh/tin ở góc dưới phải.
