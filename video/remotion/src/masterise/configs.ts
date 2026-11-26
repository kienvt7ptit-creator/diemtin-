// Cấu hình 4 video Masterise. Số liệu theo VnExpress:
// gc: "Masterise Homes ra mắt 7 tòa căn hộ mới tại Ocean Park 2" (16/1/2026)
// op: "Dấu ấn thương hiệu Lumière tại Ocean Park 1" (17/10/2025)
// ep: "Masterise Homes mở rộng dòng Lumière tại Global Gate" (29/12/2025)
// sg: "Masterise Homes ra mắt dự án Hanoi Seasons Garden" (15/5/2026)
// Toạ độ: Google Maps. Ranh lô đất & khối tháp: ước lượng trên ảnh vệ tinh, minh hoạ.
import { ProjectConfig } from "./ProjectFly";


export const GC: ProjectConfig = {
  key: "gc", name: "MASTERI GRAND COAST", line: "MASTERISE HOMES · OCEAN PARK 2",
  hook: ["NGAY TRƯỚC BIỂN HỒ", "WONDER WAVE PARK"],
  p13: [1730, 2371], hg13: [955, 1884], km: "16",
  p17: [1561, 2608], site: [1603, 2683],
  parcel: "M1486,2493 L1586,2468 L1721,2868 L1621,2898 Z",
  towers: [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ dx: 21 * k, dy: 58 * k, w: 22, d: 22, h: 76 })),
  district: "Ocean Park 2 · Ocean City",
  travel: [
    { small: "Về trung tâm Hà Nội", big: "≈ 20 PHÚT" },
    { small: "Ra sân bay Nội Bài", big: "≈ 30 PHÚT" },
    { small: "Tương lai: Vành đai 3,5 · Vành đai 4", big: "+ CẦU MỚI" },
  ],
  ground: [{ t: "ĐỐI DIỆN", color: "#FFFFFF", size: 80 }, { t: "WONDER WAVE", color: "#FFB02E", size: 88 }],
  landscape: { small: "Đối diện", big: "HỒ WONDER WAVE PARK" },
  stat: { value: "7", label: "TÒA THÁP · CAO 27 TẦNG" },
  photos: [
    { src: "m4/gc_img1.jpg", kicker: "", label: "" },
    { src: "m4/gc_img2.jpg", kicker: "4 công viên nội khu", label: "HỆ TIỆN ÍCH COMPOUND" },
    { src: "m4/gc_img3.jpg", kicker: "Hệ sinh thái Ocean City", label: "MEGA MALL · VINSCHOOL · VINMEC" },
  ],
  newsRatio: 960 / 498,
  dur: [6.5, 9.5, 11.5, 8.5, 10, 10.5, 6.5],
};

export const OP: ProjectConfig = {
  key: "op", name: "LUMIÈRE ORIENT PEARL", line: "MASTERISE HOMES · OCEAN PARK 1",
  hook: ["GIỮA THÀNH PHỐ BIỂN HỒ", "OCEAN PARK 1"],
  p13: [1756, 2316], hg13: [1211, 2140], km: "10",
  p17: [1721, 2753], site: [1620, 2810],
  parcel: "M1521,2798 L1666,2703 L1731,2783 L1621,2883 L1556,2893 Z",
  towers: [[-40, -20], [30, -45], [-25, 45], [45, 20]].map(([dx, dy]) => ({ dx, dy, w: 24, d: 24, h: 85 })),
  district: "Ocean Park 1 · Gia Lâm",
  travel: [
    { small: "Đại đô thị đã có", big: "> 60.000 CƯ DÂN" },
    { small: "Kết nối Ocean City", big: "& TRUNG TÂM THỦ ĐÔ" },
    { small: "Hạ tầng giao thông", big: "ĐỒNG BỘ" },
  ],
  ground: [{ t: "HỒ NGỌC TRAI", color: "#FFFFFF", size: 80 }, { t: "24,5 HA", color: "#FFB02E", size: 96 }],
  landscape: { small: "Biển hồ nước mặn", big: "CRYSTAL LAGOON 6,1 HA" },
  stat: { value: "4", label: "TÒA THÁP · CAO 30 TẦNG" },
  photos: [
    { src: "m4/op_img3.jpg", kicker: "", label: "" },
    { src: "m4/op_img2.jpg", kicker: "The Palma · 86 tiện ích", label: "CÔNG VIÊN THE FORESTA 1,6 HA" },
    { src: "m4/op_img1.jpg", kicker: "10 loại hình căn hộ", label: "STUDIO → DUPLEX · PENTHOUSE" },
  ],
  newsRatio: 960 / 500,
  dur: [6.5, 8.5, 9.5, 9, 10, 12, 6.5],
};

export const EP: ProjectConfig = {
  key: "ep", name: "LUMIÈRE ESSENCE PEAK", line: "MASTERISE HOMES · GLOBAL GATE",
  hook: ["CỬA NGÕ PHÍA BẮC", "HÀ NỘI"],
  p13: [1506, 1983], hg13: [1467, 2396], km: "7,4",
  p17: [1569, 2800], site: [1574, 2780],
  parcel: "M1509,2730 L1589,2710 L1639,2830 L1559,2850 Z",
  towers: [{ dx: -18, dy: -25, w: 28, d: 28, h: 130 }, { dx: 18, dy: 25, w: 28, d: 28, h: 130 }],
  district: "Global Gate · Đông Anh",
  travel: [
    { small: "Khi cầu Tứ Liên hoàn thành – tới Hồ Tây", big: "≈ 5 PHÚT" },
    { small: "Vào trung tâm Hà Nội", big: "≈ 15 PHÚT" },
    { small: "Ra sân bay Nội Bài", big: "≈ 20 PHÚT" },
  ],
  ground: [{ t: "HỒ TRUNG TÂM", color: "#FFFFFF", size: 80 }, { t: "32 HA", color: "#FFB02E", size: 100 }],
  landscape: { small: "Đối diện", big: "MARRIOTT · TRUNG TÂM TRIỂN LÃM" },
  stat: { value: "45", label: "TẦNG · 2 TÒA THÁP" },
  photos: [
    { src: "m4/ep_img3.jpg", kicker: "", label: "" },
    { src: "m4/ep_img1.jpg", kicker: "Dự kiến", label: "HƠN 50 TIỆN ÍCH" },
    { src: "m4/ep_img2.jpg", kicker: "Lấy cảm hứng hoa sen", label: "DỰ ÁN THỨ 8 DÒNG LUMIÈRE" },
  ],
  newsRatio: 960 / 431,
  dur: [7, 8.5, 9.5, 10, 9, 9.5, 6.5],
};

export const SG: ProjectConfig = {
  key: "sg", name: "HANOI SEASONS GARDEN", line: "LUMIÈRE · THE BLOOM · NGUYỄN TRÃI",
  hook: ["TRÊN TRỤC", "NGUYỄN TRÃI"],
  p13: [1223, 2347], hg13: [1467, 2140], km: "5,7",
  p17: [1649, 2735], site: [1700, 2790],
  parcel: "M1579,2710 L1704,2635 L1809,2765 L1809,2905 L1719,2935 L1649,2855 L1594,2775 Z",
  towers: [[-75, -55], [-35, -80], [5, -55], [45, -30], [80, 0], [-45, -10], [-5, 15], [35, 40], [75, 70], [10, 90]].map(([dx, dy], i) => ({
    dx, dy, w: 20, d: 20, h: 110 + (i % 3) * 15 })),
  district: "Cửa ngõ Tây Nam · Thanh Xuân",
  travel: [
    { small: "Kết nối tuyến metro", big: "GA THƯỢNG ĐÌNH" },
    { small: "Vành đai 2,5 · Vành đai 3 → Nội Bài / Ocean City", big: "≈ 30 PHÚT" },
    { small: "Đại học Quốc gia · Bạch Mai · Quân y 103", big: "TIỆN ÍCH NGOẠI KHU" },
  ],
  ground: [{ t: "5 KHU VƯỜN", color: "#FFFFFF", size: 84 }, { t: "CHỦ ĐỀ", color: "#FFB02E", size: 96 }],
  landscape: { small: "Bể bơi bốn mùa", big: "MÁI VÒM CÁNH HOA" },
  stat: { value: "10", label: "TÒA THÁP · CAO 35–46 TẦNG" },
  photos: [
    { src: "m4/sg_img2.jpg", kicker: "", label: "" },
    { src: "m4/sg_img1.jpg", kicker: "Ra mắt ngày 12/5", label: "PHÂN KHU THE BLOOM" },
    { src: "m4/sg_img3.jpg", kicker: "Masterise Hospitality vận hành", label: "CLUBHOUSE · ROOFTOP BAR" },
    { src: "m4/sg_img4.jpg", kicker: "Studio → 4 phòng ngủ", label: "DUPLEX · PENTHOUSE" },
  ],
  newsRatio: 960 / 432,
  dur: [6.5, 9.5, 11, 8.5, 11, 10, 7],
};
