// Video map flying "The Gamuda Central Park" – dựng theo skill baymapAI.
// Ảnh vệ tinh: Esri World Imagery (z14 toàn thành phố, z17 khu dự án). Voice: ElevenLabs Adam.
// Toạ độ dự án (Google Maps): 20.9596805, 105.8584847.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { MapCamera, DrawPath, MapPin, Callout, Arc, CamKey } from "./kien/MapFx";
import { KeywordStack, NumberRoll, TypeOn, BlurIn, COLORS } from "./kien/TextFx";

const FPS = 30;
// Thời lượng từng đoạn voice (giây), đo từ file ElevenLabs.
export const VO = [6.92, 10.98, 13.24, 9.87, 10.68, 9.64, 8.75];
const LEAD = 0.4; // trước câu đầu
const GAP = 0.45; // nghỉ giữa các đoạn
const OUTRO = 3.0;
const starts: number[] = [];
{
  let t = LEAD;
  for (const d of VO) {
    starts.push(t);
    t += d + GAP;
  }
}
export const TOTAL_S = starts[6] + VO[6] + OUTRO;
const f = (s: number) => Math.round(s * FPS);
const sceneLen = (i: number) => f((i < 6 ? starts[i + 1] : TOTAL_S) - (i === 0 ? 0 : starts[i]));
const sceneFrom = (i: number) => (i === 0 ? 0 : f(starts[i]));

// Tấm bản đồ
const Z14 = { src: "gcp/z14.jpg", w: 2560, h: 4096 };
const Z17 = { src: "gcp/z17.jpg", w: 3072, h: 5120 };
const P14: [number, number] = [1469, 2070]; // dự án trên z14
const HG14: [number, number] = [1398, 1209]; // Hồ Hoàn Kiếm trên z14
const P17: [number, number] = [1766, 2736]; // dự án trên z17
// Trục đường trên z17 (dò theo ảnh vệ tinh)
const VD3 = "M0,2130 L750,2115 L1200,2160 L1650,2235 L2100,2295 L2550,2280 L3072,2250";
const PVCG = "M840,1300 L870,1800 L900,2250 L990,2880 L1200,3300 L1560,3990";

const Badge: React.FC<{ title: string; sub?: string; bg?: string }> = ({ title, sub, bg = "linear-gradient(#0f5d4f,#06352c)" }) => (
  <div style={{ background: bg, border: "3px solid #E9C46A", borderRadius: 16, padding: "12px 22px", textAlign: "center",
    boxShadow: "0 10px 28px rgba(0,0,0,.55), 0 0 18px rgba(233,196,106,.45)", whiteSpace: "nowrap" }}>
    <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 34, color: "#F6DE6E", letterSpacing: "0.04em", lineHeight: 1.25 }}>{title}</div>
    {sub && <div style={{ fontFamily: "Be Vietnam Pro", fontWeight: 500, fontSize: 22, color: "#fff" }}>{sub}</div>}
  </div>
);

const Credit: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1395, textAlign: "center", fontFamily: "Be Vietnam Pro",
    fontSize: 18, color: "rgba(255,255,255,.75)", textShadow: "0 1px 3px #000" }}>
    Ảnh vệ tinh: Esri, Maxar, Earthstar Geographics · Thông tin: Gamuda Land, Tuổi Trẻ
  </div>
);

const BrandBug: React.FC = () => (
  <div style={{ position: "absolute", top: 238, right: 70, transform: "scale(0.75)", transformOrigin: "100% 0",
    fontFamily: "Montserrat", fontWeight: 800, fontSize: 30, color: "#fff", background: "rgba(0,0,0,.35)",
    padding: "8px 16px", borderRadius: 10, letterSpacing: "0.06em" }}>KIÊN BÁN NHÀ</div>
);

const Dim: React.FC<{ to?: number; at?: number }> = ({ to = 0.55, at = 0 }) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#000", opacity: interpolate(fr, [at, at + 10], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />;
};

// ---------- Cảnh ----------
const S1: React.FC = () => {
  const k: CamKey[] = [
    { f: 0, x: P14[0], y: P14[1] - 300, zoom: 0.5 },
    { f: sceneLen(0), x: P14[0], y: P14[1], zoom: 2.3 },
  ];
  return (
    <MapCamera src={Z14.src} mapW={Z14.w} mapH={Z14.h} keys={k}
      overlay={<KeywordStack kicker="GAMUDA LAND" keyword="CENTRAL PARK" color={COLORS.teal} script="Yên Sở" dur={sceneLen(0)} top={330} />}>
      <MapPin x={P14[0]} y={P14[1]} start={f(2.2)} stem={90}><Badge title="CENTRAL PARK" sub="Gamuda City · Yên Sở" /></MapPin>
    </MapCamera>
  );
};

const S2: React.FC = () => {
  const k: CamKey[] = [
    { f: 0, x: P14[0], y: P14[1], zoom: 2.3 },
    { f: f(1.4), x: (P14[0] + HG14[0]) / 2, y: (P14[1] + HG14[1]) / 2 + 60, zoom: 0.95 },
    { f: sceneLen(1), x: (P14[0] + HG14[0]) / 2, y: (P14[1] + HG14[1]) / 2 + 60, zoom: 1.05 },
  ];
  return (
    <MapCamera src={Z14.src} mapW={Z14.w} mapH={Z14.h} keys={k}>
      <MapPin x={P14[0]} y={P14[1]} stem={70}><Badge title="CENTRAL PARK" /></MapPin>
      <Callout x={P14[0] + 40} y={P14[1] + 20} start={f(1.6)} small="Đại đô thị Gamuda City" big=">270 HA" dx={110} dy={-130} color="#7FE7C4" />
      <MapPin x={HG14[0]} y={HG14[1]} start={f(4.5)} stem={60}><Badge title="HỒ HOÀN KIẾM" bg="linear-gradient(#8a1c2b,#4a0d16)" /></MapPin>
      <Arc id="hg" from={P14} to={HG14} lift={0.18} start={f(4.8)} dur={f(1.2)} mapW={Z14.w} mapH={Z14.h} color="#FFD27A" />
      <Callout x={(P14[0] + HG14[0]) / 2 - 60} y={(P14[1] + HG14[1]) / 2} start={f(6.2)} small="Đường chim bay" big="≈ 7,7 KM" dx={-150} dy={-90} color="#F6DE6E" />
    </MapCamera>
  );
};

const S3: React.FC = () => {
  const k: CamKey[] = [
    { f: 0, x: 1500, y: 2620, zoom: 0.48 },
    { f: f(6), x: 1400, y: 2550, zoom: 0.55 },
    { f: sceneLen(2), x: 1600, y: 2600, zoom: 0.62 },
  ];
  return (
    <MapCamera src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k}>
      <MapPin x={P17[0]} y={P17[1]} stem={80}><Badge title="CENTRAL PARK" /></MapPin>
      <DrawPath id="vd3" d={VD3} mapW={Z17.w} mapH={Z17.h} start={f(0.3)} dur={f(1.4)} color="#FF9F1C" width={9} fill="none"
        label="VÀNH ĐAI 3" labelColor="#FFE0A8" labelSize={40} />
      <DrawPath id="pvcg" d={PVCG} mapW={Z17.w} mapH={Z17.h} start={f(2.8)} dur={f(1.4)} color="#4CC9F0" width={9} fill="none"
        label="PHÁP VÂN – CẦU GIẼ" labelColor="#CDEFFF" labelSize={36} />
      <Callout x={2950} y={2255} start={f(6.6)} small="Sang Long Biên" big="CẦU THANH TRÌ →" dx={-120} dy={-150} color="#FF9F1C" />
      <Callout x={860} y={1500} start={f(5.4)} small="Vào nội đô" big="↑ TRUNG TÂM" dx={160} dy={-90} color="#F6DE6E" />
      <Callout x={1300} y={3350} start={f(9.0)} small="Xuôi các tỉnh" big="PHÍA NAM ↓" dx={160} dy={-80} color="#4CC9F0" />
    </MapCamera>
  );
};

const S4: React.FC = () => {
  const k: CamKey[] = [
    { f: 0, x: 1600, y: 2600, zoom: 0.62 },
    { f: f(2), x: 1450, y: 2560, zoom: 1.05, tilt: 22, rotate: -6 },
    { f: sceneLen(3), x: 1500, y: 2580, zoom: 1.15, tilt: 24, rotate: 8 },
  ];
  return (
    <MapCamera src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k}>
      <MapPin x={P17[0]} y={P17[1]} stem={80}><Badge title="CENTRAL PARK" /></MapPin>
      <Callout x={1350} y={2500} start={f(2.6)} small="Ngay cạnh" big="CÔNG VIÊN YÊN SỞ" dx={40} dy={-200} color="#7FE7C4" />
      <Callout x={1150} y={2850} start={f(5.0)} small="Chuỗi" big="HỒ ĐIỀU HÒA" dx={-40} dy={150} elbow={false} color="#4CC9F0" />
    </MapCamera>
  );
};

const Stat: React.FC<{ start: number; value: string; label: string; top: number; color?: string }> = ({ start, value, label, top, color }) => (
  <Sequence from={start} layout="none">
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
      <NumberRoll value={value} color={color} size={190} />
      <div><TypeOn text={label} start={6} dur={600} style={{ fontSize: 44, fontWeight: 800, letterSpacing: "0.08em" }} /></div>
    </div>
  </Sequence>
);

const S5: React.FC = () => {
  const k: CamKey[] = [
    { f: 0, x: 1500, y: 2580, zoom: 1.15 },
    { f: sceneLen(4), x: P17[0], y: P17[1], zoom: 1.6 },
  ];
  return (
    <MapCamera src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k}
      overlay={<>
        <Dim to={0.6} />
        <Stat start={f(0.3)} value="3" label="TÒA CHUNG CƯ" top={330} color={COLORS.teal} />
        <Stat start={f(1.8)} value="2.600+" label="CĂN HỘ" top={720} color={COLORS.yellow} />
        <Sequence from={f(4.8)} layout="none">
          <div style={{ position: "absolute", top: 1120, left: 0, right: 0, textAlign: "center" }}>
            <BlurIn dur={600}><span style={{ fontFamily: "Great Vibes", fontSize: 92, color: "#fff" }}>Phân khúc cao cấp</span></BlurIn>
            <div style={{ marginTop: 10 }}><TypeOn text="Sống · Thương mại · Tiện ích đồng bộ" start={20} dur={600} style={{ fontSize: 34 }} /></div>
          </div>
        </Sequence>
      </>}>
    </MapCamera>
  );
};

const S6: React.FC = () => {
  const k: CamKey[] = [
    { f: 0, x: P14[0], y: P14[1], zoom: 2.4, rotate: 0 },
    { f: sceneLen(5), x: P14[0], y: P14[1], zoom: 1.5, rotate: 10 },
  ];
  return (
    <MapCamera src={Z14.src} mapW={Z14.w} mapH={Z14.h} keys={k}
      overlay={<>
        <Dim to={0.45} />
        <KeywordStack kicker="CHỦ ĐẦU TƯ" keyword="GAMUDA LAND" color={COLORS.teal} script="Malaysia" dur={sceneLen(5)} top={360}
          sub="Thuộc tập đoàn Gamuda Berhad" />
      </>}>
      <MapPin x={P14[0]} y={P14[1]} stem={70}><Badge title="GAMUDA CITY" sub=">270 ha · Nam Hà Nội" /></MapPin>
    </MapCamera>
  );
};

const S7: React.FC = () => {
  const len = sceneLen(6);
  const k: CamKey[] = [
    { f: 0, x: P17[0], y: P17[1], zoom: 0.7 },
    { f: len, x: P17[0], y: P17[1] - 80, zoom: 1.3, tilt: 20, rotate: -10 },
  ];
  return (
    <MapCamera src={Z17.src} mapW={Z17.w} mapH={Z17.h} keys={k}
      overlay={<>
        <Dim to={0.5} at={f(4.5)} />
        <KeywordStack kicker="DỰ KIẾN RA MẮT" keyword="CUỐI 2026" color={COLORS.yellow} dur={len} top={330} />
        <Sequence from={f(4.6)} layout="none">
          <div style={{ position: "absolute", top: 820, left: 90, right: 90, textAlign: "center" }}>
            <TypeOn text="Nhận thông tin chi tiết – liên hệ" dur={600} style={{ fontSize: 40 }} />
            <div><BlurIn start={14} dur={600}><span style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 118, color: "#fff",
              textShadow: "0 6px 22px rgba(0,0,0,.6)", lineHeight: 1.3 }}>KIÊN</span></BlurIn></div>
            <div><TypeOn text="Kiên Bán Nhà" start={26} dur={600} style={{ fontFamily: "Great Vibes", fontSize: 76 }} /></div>
          </div>
        </Sequence>
      </>}>
      <MapPin x={P17[0]} y={P17[1]} stem={80}><Badge title="CENTRAL PARK" sub="Gamuda Land" /></MapPin>
    </MapCamera>
  );
};

const SCENES = [S1, S2, S3, S4, S5, S6, S7];

// SFX: whoosh ở đầu mỗi cảnh, boom ở các mốc lớn, pop khi ghim/nhãn hiện.
const SFX: { at: number; src: string; vol: number }[] = [
  { at: 0.1, src: "gcp/whoosh.wav", vol: 0.5 },
  { at: 2.6, src: "gcp/boom.wav", vol: 0.8 },
  ...starts.slice(1).map((s) => ({ at: s - 0.25, src: "gcp/whoosh.wav", vol: 0.45 })),
  { at: starts[1] + 6.2, src: "gcp/pop.wav", vol: 0.6 },
  { at: starts[2] + 0.3, src: "gcp/boom.wav", vol: 0.6 },
  { at: starts[4] + 0.3, src: "gcp/boom.wav", vol: 0.7 },
  { at: starts[4] + 1.8, src: "gcp/boom.wav", vol: 0.7 },
  { at: starts[6] + 4.6, src: "gcp/boom.wav", vol: 0.8 },
];

export const GamudaCP: React.FC = () => {
  const total = f(TOTAL_S);
  // nhạc nền: duck dưới voice, lên ở outro
  const padVol = (fr: number) =>
    interpolate(fr, [0, 20, total - f(OUTRO), total - f(OUTRO) + 15, total - 30, total], [0, 0.18, 0.18, 0.4, 0.4, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map((S, i) => (
        <Sequence key={i} from={sceneFrom(i)} durationInFrames={sceneLen(i)}>
          <S />
        </Sequence>
      ))}
      <BrandBug />
      <Credit />
      {VO.map((_, i) => (
        <Sequence key={`vo${i}`} from={f(starts[i])}>
          <Audio src={staticFile(`gcp/s${i + 1}.wav`)} />
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
