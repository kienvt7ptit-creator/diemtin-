// Cấu hình 4 video Masterise. Số liệu theo VnExpress:
// gc: "Masterise Homes ra mắt 7 tòa căn hộ mới tại Ocean Park 2" (16/1/2026)
// op: "Dấu ấn thương hiệu Lumière tại Ocean Park 1" (17/10/2025)
// ep: "Masterise Homes mở rộng dòng Lumière tại Global Gate" (29/12/2025)
// sg: "Masterise Homes ra mắt dự án Hanoi Seasons Garden" (15/5/2026)
// Toạ độ: Google Maps. Ranh lô đất & khối tháp: ước lượng trên ảnh vệ tinh, minh hoạ.
import { ProjectConfig } from "./ProjectFly";
import { zoneRect } from "../kien/MapFx";

// Masteri Grand Coast: chuyển toạ độ ảnh mặt bằng (gc_plan.jpg 1500×1125) sang ảnh vệ tinh z17.
// Trục dài mặt bằng chạy theo trục lô đất (Bắc → Nam), phía hồ Wonder Wave (đáy mặt bằng) quay về phía Tây.
const GC_O: [number, number] = [1603.5, 2681.75];
const GC_S = 0.281, GC_U: [number, number] = [0.32, 0.948], GC_V: [number, number] = [-0.948, 0.32];
const gcMap = (pts: [number, number][]): [number, number][] =>
  pts.map(([x, y]) => [GC_O[0] + (x - 750) * GC_S * GC_U[0] + (y - 255) * GC_S * GC_V[0], GC_O[1] + (x - 750) * GC_S * GC_U[1] + (y - 255) * GC_S * GC_V[1]]);
const GC_PLAN = {
  L1: [[100, 128], [262, 128], [262, 182], [120, 182], [118, 238], [62, 238], [62, 150]],
  Z1: [[312, 203], [358, 203], [358, 272], [384, 272], [384, 378], [336, 378], [336, 300], [312, 300]],
  L2: [[440, 128], [600, 128], [628, 150], [628, 238], [572, 238], [570, 182], [440, 182]],
  Z2: [[737, 203], [783, 203], [783, 272], [809, 272], [809, 378], [761, 378], [761, 300], [737, 300]],
  L3: [[980, 128], [1142, 128], [1142, 182], [1000, 182], [998, 238], [942, 238], [942, 150]],
  Z3: [[1153, 203], [1200, 203], [1200, 300], [1176, 300], [1176, 378], [1130, 378], [1130, 272], [1153, 272]],
  L4: [[1240, 128], [1400, 128], [1428, 150], [1428, 238], [1372, 238], [1370, 182], [1240, 182]],
} as Record<string, [number, number][]>;
const bbox = (pts: [number, number][], pad = 8) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return zoneRect(Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad, 8);
};


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
  dur: [7.22, 7.3, 11.44, 7.34, 8.84, 10.74, 4.42],
  footprints: Object.values(GC_PLAN).map((pts) => ({ pts: gcMap(pts), h: 76 })),
  lake: { d: "M1221,2483 L1391,2468 L1421,2558 L1461,2728 L1491,2908 L1291,2908 L1181,2728 Z", label: [1330, 2620],
    small: "Đối diện", big: "HỒ WONDER WAVE PARK" },
  s4Card: { src: "m4/gc_front.jpg", label: "Phân khu The Wave (L1 · Z1 · L2) · Ảnh: Masterise Homes" },
  planTour: {
    src: "m4/gc_plan.jpg", w: 1500, h: 1125,
    steps: [
      { at: 0, cam: { x: 750, y: 330, zoom: 0.72 }, zones: Object.values(GC_PLAN).map((p) => bbox(p)) },
      { at: 2.6, cam: { x: 750, y: 300, zoom: 0.72 },
        zones: [zoneRect(30, 118, 272, 268, 14), zoneRect(398, 118, 330, 268, 14), zoneRect(818, 118, 310, 268, 14), zoneRect(1205, 118, 252, 268, 14)],
        label: { x: 560, y: 250, small: "Hệ tiện ích phân bổ trong", big: "4 CÔNG VIÊN NỘI KHU", dx: 90, dy: -250 } },
      { at: 4.8, cam: { x: 340, y: 230, zoom: 1.9 }, zones: [zoneRect(292, 118, 66, 64, 8)],
        label: { x: 325, y: 150, small: "Khu thể thao", big: "SÂN PICKLEBALL", dx: 110, dy: 150 } },
      { at: 6.0, cam: { x: 450, y: 290, zoom: 1.9 }, zones: [zoneRect(398, 222, 72, 110, 10)],
        label: { x: 434, y: 280, small: "Khu vui chơi", big: "TRẺ EM", dx: 120, dy: -150 } },
      { at: 7.2, cam: { x: 540, y: 330, zoom: 1.9 }, zones: [zoneRect(452, 310, 172, 52, 8)],
        label: { x: 538, y: 336, small: "Hồ bơi quy mô lớn", big: "BỂ BƠI OLYMPIC 50M", dx: -40, dy: 170 } },
    ],
  },
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
  dur: [7.11, 5.26, 9.15, 6.97, 6.75, 10.22, 4.48],
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
  dur: [6.87, 5.87, 7.76, 7.74, 6.7, 7.72, 4.44],
};

// Hanoi Seasons Garden: toạ độ ảnh tổng mặt bằng (sg_plan.jpg 1175×927) → ảnh vệ tinh z17.
// Mặt bằng: phía trên là đường Nguyễn Trãi (chạy Tây Nam → Đông Bắc trên vệ tinh), dự án nằm phía Đông Nam đường.
const SG_C: [number, number] = [1690, 2795], SG_PC: [number, number] = [591, 422];
const SG_S = 0.414, SG_U: [number, number] = [0.892, -0.452], SG_V: [number, number] = [0.452, 0.892];
const sgMap = (pts: [number, number][]): [number, number][] =>
  pts.map(([x, y]) => [SG_C[0] + (x - SG_PC[0]) * SG_S * SG_U[0] + (y - SG_PC[1]) * SG_S * SG_V[0],
    SG_C[1] + (x - SG_PC[0]) * SG_S * SG_U[1] + (y - SG_PC[1]) * SG_S * SG_V[1]]);
// 10 toà theo tổng mặt bằng (Masteri Iconic 2 toà · Lumière The Bloom L1, L2 · cụm phía Nam 6 toà)
const SG_PLAN: Record<string, [number, number][]> = {
  MI1: [[247, 142], [292, 142], [292, 292], [247, 292]],
  MI2: [[382, 142], [522, 142], [522, 295], [482, 295], [482, 182], [382, 182]],
  L1: [[630, 140], [800, 140], [800, 182], [680, 182], [680, 297], [630, 297]],
  L2: [[877, 140], [935, 140], [935, 297], [732, 297], [732, 257], [877, 257]],
  S1: [[247, 442], [415, 442], [415, 485], [285, 485], [285, 552], [247, 552]],
  S2: [[457, 535], [507, 535], [507, 705], [457, 705]],
  S3: [[247, 590], [290, 590], [290, 662], [415, 662], [415, 705], [247, 705]],
  S4: [[685, 460], [920, 460], [920, 705], [872, 705], [872, 505], [685, 505]],
  S5: [[655, 565], [700, 565], [700, 705], [655, 705]],
  S6: [[760, 655], [850, 655], [850, 705], [760, 705]],
};
const SG_H: Record<string, number> = { MI1: 112, MI2: 120, L1: 135, L2: 135, S1: 100, S2: 118, S3: 104, S4: 128, S5: 112, S6: 98 };
const SG_OUTLINE: [number, number][] = [[232, 125], [952, 125], [952, 720], [232, 720]];
const sgPath = (pts: [number, number][]) => "M" + pts.map((q) => q.join(",")).join(" L") + " Z";
const sgBox = (pts: [number, number][], pad = 6) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return zoneRect(Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad, 6);
};

export const SG: ProjectConfig = {
  key: "sg", name: "HANOI SEASONS GARDEN", line: "LUMIÈRE · THE BLOOM · NGUYỄN TRÃI",
  hook: ["TRÊN TRỤC", "NGUYỄN TRÃI"],
  p13: [1223, 2347], hg13: [1467, 2140], km: "5,7",
  p17: [1649, 2735], site: SG_C,
  parcel: sgPath(sgMap(SG_OUTLINE)),
  towers: [],
  footprints: Object.entries(SG_PLAN).map(([k, pts]) => ({ pts: sgMap(pts), h: SG_H[k] })),
  district: "Cửa ngõ Tây Nam · Thanh Xuân",
  travel: [
    { small: "Kết nối tuyến metro", big: "GA THƯỢNG ĐÌNH" },
    { small: "Vành đai 2,5 · Vành đai 3 → Nội Bài / Ocean City", big: "≈ 30 PHÚT" },
    { small: "Đại học Quốc gia · Bạch Mai · Quân y 103", big: "TIỆN ÍCH NGOẠI KHU" },
  ],
  s3Card: { src: "m4/sg_loc.jpg", label: "Vị trí trên trục Nguyễn Trãi · Ảnh: Masterise Homes" },
  ground: [{ t: "5 KHU VƯỜN", color: "#FFFFFF", size: 84 }, { t: "CHỦ ĐỀ", color: "#FFB02E", size: 96 }],
  landscape: { small: "Bể bơi bốn mùa", big: "MÁI VÒM CÁNH HOA" },
  s4Card: { src: "m4/sg_hd_17.jpg", label: "Mái vòm cánh hoa · Ảnh: Masterise Homes" },
  stat: { value: "10", label: "TÒA THÁP · CAO 35–46 TẦNG" },
  planTour: {
    src: "m4/sg_plan.jpg", w: 1175, h: 927,
    steps: [
      { at: 0, cam: { x: 592, y: 430, zoom: 0.95 }, zones: Object.values(SG_PLAN).map((p) => sgBox(p)) },
      { at: 3.0, cam: { x: 600, y: 410, zoom: 0.95 }, zones: [zoneRect(232, 125, 720, 595, 26)],
        label: { x: 300, y: 440, small: "Quỹ đất", big: "HƠN 8 HA", dx: 60, dy: -230 } },
      { at: 5.2, cam: { x: 780, y: 230, zoom: 2.0 }, zones: [sgBox(SG_PLAN.L1), sgBox(SG_PLAN.L2)],
        label: { x: 780, y: 220, small: "Phân khu đầu tiên", big: "THE BLOOM · L1 · L2", dx: -120, dy: 190 } },
      { at: 7.6, cam: { x: 620, y: 380, zoom: 2.1 }, zones: [zoneRect(565, 325, 115, 105, 52)],
        label: { x: 622, y: 378, small: "Bể bơi bốn mùa", big: "MÁI VÒM CÁNH HOA", dx: 110, dy: -170 } },
      { at: 9.4, cam: { x: 600, y: 580, zoom: 1.6 }, zones: [zoneRect(290, 560, 145, 75, 30), zoneRect(735, 525, 155, 60, 28)],
        label: { x: 815, y: 555, small: "Hồ bơi ngoài trời", big: "5 KHU VƯỜN CHỦ ĐỀ", dx: -60, dy: 190 } },
    ],
  },
  photos: [
    { src: "m4/sg_hd_15.jpg", kicker: "", label: "" },
    { src: "m4/sg_hd_12.jpg", kicker: "Ra mắt ngày 12/5", label: "PHÂN KHU THE BLOOM" },
    { src: "m4/sg_hd_03.jpg", kicker: "Masterise Hospitality vận hành", label: "CLUBHOUSE" },
    { src: "m4/sg_hd_01.jpg", kicker: "Business lounge", label: "ROOFTOP BAR" },
  ],
  newsRatio: 960 / 432,
  dur: [6.82, 5.05, 8.16, 5.12, 11.03, 9.73, 5.02],
};
