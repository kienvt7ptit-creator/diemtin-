// Video map flying "The Gamuda Central Park" – dựng theo skill baymapAI (bản 6: + kỹ thuật học từ video Palm River:
// khoanh lô đất phát sáng, logo dự án đứng trên khu đất, trích bài báo đánh dấu vàng, chữ trên mặt đất, vòng khoanh, dip đen).
// Ảnh vệ tinh: Esri World Imagery (z14 toàn thành phố, z17 khu dự án). Voice: ElevenLabs Adam (tăng tốc 1,12x).
// Mặt bằng & phối cảnh: tài liệu Kiên cung cấp (Gamuda Land). Toạ độ dự án (Google Maps): 20.9596805, 105.8584847.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { MapCamera, DrawPath, MapPin, Callout, Arc, CamKey, TowerY, ParcelGlow, Billboard, Ring, GroundText, NewsCard, DipBlack } from "./kien/MapFx";
import { KeywordStack, NumberRoll, TypeOn, BlurIn, COLORS } from "./kien/TextFx";

const FPS = 30;
// Thứ tự đoạn voice: 1 hook, 2 vị trí, 3 kết nối, 4 cảnh quan, 8 tiện ích, 5 quy mô, 6 chủ đầu tư, 7 CTA
const ORDER = [1, 2, 3, 4, 8, 5, 6, 7];
const DUR: Record<number, number> = { 1: 6.15, 2: 9.8, 3: 11.79, 4: 8.79, 8: 12.37, 5: 9.5, 6: 8.59, 7: 7.8 };
const LEAD = 0.2;
const GAP = 0.15;
const OUTRO = 2.5;
const starts: number[] = [];
{
  let t = LEAD;
  for (const n of ORDER) {
    starts.push(t);
    t += DUR[n] + GAP;
  }
}
const LAST = ORDER.length - 1;
export const TOTAL_S = starts[LAST] + DUR[ORDER[LAST]] + OUTRO;
const f = (s: number) => Math.round(s * FPS);
const sceneFrom = (i: number) => (i === 0 ? 0 : f(starts[i]) - 4); // cắt hình sớm 4 frame trước câu mới
const sceneLen = (i: number) => (i < LAST ? sceneFrom(i + 1) : f(TOTAL_S)) - sceneFrom(i);

// Tấm bản đồ
const Z14 = { src: "gcp/z14.jpg", w: 2560, h: 4096 };
const Z17 = { src: "gcp/z17.jpg", w: 3072, h: 5120 };
const MP = { src: "gcp/masterplan.jpg", w: 2000, h: 1237 };
const P14: [number, number] = [1469, 2070];
const HG14: [number, number] = [1398, 1209];
const P17: [number, number] = [1766, 2736];
const VD3 = "M0,2130 L750,2115 L1200,2160 L1650,2235 L2100,2295 L2550,2280 L3072,2250";
const PVCG = "M840,1300 L870,1800 L900,2250 L990,2880 L1200,3300 L1560,3990";
const SKY = "linear-gradient(180deg, #8fb8d8 0%, #cfe0e8 22%, #e9e4d6 30%, #3a4a3a 31%)";
const SITE: [number, number] = [1925, 2758]; // tâm lô đất (khoảng trống phía Đông ghim Google Maps, giữa đường Gamuda Yên Sở và bờ kênh)
// Ranh lô đất đo trên ảnh vệ tinh z17 (~1,1 m/px → ~32.000 m², tài liệu ghi ~35.000 m²)
const PARCEL = "M1800,2712 L1960,2702 L2048,2702 L2050,2795 L1800,2822 Z";

// 3 toà tháp mô phỏng hình chữ Y cùng hướng (lõi + 3 cánh, theo mặt bằng tổng thể; chiều cao minh hoạ)
const TowerSet: React.FC<{ start?: number; dur?: number }> = ({ start = 0, dur = 24 }) => (
  <>
    {[-82, 0, 82].map((dx, i) => (
      <TowerY key={i} x={SITE[0] + dx} y={SITE[1]} h={118} wing={32} wingW={13} core={16} angle={-90}
        start={start + i * 5} dur={dur} />
    ))}
  </>
);

/** Logo Central Park: biểu tượng (vector hoá từ brochure) + wordmark serif. */
const ProjectLogo: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ textAlign: "center", transform: `scale(${scale})`, transformOrigin: "50% 100%",
    filter: "drop-shadow(0 0 10px rgba(255,255,255,.55)) drop-shadow(0 6px 20px rgba(0,0,0,.6))" }}>
    <Img src={staticFile("gcp/cp_emblem.svg")} style={{ width: 420, height: 420 * 335 / 1037, objectFit: "contain" }} />
    <div style={{ fontFamily: "Cormorant Garamond", fontWeight: 600, fontSize: 74, letterSpacing: "0.16em", color: "#fff",
      lineHeight: 1.1, whiteSpace: "nowrap", marginTop: 4 }}>CENTRAL PARK</div>
    <div style={{ fontFamily: "Be Vietnam Pro", fontWeight: 500, fontSize: 20, letterSpacing: "0.42em", color: "#F3E3B5",
      whiteSpace: "nowrap", marginTop: 2 }}>A GAMUDA LAND COMMUNITY</div>
  </div>
);

/** Lô đất phát sáng + 3 tháp + (tuỳ chọn) logo đứng trên khu đất. */
const Site: React.FC<{ glowAt?: number; towersAt?: number; logoAt?: number; logoLift?: number; logoScale?: number }> = ({
  glowAt = 0, towersAt = 0, logoAt, logoLift = 260, logoScale = 1,
}) => (
  <>
    <ParcelGlow id="cp" d={PARCEL} mapW={3072} mapH={5120} start={glowAt} dur={glowAt === 0 ? 1 : 22} />
    <TowerSet start={towersAt} dur={towersAt === 0 ? 1 : 24} />
    {logoAt !== undefined && (
      <Billboard x={SITE[0]} y={SITE[1] - 20} lift={logoLift} start={logoAt}><ProjectLogo scale={logoScale} /></Billboard>
    )}
  </>
);

/** PR2: hook 2 dòng giữa khung (trắng + cam), nền tối nhẹ. */
const CenterHook: React.FC<{ a: string; b: string; dur: number; top?: number }> = ({ a, b, dur, top = 700 }) => {
  const fr = useCurrentFrame();
  const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const p = interpolate(fr, [0, 8, dur - 6, dur], [0, 1, 1, 0], cl);
  const bl = interpolate(fr, [0, 8], [14, 0], cl);
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.35 * p})` }}>
      <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center", opacity: p, filter: `blur(${bl}px)` }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 84, color: "#fff", lineHeight: 1.2, textShadow: "0 6px 20px rgba(0,0,0,.6)" }}>{a}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 92, color: "#FF9F1C", lineHeight: 1.2, textShadow: "0 6px 20px rgba(0,0,0,.6)" }}>{b}</div>
      </div>
    </AbsoluteFill>
  );
};

const Badge: React.FC<{ title: string; sub?: string; bg?: string }> = ({ title, sub, bg = "linear-gradient(#0f5d4f,#06352c)" }) => (
  <div style={{ background: bg, border: "3px solid #E9C46A", borderRadius: 16, padding: "12px 22px", textAlign: "center",
    boxShadow: "0 10px 28px rgba(0,0,0,.55), 0 0 18px rgba(233,196,106,.45)", whiteSpace: "nowrap" }}>
    <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 34, color: "#F6DE6E", letterSpacing: "0.04em", lineHeight: 1.25 }}>{title}</div>
    {sub && <div style={{ fontFamily: "Be Vietnam Pro", fontWeight: 500, fontSize: 22, color: "#fff" }}>{sub}</div>}
  </div>
);

const Dim: React.FC<{ to?: number; at?: number }> = ({ to = 0.5, at = 0 }) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#000", opacity: interpolate(fr, [at, at + 8], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />;
};

/** Thẻ ảnh bay vào có motion-blur (MF8). */
const FlyCard: React.FC<{ src: string; top: number; start: number; label?: string; from?: "left" | "right"; w?: number; ratio?: number }> = ({
  src, top, start, label, from = "right", w = 940, ratio = 1536 / 781,
}) => {
  const fr = useCurrentFrame() - start;
  if (fr < 0) return null;
  const p = interpolate(fr, [0, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const dx = (from === "right" ? 1 : -1) * (1 - p) * 1100;
  return (
    <div style={{ position: "absolute", left: (1080 - w) / 2, top, width: w, transform: `translateX(${dx}px) rotate(${(1 - p) * 4}deg)`,
      filter: `blur(${(1 - p) * 14}px)` }}>
      <div style={{ borderRadius: 22, overflow: "hidden", border: "4px solid #E9C46A", boxShadow: "0 20px 50px rgba(0,0,0,.6)", aspectRatio: `${ratio}` }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${1.04 + 0.04 * Math.min(1, fr / 200)})` }} />
      </div>
      {label && <div style={{ marginTop: 10, textAlign: "center", fontFamily: "Be Vietnam Pro", fontWeight: 600, fontSize: 30, color: "#fff",
        textShadow: "0 2px 8px #000" }}>{label}</div>}
    </div>
  );
};

// ---------- Cảnh ----------
const S1: React.FC = () => {
  const len = sceneLen(0);
  const cut = f(2.4);
  const k14: CamKey[] = [{ f: 0, x: P14[0], y: P14[1] - 400, zoom: 0.55 }, { f: cut, x: P14[0], y: P14[1], zoom: 4.5 }];
  const k17: CamKey[] = [
    { f: 0, x: SITE[0], y: SITE[1], zoom: 1.1, tilt: 10 },
    { f: len - cut, x: SITE[0], y: SITE[1] - 60, zoom: 2.2, tilt: 50, rotate: -12 },
  ];
  return (
    <>
      <Sequence durationInFrames={cut}>
        <MapCamera src={Z14.src} mapW={Z14.w} mapH={Z14.h} keys={k14} />
      </Sequence>
      <Sequence from={cut}>
        <MapCamera background={SKY} src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k17}>
          <Site glowAt={2} towersAt={14} logoAt={30} logoLift={170} logoScale={0.5} />
        </MapCamera>
      </Sequence>
      <Sequence durationInFrames={cut} layout="none">
        <CenterHook a="GIỮA PHÍA NAM" b="HÀ NỘI" dur={cut} />
      </Sequence>
    </>
  );
};

const S2: React.FC = () => {
  const len = sceneLen(1);
  const mid: [number, number] = [(P14[0] + HG14[0]) / 2, (P14[1] + HG14[1]) / 2 + 60];
  const k: CamKey[] = [
    { f: 0, x: P14[0], y: P14[1], zoom: 2.6 },
    { f: f(0.9), x: mid[0], y: mid[1], zoom: 0.95 },
    { f: len, x: mid[0], y: mid[1], zoom: 1.1 },
  ];
  return (
    <MapCamera src={Z14.src} mapW={Z14.w} mapH={Z14.h} keys={k}
      overlay={<>
        <FlyCard src="gcp/locmap.jpg" top={1030} start={f(7.2)} w={620} ratio={1630 / 965} from="left" />
        <Ring x={519} y={1186} r={62} dashed color="#FF2D55" start={f(7.8)} />
      </>}>
      <MapPin x={P14[0]} y={P14[1]} stem={70}><Badge title="CENTRAL PARK" /></MapPin>
      <Callout x={P14[0] + 40} y={P14[1] + 20} start={f(1.0)} small="Đại đô thị Gamuda City" big=">270 HA" dx={110} dy={-130} color="#7FE7C4" />
      <MapPin x={HG14[0]} y={HG14[1]} start={f(3.6)} stem={60}><Badge title="HỒ HOÀN KIẾM" bg="linear-gradient(#8a1c2b,#4a0d16)" /></MapPin>
      <Arc id="hg" from={P14} to={HG14} lift={0.18} start={f(3.8)} dur={f(1.0)} mapW={Z14.w} mapH={Z14.h} color="#FFD27A" />
      <Callout x={mid[0] - 60} y={mid[1] - 60} start={f(4.9)} small="Đường chim bay" big="≈ 7,7 KM" dx={-150} dy={-90} color="#F6DE6E" />
    </MapCamera>
  );
};

const S3: React.FC = () => {
  const len = sceneLen(2);
  const k: CamKey[] = [
    { f: 0, x: 1500, y: 2620, zoom: 0.5 },
    { f: f(5), x: 1420, y: 2560, zoom: 0.58, tilt: 18 },
    { f: len, x: 1650, y: 2640, zoom: 0.75, tilt: 30, rotate: 6 },
  ];
  return (
    <MapCamera background={SKY} src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k}>
      <Site />
      <Ring x={SITE[0]} y={SITE[1] - 10} r={70} start={f(0.4)} />
      <DrawPath id="vd3" d={VD3} mapW={Z17.w} mapH={Z17.h} start={f(0.2)} dur={f(1.0)} color="#FF9F1C" width={9} fill="none"
        label="VÀNH ĐAI 3" labelColor="#FFE0A8" labelSize={40} />
      <DrawPath id="pvcg" d={PVCG} mapW={Z17.w} mapH={Z17.h} start={f(2.2)} dur={f(1.0)} color="#4CC9F0" width={9} fill="none"
        label="PHÁP VÂN – CẦU GIẼ" labelColor="#CDEFFF" labelSize={36} />
      <Callout x={860} y={1500} start={f(4.6)} small="Vào nội đô" big="↑ TRUNG TÂM" dx={160} dy={-90} color="#F6DE6E" />
      <Callout x={2950} y={2255} start={f(5.8)} small="Sang Long Biên" big="CẦU THANH TRÌ →" dx={-120} dy={-150} color="#FF9F1C" />
      <Callout x={1300} y={3350} start={f(7.9)} small="Xuôi các tỉnh" big="PHÍA NAM ↓" dx={160} dy={-80} color="#4CC9F0" />
    </MapCamera>
  );
};

const S4: React.FC = () => {
  const len = sceneLen(3);
  const k: CamKey[] = [
    { f: 0, x: 1650, y: 2640, zoom: 0.75, tilt: 30, rotate: 6 },
    { f: f(1.4), x: 1600, y: 2620, zoom: 1.25, tilt: 48, rotate: -10 },
    { f: len, x: 1650, y: 2640, zoom: 1.4, tilt: 52, rotate: 14 },
  ];
  return (
    <MapCamera background={SKY} src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k}
      overlay={<FlyCard src="gcp/render.jpg" top={1000} start={f(4.6)} label="Phối cảnh dự án (minh hoạ)" />}>
      <Site />
      <Sequence durationInFrames={f(4.4)} layout="none">
        <GroundText x={1560} y={2905} start={6} lines={[{ t: "TỌA ĐỘ", color: "#FFFFFF", size: 84 }, { t: "XANH HIẾM CÓ", color: "#FFB02E", size: 90 }]} />
      </Sequence>
      <Callout x={1350} y={2500} start={f(1.6)} small="Ngay cạnh" big="CÔNG VIÊN YÊN SỞ" dx={40} dy={-200} color="#7FE7C4" />
      <Callout x={1150} y={2850} start={f(3.2)} small="Chuỗi" big="HỒ ĐIỀU HÒA" dx={-40} dy={150} elbow={false} color="#4CC9F0" />
    </MapCamera>
  );
};

// Ảnh tiện ích từ brochure Central Park (Gamuda Land) – nhãn theo chú thích trong brochure.
// Mốc theo khoảng lặng của voice s8f: bể bơi 4,0s · sân tennis/pickleball/bóng rổ 5,6s · mini golf 8,0s · rạp phim 8,8s · trẻ em 10,1s
const PHOTOS: { src: string; at: number; kicker: string; label: string }[] = [
  { src: "gcp/am_b28.jpg", at: 2.0, kicker: "Hơn 40 hạng mục", label: "TIỆN ÍCH NGOÀI TRỜI" },
  { src: "gcp/am_b17.jpg", at: 4.0, kicker: "Tầng 6", label: "BỂ BƠI VÔ CỰC" },
  { src: "gcp/am_b16.jpg", at: 5.6, kicker: "Tennis · Pickleball · Bóng rổ", label: "SÂN THỂ THAO" },
  { src: "gcp/am_b18.jpg", at: 8.0, kicker: "Không gian", label: "CỘNG ĐỒNG NGOÀI TRỜI" },
  { src: "gcp/am_b24.jpg", at: 8.8, kicker: "Tiện ích tháp", label: "PHÒNG CHIẾU PHIM" },
  { src: "gcp/am_b15.jpg", at: 10.1, kicker: "Cho các bé", label: "KHU VUI CHƠI TRẺ EM" },
];

const Photo: React.FC<{ src: string; len: number; kicker: string; label: string; i: number }> = ({ src, len, kicker, label, i }) => {
  const fr = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const p = interpolate(fr, [0, 7], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const dir = i % 2 === 0 ? 1 : -1;
  const kb = 1.08 + 0.1 * (fr / Math.max(1, len));
  const lp = interpolate(fr, [4, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `translateX(${dir * (1 - p) * 420}px)`, filter: `blur(${(1 - p) * 16}px)`, opacity: Math.min(1, p * 1.4) }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${kb}) translateX(${dir * -20 * (fr / Math.max(1, len))}px)` }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,.65) 100%)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1130, opacity: lp, transform: `translateY(${(1 - lp) * 30}px)` }}>
        <div style={{ fontFamily: "Great Vibes", fontSize: 58, color: "#fff", textShadow: "0 3px 10px #000", lineHeight: 1.2 }}>{kicker}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 66, color: "#F6DE6E", letterSpacing: "0.03em", lineHeight: 1.3,
          textShadow: "0 4px 16px rgba(0,0,0,.7)" }}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};

const S8: React.FC = () => {
  const len = sceneLen(4);
  const k: CamKey[] = [
    { f: 0, x: 1000, y: 618, zoom: 1.56 },
    { f: f(2.2), x: 1060, y: 600, zoom: 1.75 },
  ];
  return (
    <>
      <MapCamera src={MP.src} mapW={MP.w} mapH={MP.h} keys={k} />
      {PHOTOS.map((ph, i) => {
        const from = f(ph.at);
        const to = i < PHOTOS.length - 1 ? f(PHOTOS[i + 1].at) + 4 : len;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <Photo src={ph.src} len={to - from} kicker={ph.kicker} label={ph.label} i={i} />
          </Sequence>
        );
      })}
      <Sequence durationInFrames={f(2.4)} layout="none">
        <KeywordStack kicker="HƠN 40 TIỆN ÍCH" keyword="CHUẨN RESORT" color={COLORS.yellow} dur={f(2.4)} top={1080} />
      </Sequence>
    </>
  );
};

const Stat: React.FC<{ start: number; value: string; label: string; top: number; color?: string }> = ({ start, value, label, top, color }) => (
  <Sequence from={start} layout="none">
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
      <NumberRoll value={value} color={color} size={180} />
      <div><TypeOn text={label} start={5} dur={600} style={{ fontSize: 44, fontWeight: 800, letterSpacing: "0.08em" }} /></div>
    </div>
  </Sequence>
);

const S5: React.FC = () => {
  const len = sceneLen(5);
  const k: CamKey[] = [
    { f: 0, x: SITE[0], y: SITE[1] + 120, zoom: 1.7, tilt: 55, rotate: 30 },
    { f: len, x: SITE[0], y: SITE[1] + 120, zoom: 2.1, tilt: 58, rotate: -25 },
  ];
  return (
    <MapCamera background={SKY} src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k}
      overlay={<>
        <Dim to={0.22} />
        <Stat start={f(0.2)} value="2.600+" label="CĂN HỘ · 3 TÒA CHUNG CƯ" top={250} color={COLORS.yellow} />
        <NewsCard src="gcp/news_tt2a.jpg" ratio={960 / 972} start={f(2.8)} dur={len - f(2.8)} top={1010} width={900}
          source="Nguồn: Báo Tuổi Trẻ (tuoitre.vn)" />
      </>}>
      <Site />
    </MapCamera>
  );
};

const S6: React.FC = () => {
  const len = sceneLen(6);
  const k: CamKey[] = [
    { f: 0, x: P14[0], y: P14[1], zoom: 2.6 },
    { f: len, x: P14[0], y: P14[1], zoom: 1.4, rotate: 10 },
  ];
  return (
    <MapCamera src={Z14.src} mapW={Z14.w} mapH={Z14.h} keys={k}
      overlay={<>
        <Dim to={0.4} />
        <KeywordStack kicker="CHỦ ĐẦU TƯ" keyword="GAMUDA LAND" color={COLORS.teal} script="Malaysia" dur={len} top={340}
          sub="Thuộc tập đoàn Gamuda Berhad" />
        <NewsCard src="gcp/news_tt1.jpg" ratio={1000 / 403} start={f(2.6)} dur={sceneLen(6) - f(2.6)} top={1060} width={960}
          source="Nguồn: Báo Tuổi Trẻ (tuoitre.vn)" />
      </>}>
      <MapPin x={P14[0]} y={P14[1]} stem={70}><Badge title="GAMUDA CITY" sub=">270 ha · Nam Hà Nội" /></MapPin>
    </MapCamera>
  );
};

const S7: React.FC = () => {
  const len = sceneLen(7);
  const k: CamKey[] = [
    { f: 0, x: SITE[0], y: SITE[1] - 40, zoom: 1.3, tilt: 42, rotate: -18 },
    { f: len, x: SITE[0], y: SITE[1] - 20, zoom: 2.0, tilt: 55, rotate: 22 },
  ];
  return (
    <MapCamera background={SKY} src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k}
      overlay={<>
        <NewsCard src="gcp/news_tt2b.jpg" ratio={960 / 728} start={f(0.5)} dur={f(3.1)} top={1040} width={900}
          source="Nguồn: Báo Tuổi Trẻ (tuoitre.vn)" />
        <Dim to={0.45} at={f(3.6)} />
        <KeywordStack kicker="DỰ KIẾN RA MẮT" keyword="CUỐI 2026" color={COLORS.yellow} dur={len} top={330} />
        <Sequence from={f(3.8)} layout="none">
          <div style={{ position: "absolute", top: 1130, left: 60, right: 60, textAlign: "center" }}>
            <TypeOn text="Nhận thông tin chi tiết – gọi ngay" dur={600} style={{ fontSize: 40 }} />
            <div><BlurIn start={10} dur={600}><span style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 104, color: "#F6DE6E",
              textShadow: "0 6px 22px rgba(0,0,0,.6)", lineHeight: 1.3 }}>0969 950 111</span></BlurIn></div>
          </div>
        </Sequence>
      </>}>
      <Site />
    </MapCamera>
  );
};

const SCENES = [S1, S2, S3, S4, S8, S5, S6, S7];

// ---------- Lớp thương hiệu ----------
// Số điện thoại mờ chạy ngang giữa màn hình, trái → phải (lặp liên tục).
const Marquee: React.FC = () => {
  const fr = useCurrentFrame();
  const span = 1080 + 520; // quãng chạy: từ ngoài mép trái tới ngoài mép phải
  const x = ((fr * 6) % span) - 520;
  return (
    <div style={{ position: "absolute", top: 935, left: x, whiteSpace: "nowrap", fontFamily: "Montserrat", fontWeight: 700,
      fontSize: 52, color: "rgba(255,255,255,0.22)", letterSpacing: "0.04em", pointerEvents: "none",
      textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
      0969 950 111
    </div>
  );
};
const Credit: React.FC = () => (
  <div style={{ position: "absolute", right: 22, bottom: 18, maxWidth: 760, textAlign: "right", fontFamily: "Be Vietnam Pro",
    fontSize: 18, lineHeight: 1.35, color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,.85)" }}>
    Ảnh vệ tinh: Esri, Maxar, Earthstar Geographics<br />
    Mặt bằng, phối cảnh, tiện ích (minh hoạ): Gamuda Land · Nguồn tin: Gamuda Land, Báo Tuổi Trẻ
  </div>
);

const SFX: { at: number; src: string; vol: number }[] = [
  { at: 0.05, src: "gcp/whoosh.wav", vol: 0.55 },
  { at: 2.3, src: "gcp/whoosh.wav", vol: 0.6 },
  { at: 2.6, src: "gcp/boom.wav", vol: 0.85 },
  ...starts.slice(1).map((s) => ({ at: s - 0.2, src: "gcp/whoosh.wav", vol: 0.45 })),
  { at: starts[1] + 4.9, src: "gcp/pop.wav", vol: 0.6 },
  { at: starts[2] + 0.2, src: "gcp/boom.wav", vol: 0.6 },
  { at: starts[3] + 4.6, src: "gcp/whoosh.wav", vol: 0.55 },
  ...PHOTOS.map((ph) => ({ at: starts[4] + ph.at - 0.1, src: "gcp/whoosh.wav", vol: 0.4 })),
  { at: starts[5] + 0.2, src: "gcp/boom.wav", vol: 0.7 },
  { at: starts[5] + 1.4, src: "gcp/boom.wav", vol: 0.7 },
  { at: starts[6] + 3.4, src: "gcp/whoosh.wav", vol: 0.55 },
  { at: starts[7] + 3.8, src: "gcp/boom.wav", vol: 0.85 },
];

export const GamudaCP: React.FC = () => {
  const total = f(TOTAL_S);
  const padVol = (fr: number) =>
    interpolate(fr, [0, 15, total - f(OUTRO), total - f(OUTRO) + 12, total - 25, total], [0, 0.2, 0.2, 0.42, 0.42, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map((S, i) => (
        <Sequence key={i} from={sceneFrom(i)} durationInFrames={sceneLen(i)}>
          <S />
        </Sequence>
      ))}
      {[1, 4, 5].map((i) => (
        <Sequence key={`dip${i}`} from={sceneFrom(i) - 3} durationInFrames={6}>
          <DipBlack len={6} />
        </Sequence>
      ))}
      <Marquee />
      <Credit />
      {ORDER.map((n, i) => (
        <Sequence key={`vo${i}`} from={f(starts[i])}>
          <Audio src={staticFile(`gcp/s${n}f.wav`)} />
        </Sequence>
      ))}
      {SFX.map((s, i) => (
        <Sequence key={`sfx${i}`} from={f(s.at)}>
          <Audio src={staticFile(s.src)} volume={s.vol} />
        </Sequence>
      ))}
      <Audio src={staticFile("gcp/pad.wav")} volume={padVol} />
    </AbsoluteFill>
  );
};

export const GAMUDA_FRAMES = f(TOTAL_S);
