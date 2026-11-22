// Video map flying "The Gamuda Central Park" – dựng theo skill baymapAI (bản 2: nhịp nhanh + tháp 3D).
// Ảnh vệ tinh: Esri World Imagery (z14 toàn thành phố, z17 khu dự án). Voice: ElevenLabs Adam (tăng tốc 1,12x).
// Mặt bằng & phối cảnh: tài liệu Kiên cung cấp (Gamuda Land). Toạ độ dự án (Google Maps): 20.9596805, 105.8584847.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { MapCamera, DrawPath, MapPin, Callout, Arc, CamKey, Tower3D } from "./kien/MapFx";
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
const SITE: [number, number] = [1900, 2715]; // tâm khu đất (khoảng trống phía Đông ghim Google Maps)

// 3 toà tháp mô phỏng (mặt bằng chữ L, ~1,1 m/px; chiều cao minh hoạ)
const TowerSet: React.FC<{ start?: number; dur?: number }> = ({ start = 0, dur = 24 }) => (
  <>
    {[-115, 0, 115].map((dx, i) => (
      <React.Fragment key={i}>
        <Tower3D x={SITE[0] + dx} y={SITE[1] - 8} w={66} d={22} h={118} start={start + i * 5} dur={dur} />
        <Tower3D x={SITE[0] + dx + 22} y={SITE[1] + 22} w={22} d={44} h={118} start={start + i * 5} dur={dur} />
      </React.Fragment>
    ))}
  </>
);

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
    { f: len - cut, x: SITE[0], y: SITE[1] + 30, zoom: 2.4, tilt: 52, rotate: -14 },
  ];
  return (
    <>
      <Sequence durationInFrames={cut}>
        <MapCamera src={Z14.src} mapW={Z14.w} mapH={Z14.h} keys={k14} />
      </Sequence>
      <Sequence from={cut}>
        <MapCamera background={SKY} src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k17}>
          <TowerSet start={4} dur={26} />
        </MapCamera>
      </Sequence>
      <KeywordStack kicker="GAMUDA LAND" keyword="CENTRAL PARK" color={COLORS.teal} script="Yên Sở" dur={len} top={360} />
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
      overlay={<FlyCard src="gcp/locmap.jpg" top={1030} start={f(7.2)} w={620} ratio={1630 / 965} from="left" />}>
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
      <TowerSet start={0} dur={1} />
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
      <TowerSet start={0} dur={1} />
      <Callout x={1350} y={2500} start={f(1.6)} small="Ngay cạnh" big="CÔNG VIÊN YÊN SỞ" dx={40} dy={-200} color="#7FE7C4" />
      <Callout x={1150} y={2850} start={f(3.2)} small="Chuỗi" big="HỒ ĐIỀU HÒA" dx={-40} dy={150} elbow={false} color="#4CC9F0" />
    </MapCamera>
  );
};

// Tiện ích trên mặt bằng tổng thể (toạ độ pixel ảnh masterplan 2000×1237)
const AMEN: { x: number; y: number; small: string; big: string; at: number; dx: number; dy: number }[] = [
  { x: 1070, y: 240, small: "Làn bơi", big: "OLYMPIC", at: 2.0, dx: 90, dy: 150 },
  { x: 910, y: 420, small: "Sân", big: "TENNIS", at: 3.4, dx: -90, dy: 140 },
  { x: 650, y: 630, small: "Sân", big: "PICKLEBALL", at: 4.6, dx: 100, dy: 130 },
  { x: 650, y: 545, small: "Sân", big: "BÓNG RỔ", at: 5.5, dx: -80, dy: -140 },
  { x: 918, y: 330, small: "Sân tập", big: "MINI GOLF", at: 6.6, dx: 100, dy: 130 },
  { x: 1420, y: 325, small: "Rạp chiếu phim", big: "NGOÀI TRỜI", at: 8.0, dx: -130, dy: 140 },
];
const S8: React.FC = () => {
  const len = sceneLen(4);
  const k: CamKey[] = [
    { f: 0, x: 1000, y: 618, zoom: 1.56 },
    { f: f(1.6), x: 1020, y: 600, zoom: 1.65 },
    { f: f(3.8), x: 820, y: 600, zoom: 1.65 },
    { f: f(5.8), x: 680, y: 600, zoom: 1.65 },
    { f: f(7.2), x: 960, y: 600, zoom: 1.65 },
    { f: f(9.0), x: 1340, y: 600, zoom: 1.65 },
    { f: len, x: 1300, y: 610, zoom: 1.6 },
  ];
  return (
    <MapCamera src={MP.src} mapW={MP.w} mapH={MP.h} keys={k}
      overlay={<>
        <KeywordStack kicker="HƠN 40 TIỆN ÍCH" keyword="CHUẨN RESORT" color={COLORS.yellow} dur={len} top={1080} />
        <Sequence from={f(9.0)} layout="none">
          <div style={{ position: "absolute", top: 1300, left: 0, right: 0, textAlign: "center" }}>
            <BlurIn dur={600}><span style={{ fontFamily: "Great Vibes", fontSize: 70, color: "#fff", textShadow: "0 3px 12px #000" }}>
              Vườn trẻ mầm non nội khu</span></BlurIn>
          </div>
        </Sequence>
      </>}>
      {AMEN.map((a, i) => (
        <Sequence key={i} from={f(a.at)} durationInFrames={f(2.6)} layout="none">
          <Callout x={a.x} y={a.y} small={a.small} big={a.big} dx={a.dx} dy={a.dy} color="#FFB347" />
        </Sequence>
      ))}
    </MapCamera>
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
    { f: 0, x: SITE[0], y: SITE[1] + 60, zoom: 1.6, tilt: 55, rotate: 40 },
    { f: len, x: SITE[0], y: SITE[1] + 60, zoom: 2.2, tilt: 58, rotate: -30 },
  ];
  return (
    <MapCamera background={SKY} src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k}
      overlay={<>
        <Dim to={0.3} />
        <Stat start={f(0.2)} value="3" label="TÒA CHUNG CƯ" top={300} color={COLORS.teal} />
        <Stat start={f(1.4)} value="2.600+" label="CĂN HỘ" top={1080} color={COLORS.yellow} />
        <Sequence from={f(3.6)} layout="none">
          <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center" }}>
            <BlurIn dur={600}><span style={{ fontFamily: "Great Vibes", fontSize: 80, color: "#fff", textShadow: "0 3px 12px #000" }}>Phân khúc cao cấp</span></BlurIn>
          </div>
        </Sequence>
        <div style={{ position: "absolute", top: 1290, right: 60, fontFamily: "Be Vietnam Pro", fontSize: 18, color: "rgba(255,255,255,.7)" }}>
          Khối 3D mô phỏng minh hoạ
        </div>
      </>}>
      <TowerSet start={0} dur={1} />
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
        <FlyCard src="gcp/masterplan.jpg" top={980} start={f(3.4)} w={760} ratio={2000 / 760} label="Mặt bằng tổng thể Central Park" />
      </>}>
      <MapPin x={P14[0]} y={P14[1]} stem={70}><Badge title="GAMUDA CITY" sub=">270 ha · Nam Hà Nội" /></MapPin>
    </MapCamera>
  );
};

const S7: React.FC = () => {
  const len = sceneLen(7);
  const k: CamKey[] = [
    { f: 0, x: SITE[0], y: SITE[1], zoom: 1.2, tilt: 40, rotate: -20 },
    { f: len, x: SITE[0], y: SITE[1] + 40, zoom: 2.0, tilt: 55, rotate: 25 },
  ];
  return (
    <MapCamera background={SKY} src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k}
      overlay={<>
        <Dim to={0.45} at={f(3.6)} />
        <KeywordStack kicker="DỰ KIẾN RA MẮT" keyword="CUỐI 2026" color={COLORS.yellow} dur={len} top={330} />
        <Sequence from={f(3.8)} layout="none">
          <div style={{ position: "absolute", top: 860, left: 60, right: 60, textAlign: "center" }}>
            <TypeOn text="Nhận thông tin chi tiết – gọi ngay" dur={600} style={{ fontSize: 40 }} />
            <div><BlurIn start={10} dur={600}><span style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 104, color: "#F6DE6E",
              textShadow: "0 6px 22px rgba(0,0,0,.6)", lineHeight: 1.3 }}>0969 950 111</span></BlurIn></div>
          </div>
        </Sequence>
      </>}>
      <TowerSet start={0} dur={1} />
    </MapCamera>
  );
};

const SCENES = [S1, S2, S3, S4, S8, S5, S6, S7];

// ---------- Lớp thương hiệu ----------
const Logo: React.FC = () => (
  <Img src={staticFile("gcp/logo.png")} style={{ position: "absolute", top: 238, right: 36, width: 420 }} />
);
const Watermark: React.FC = () => (
  <div style={{ position: "absolute", top: 930, left: 0, right: 0, textAlign: "center", fontFamily: "Montserrat", fontWeight: 700,
    fontSize: 46, color: "rgba(255,255,255,0.16)", letterSpacing: "0.03em", pointerEvents: "none" }}>
    Kiên Bán Nhà · 0969 950 111
  </div>
);
const Credit: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", fontFamily: "Be Vietnam Pro",
    fontSize: 17, color: "rgba(255,255,255,.7)", textShadow: "0 1px 3px #000" }}>
    Ảnh vệ tinh: Esri, Maxar, Earthstar Geographics · Mặt bằng, phối cảnh: Gamuda Land · Nguồn tin: Gamuda Land, Tuổi Trẻ
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
  ...AMEN.map((a) => ({ at: starts[4] + a.at, src: "gcp/pop.wav", vol: 0.5 })),
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
      <Watermark />
      <Logo />
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
