// Khuôn video map flying dùng chung cho các dự án (skill baymapAI, chuẩn Gamuda v6 + Palm River).
// Mỗi dự án chỉ khai báo một ProjectConfig: toạ độ trên ảnh vệ tinh, ranh lô đất, số liệu, ảnh, bài báo, thời lượng voice.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { MapCamera, MapPin, Callout, Arc, CamKey, Tower3D, ParcelGlow, Billboard, Ring, GroundText, NewsCard, DipBlack, Prism3D, TraceZone } from "../kien/MapFx";
import { KeywordStack, NumberRoll, TypeOn, BlurIn, COLORS } from "../kien/TextFx";

export type ProjectConfig = {
  key: string; // tiền tố file trong public/m4
  name: string; // tên hiển thị, vd "MASTERI GRAND COAST"
  line: string; // dòng nhỏ dưới tên, vd "MASTERISE HOMES · OCEAN PARK 2"
  hook: [string, string]; // hook 2 dòng (trắng / cam)
  p13: [number, number]; hg13: [number, number]; km: string; // trên ảnh z13 (2560×4096)
  p17: [number, number]; parcel: string; site: [number, number]; // trên ảnh z17 (3072×5120)
  towers: { dx: number; dy: number; w: number; d: number; h: number }[];
  district: string; // nhãn dưới ghim ở cảnh vị trí
  travel: { small: string; big: string }[]; // cảnh kết nối
  ground: { t: string; color?: string; size?: number }[]; // chữ trên mặt đất cảnh cảnh quan
  landscape: { small: string; big: string }; // nhãn đường dóng cảnh quan
  stat: { value: string; label: string };
  photos: { src: string; kicker: string; label: string }[]; // ảnh dự án (cảnh quan, tiện ích)
  newsRatio: number; // tỉ lệ ảnh {key}_news.jpg
  dur: number[]; // thời lượng 7 đoạn voice (giây, sau khi tăng tốc)
  // --- tuỳ chọn ---
  footprints?: { pts: [number, number][]; h: number }[]; // khối nhà theo đúng hình chiếu (toạ độ z17) – thay cho towers
  lake?: { d: string; label: [number, number]; small: string; big: string }; // khoanh mặt nước/cảnh quan ở cảnh 4 (z17)
  s4Card?: { src: string; label: string }; // ảnh thẻ ở cảnh 4
  s3Card?: { src: string; label: string }; // ảnh thẻ ở cảnh 3 (kết nối), đặt phía trên danh sách thời gian
  planTour?: PlanTour; // cảnh 5 dạng tour trên mặt bằng tổng thể: zoom + khoanh từng khu
};

export type PlanTour = {
  src: string; w: number; h: number;
  steps: { at: number; cam: { x: number; y: number; zoom: number }; zones: string[];
    label?: { x: number; y: number; small: string; big: string; dx: number; dy: number } }[];
};

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const SKY = "linear-gradient(180deg, #8fb8d8 0%, #cfe0e8 22%, #e9e4d6 30%, #3a4a3a 31%)";
const Z13 = { w: 2560, h: 4096 };
const Z17 = { w: 3072, h: 5120 };
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Thời lượng tối thiểu mỗi cảnh (giây) để kịp đọc thẻ bài báo / ảnh; phần dư có nhạc nền.
const MIN_SCENE = [6.5, 8.5, 8, 7.5, 8, 9, 5];
export const timeline = (dur: number[]) => {
  const LEAD = 0.2, GAP = 0.15, OUTRO = 2.5;
  const starts: number[] = [];
  let t = LEAD;
  dur.forEach((d, i) => { starts.push(t); t += Math.max(d, MIN_SCENE[i] ?? 0) + GAP; });
  const total = starts[starts.length - 1] + Math.max(dur[dur.length - 1], MIN_SCENE[dur.length - 1] ?? 0) + OUTRO;
  return { starts, total, OUTRO };
};
export const projectFrames = (c: ProjectConfig) => f(timeline(c.dur).total);

const Badge: React.FC<{ title: string; sub?: string; bg?: string }> = ({ title, sub, bg = "linear-gradient(#1b2b4a,#0d1626)" }) => (
  <div style={{ background: bg, border: "3px solid #E9C46A", borderRadius: 16, padding: "12px 22px", textAlign: "center",
    boxShadow: "0 10px 28px rgba(0,0,0,.55), 0 0 18px rgba(233,196,106,.45)", whiteSpace: "nowrap" }}>
    <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 32, color: "#F6DE6E", letterSpacing: "0.04em", lineHeight: 1.25 }}>{title}</div>
    {sub && <div style={{ fontFamily: "Be Vietnam Pro", fontWeight: 500, fontSize: 22, color: "#fff" }}>{sub}</div>}
  </div>
);

/** Wordmark dự án đứng trên khu đất (Billboard). */
const NameMark: React.FC<{ name: string; line: string; scale?: number }> = ({ name, line, scale = 1 }) => (
  <div style={{ textAlign: "center", transform: `scale(${scale})`, transformOrigin: "50% 100%",
    filter: "drop-shadow(0 0 10px rgba(255,255,255,.5)) drop-shadow(0 6px 20px rgba(0,0,0,.6))" }}>
    <div style={{ fontFamily: "Cormorant Garamond", fontWeight: 600, fontSize: 76, letterSpacing: "0.12em", color: "#fff",
      lineHeight: 1.15, whiteSpace: "nowrap" }}>{name}</div>
    <div style={{ height: 2, margin: "6px auto", width: "60%", background: "linear-gradient(90deg,transparent,#E9C46A,transparent)" }} />
    <div style={{ fontFamily: "Be Vietnam Pro", fontWeight: 500, fontSize: 22, letterSpacing: "0.32em", color: "#F3E3B5",
      whiteSpace: "nowrap" }}>{line}</div>
  </div>
);

const Dim: React.FC<{ to?: number; at?: number }> = ({ to = 0.5, at = 0 }) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#000", opacity: interpolate(fr, [at, at + 8], [0, to], cl) }} />;
};

const CenterHook: React.FC<{ a: string; b: string; dur: number; top?: number }> = ({ a, b, dur, top = 690 }) => {
  const fr = useCurrentFrame();
  const p = interpolate(fr, [0, 8, dur - 6, dur], [0, 1, 1, 0], cl);
  const bl = interpolate(fr, [0, 8], [14, 0], cl);
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.35 * p})` }}>
      <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center", opacity: p, filter: `blur(${bl}px)` }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 76, color: "#fff", lineHeight: 1.25, textShadow: "0 6px 20px rgba(0,0,0,.6)" }}>{a}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 86, color: "#FF9F1C", lineHeight: 1.25, textShadow: "0 6px 20px rgba(0,0,0,.6)" }}>{b}</div>
      </div>
    </AbsoluteFill>
  );
};

const FlyCard: React.FC<{ src: string; top: number; start: number; label?: string; w?: number }> = ({ src, top, start, label, w = 940 }) => {
  const fr = useCurrentFrame() - start;
  if (fr < 0) return null;
  const p = interpolate(fr, [0, 9], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: (1080 - w) / 2, top, width: w, transform: `translateX(${(1 - p) * 1100}px) rotate(${(1 - p) * 4}deg)`,
      filter: `blur(${(1 - p) * 14}px)` }}>
      <div style={{ borderRadius: 18, overflow: "hidden", border: "4px solid #E9C46A", boxShadow: "0 20px 50px rgba(0,0,0,.6)", aspectRatio: "16 / 9" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + 0.04 * Math.min(1, fr / 200)})` }} />
      </div>
      {label && <div style={{ marginTop: 10, textAlign: "center", fontFamily: "Be Vietnam Pro", fontWeight: 600, fontSize: 28, color: "#fff",
        textShadow: "0 2px 8px #000" }}>{label}</div>}
    </div>
  );
};

const Photo: React.FC<{ src: string; len: number; kicker: string; label: string; i: number }> = ({ src, len, kicker, label, i }) => {
  const fr = useCurrentFrame();
  const p = interpolate(fr, [0, 7], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const dir = i % 2 === 0 ? 1 : -1;
  const lp = interpolate(fr, [4, 12], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `translateX(${dir * (1 - p) * 420}px)`, filter: `blur(${(1 - p) * 16}px)`, opacity: Math.min(1, p * 1.4) }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${1.08 + 0.1 * (fr / Math.max(1, len))}) translateX(${dir * -20 * (fr / Math.max(1, len))}px)` }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,.65) 100%)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1130, opacity: lp, transform: `translateY(${(1 - lp) * 30}px)` }}>
        <div style={{ fontFamily: "Great Vibes", fontSize: 58, color: "#fff", textShadow: "0 3px 10px #000", lineHeight: 1.2 }}>{kicker}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 62, color: "#F6DE6E", letterSpacing: "0.03em", lineHeight: 1.3,
          textShadow: "0 4px 16px rgba(0,0,0,.7)" }}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Danh sách kết nối (thời gian di chuyển) trượt vào lần lượt. */
const TravelChips: React.FC<{ items: { small: string; big: string }[]; every: number; top?: number }> = ({ items, every, top = 1000 }) => {
  const fr = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top }}>
      {items.map((it, i) => {
        const p = interpolate(fr - i * every, [0, 9], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18, opacity: p, transform: `translateX(${(1 - p) * -80}px)`,
            background: "rgba(10,16,28,.72)", border: "2px solid rgba(233,196,106,.7)", borderRadius: 16, padding: "14px 22px" }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "#FF9F1C", boxShadow: "0 0 12px #FF9F1C" }} />
            <div>
              <div style={{ fontFamily: "Be Vietnam Pro", fontSize: 28, color: "#fff", lineHeight: 1.3 }}>{it.small}</div>
              <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 46, color: "#F6DE6E", lineHeight: 1.25 }}>{it.big}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ProjectFly: React.FC<{ c: ProjectConfig }> = ({ c }) => {
  const { starts, total, OUTRO } = timeline(c.dur);
  const N = c.dur.length;
  const from = (i: number) => (i === 0 ? 0 : f(starts[i]) - 4);
  const len = (i: number) => (i < N - 1 ? from(i + 1) : f(total)) - from(i);
  const Z13S = `m4/${c.key}_z13.jpg`, Z17S = `m4/${c.key}_z17.jpg`;
  const S = c.site;

  const Site: React.FC<{ glowAt?: number; towersAt?: number; logoAt?: number; logoLift?: number; logoScale?: number }> = ({
    glowAt = 0, towersAt = 0, logoAt, logoLift = 170, logoScale = 0.5 }) => (
    <>
      <ParcelGlow id={c.key} d={c.parcel} mapW={Z17.w} mapH={Z17.h} start={glowAt} dur={glowAt === 0 ? 1 : 22} />
      {c.footprints
        ? c.footprints.map((t, i) => <Prism3D key={i} pts={t.pts} h={t.h} start={towersAt + i * 3} dur={towersAt === 0 ? 1 : 22} />)
        : c.towers.map((t, i) => (
          <Tower3D key={i} x={S[0] + t.dx} y={S[1] + t.dy} w={t.w} d={t.d} h={t.h} start={towersAt + i * 3} dur={towersAt === 0 ? 1 : 22} />
        ))}
      {logoAt !== undefined && (
        <Billboard x={S[0]} y={S[1] - 10} lift={logoLift} start={logoAt}><NameMark name={c.name} line={c.line} scale={logoScale} /></Billboard>
      )}
    </>
  );

  // 1. Hook
  const S1: React.FC = () => {
    const L = len(0), cut = f(2.4);
    const k13: CamKey[] = [{ f: 0, x: c.p13[0], y: c.p13[1] - 300, zoom: 0.5 }, { f: cut, x: c.p13[0], y: c.p13[1], zoom: 3.2 }];
    const k17: CamKey[] = [{ f: 0, x: S[0], y: S[1], zoom: 1.0, tilt: 10 }, { f: L - cut, x: S[0], y: S[1] - 50, zoom: 1.9, tilt: 50, rotate: -12 }];
    return (
      <>
        <Sequence durationInFrames={cut}><MapCamera src={Z13S} mapW={Z13.w} mapH={Z13.h} keys={k13} /></Sequence>
        <Sequence from={cut}>
          <MapCamera background={SKY} src={Z17S} mapW={Z17.w} mapH={Z17.h} keys={k17}>
            <Site glowAt={2} towersAt={14} logoAt={30} logoLift={190} logoScale={0.55} />
          </MapCamera>
        </Sequence>
        <Sequence durationInFrames={cut} layout="none"><CenterHook a={c.hook[0]} b={c.hook[1]} dur={cut} /></Sequence>
      </>
    );
  };
  // 2. Vị trí + bài báo
  const S2: React.FC = () => {
    const L = len(1);
    const mid: [number, number] = [(c.p13[0] + c.hg13[0]) / 2, (c.p13[1] + c.hg13[1]) / 2];
    const k: CamKey[] = [{ f: 0, x: c.p13[0], y: c.p13[1], zoom: 2.4 }, { f: f(0.9), x: mid[0], y: mid[1] + 120, zoom: 0.85 }, { f: L, x: mid[0], y: mid[1] + 120, zoom: 0.95 }];
    return (
      <MapCamera src={Z13S} mapW={Z13.w} mapH={Z13.h} keys={k}
        overlay={<NewsCard src={`m4/${c.key}_news.jpg`} ratio={c.newsRatio} start={f(4.2)} dur={L - f(4.2)} top={1060} width={940} source="Nguồn: Báo VnExpress (vnexpress.net)" />}>
        <MapPin x={c.p13[0]} y={c.p13[1]} stem={70}><Badge title={c.name} sub={c.district} /></MapPin>
        <MapPin x={c.hg13[0]} y={c.hg13[1]} start={f(1.8)} stem={60}><Badge title="HỒ HOÀN KIẾM" bg="linear-gradient(#8a1c2b,#4a0d16)" /></MapPin>
        <Arc id={`hg-${c.key}`} from={c.p13} to={c.hg13} lift={0.18} start={f(2.0)} dur={f(1.0)} mapW={Z13.w} mapH={Z13.h} color="#FFD27A" />
        <Callout x={mid[0]} y={mid[1]} start={f(3.0)} small="Đường chim bay" big={`≈ ${c.km} KM`} dx={-150} dy={-90} color="#F6DE6E" />
      </MapCamera>
    );
  };
  // 3. Kết nối
  const S3: React.FC = () => {
    const L = len(2);
    const k: CamKey[] = [{ f: 0, x: c.p13[0], y: c.p13[1] + 260, zoom: 0.95 }, { f: L, x: c.p13[0], y: c.p13[1] + 260, zoom: 1.25, rotate: 6 }];
    return (
      <MapCamera src={Z13S} mapW={Z13.w} mapH={Z13.h} keys={k}
        overlay={<><Dim to={0.25} />
          {c.s3Card && <FlyCard src={c.s3Card.src} top={300} start={f(0.3)} w={900} label={c.s3Card.label} />}
          <Sequence from={f(0.5)} layout="none"><TravelChips items={c.travel} every={Math.max(20, Math.floor((L - f(1)) / (c.travel.length + 0.5)))} top={980} /></Sequence></>}>
        <Ring x={c.p13[0]} y={c.p13[1]} r={80} start={f(0.2)} />
        <MapPin x={c.p13[0]} y={c.p13[1]} stem={60}><Badge title={c.name} /></MapPin>
      </MapCamera>
    );
  };
  // 4. Cảnh quan
  const S4: React.FC = () => {
    const L = len(3);
    const k: CamKey[] = [{ f: 0, x: S[0], y: S[1] + 40, zoom: 0.7, tilt: 30, rotate: 6 }, { f: f(1.4), x: S[0], y: S[1] + 40, zoom: 1.2, tilt: 48, rotate: -10 }, { f: L, x: S[0], y: S[1] + 60, zoom: 1.35, tilt: 52, rotate: 12 }];
    return (
      <MapCamera background={SKY} src={Z17S} mapW={Z17.w} mapH={Z17.h} keys={k}
        overlay={<FlyCard src={c.s4Card?.src ?? c.photos[0].src} top={1010} start={f(Math.min(4.6, c.dur[3] - 3))} label={c.s4Card?.label ?? "Phối cảnh dự án · Ảnh: Masterise Homes"} />}>
        {c.lake && <TraceZone id={`lake-${c.key}`} d={c.lake.d} mapW={Z17.w} mapH={Z17.h} start={f(0.9)} color="#5EE7FF" fill="rgba(94,231,255,.14)" />}
        <Site />
        {c.lake
          ? <Callout x={c.lake.label[0]} y={c.lake.label[1]} start={f(1.6)} small={c.lake.small} big={c.lake.big} dx={60} dy={-190} color="#7FE7C4" />
          : <Callout x={S[0] - 160} y={S[1] + 40} start={f(1.6)} small={c.landscape.small} big={c.landscape.big} dx={-40} dy={-200} color="#7FE7C4" />}
        <Sequence durationInFrames={f(Math.min(4.4, c.dur[3] - 3.2))} layout="none">
          <GroundText x={S[0] - 60} y={S[1] + 170} start={6} lines={c.ground} />
        </Sequence>
      </MapCamera>
    );
  };
  // 5. Quy mô + bài báo
  const S5: React.FC = () => {
    const L = len(4);
    if (c.planTour) {
      const T = c.planTour;
      const keys: CamKey[] = T.steps.flatMap((st, i) => {
        const a = f(st.at), b = i < T.steps.length - 1 ? f(T.steps[i + 1].at) : L;
        return [{ f: a, ...st.cam }, { f: Math.max(a + 12, b - 1), x: st.cam.x, y: st.cam.y, zoom: st.cam.zoom * 1.04 }];
      });
      keys[0] = { ...keys[0], f: 0 };
      return (
        <MapCamera src={T.src} mapW={T.w} mapH={T.h} keys={keys}
          overlay={<>
            <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,0) 26%)" }} />
            <Sequence from={f(0.2)} layout="none">
              <div style={{ position: "absolute", top: 240, left: 0, right: 0, textAlign: "center" }}>
                <NumberRoll value={c.stat.value} color={COLORS.yellow} size={150} />
                <div><TypeOn text={c.stat.label} start={5} dur={600} style={{ fontSize: 40, fontWeight: 800, letterSpacing: "0.06em" }} /></div>
              </div>
            </Sequence>
          </>}>
          {T.steps.map((st, i) => {
            const a = f(st.at), b = i < T.steps.length - 1 ? f(T.steps[i + 1].at) + 6 : L;
            return (
              <Sequence key={i} from={a} durationInFrames={b - a} layout="none">
                {st.zones.map((z, j) => <TraceZone key={j} id={`z${i}-${j}`} d={z} mapW={T.w} mapH={T.h} start={j * 2} />)}
                {st.label && <Callout x={st.label.x} y={st.label.y} start={6} small={st.label.small} big={st.label.big} dx={st.label.dx} dy={st.label.dy} color="#FFD166" />}
              </Sequence>
            );
          })}
        </MapCamera>
      );
    }
    const k: CamKey[] = [{ f: 0, x: S[0], y: S[1] + 120, zoom: 1.6, tilt: 55, rotate: 30 }, { f: L, x: S[0], y: S[1] + 120, zoom: 2.0, tilt: 58, rotate: -25 }];
    return (
      <MapCamera background={SKY} src={Z17S} mapW={Z17.w} mapH={Z17.h} keys={k}
        overlay={<>
          <Dim to={0.2} />
          <Sequence from={f(0.2)} layout="none">
            <div style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center" }}>
              <NumberRoll value={c.stat.value} color={COLORS.yellow} size={170} />
              <div><TypeOn text={c.stat.label} start={5} dur={600} style={{ fontSize: 42, fontWeight: 800, letterSpacing: "0.06em" }} /></div>
            </div>
          </Sequence>
          <div style={{ position: "absolute", top: 210, right: 40, fontFamily: "Be Vietnam Pro", fontSize: 18, color: "rgba(255,255,255,.75)" }}>Khối 3D mô phỏng minh hoạ</div>
        </>}>
        <Site />
      </MapCamera>
    );
  };
  // 6. Tiện ích / điểm nhấn – ảnh dự án
  const S6: React.FC = () => {
    const L = len(5);
    const ph = c.photos.slice(1);
    const seg = Math.floor(L / ph.length);
    return (
      <>
        {ph.map((p, i) => (
          <Sequence key={i} from={i * seg} durationInFrames={i < ph.length - 1 ? seg + 4 : L - i * seg}>
            <Photo src={p.src} len={seg} kicker={p.kicker} label={p.label} i={i} />
          </Sequence>
        ))}
      </>
    );
  };
  // 7. CTA
  const S7: React.FC = () => {
    const L = len(6);
    const k: CamKey[] = [{ f: 0, x: S[0], y: S[1] - 40, zoom: 1.2, tilt: 42, rotate: -18 }, { f: L, x: S[0], y: S[1] - 20, zoom: 1.8, tilt: 55, rotate: 22 }];
    return (
      <MapCamera background={SKY} src={Z17S} mapW={Z17.w} mapH={Z17.h} keys={k}
        overlay={<>
          <Dim to={0.45} at={f(1.2)} />
          <Sequence from={f(1.4)} layout="none">
            <div style={{ position: "absolute", top: 1100, left: 60, right: 60, textAlign: "center" }}>
              <TypeOn text="Nhận thông tin chi tiết – gọi ngay" dur={600} style={{ fontSize: 40 }} />
              <div><BlurIn start={10} dur={600}><span style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 104, color: "#F6DE6E",
                textShadow: "0 6px 22px rgba(0,0,0,.6)", lineHeight: 1.3 }}>0969 950 111</span></BlurIn></div>
            </div>
          </Sequence>
        </>}>
        <Site logoAt={0} logoLift={190} logoScale={0.55} />
      </MapCamera>
    );
  };
  const SCENES = [S1, S2, S3, S4, S5, S6, S7];

  const Marquee: React.FC = () => {
    const fr = useCurrentFrame();
    const x = ((fr * 6) % 1600) - 520;
    return <div style={{ position: "absolute", top: 935, left: x, whiteSpace: "nowrap", fontFamily: "Montserrat", fontWeight: 700, fontSize: 52,
      color: "rgba(255,255,255,0.22)", letterSpacing: "0.04em", pointerEvents: "none" }}>0969 950 111</div>;
  };
  const totalF = f(total);
  const padVol = (fr: number) => interpolate(fr, [0, 15, totalF - f(OUTRO), totalF - f(OUTRO) + 12, totalF - 25, totalF], [0, 0.2, 0.2, 0.42, 0.42, 0], cl);
  const SFX = [
    { at: 0.05, src: "gcp/whoosh.wav", vol: 0.55 }, { at: 2.3, src: "gcp/whoosh.wav", vol: 0.6 }, { at: 2.6, src: "gcp/boom.wav", vol: 0.85 },
    ...starts.slice(1).map((s) => ({ at: s - 0.2, src: "gcp/whoosh.wav", vol: 0.45 })),
    { at: starts[1] + 3.0, src: "gcp/pop.wav", vol: 0.6 }, { at: starts[1] + 4.1, src: "gcp/whoosh.wav", vol: 0.5 },
    { at: starts[4] + 0.2, src: "gcp/boom.wav", vol: 0.7 }, { at: starts[6] + 1.4, src: "gcp/boom.wav", vol: 0.85 },
  ];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map((Sc, i) => (
        <Sequence key={i} from={from(i)} durationInFrames={len(i)}><Sc /></Sequence>
      ))}
      {[1, 3, 5].map((i) => (
        <Sequence key={`dip${i}`} from={from(i) - 3} durationInFrames={6}><DipBlack len={6} /></Sequence>
      ))}
      <Marquee />
      <div style={{ position: "absolute", right: 22, bottom: 18, maxWidth: 760, textAlign: "right", fontFamily: "Be Vietnam Pro",
        fontSize: 18, lineHeight: 1.35, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.85)" }}>
        Ảnh vệ tinh: Esri, Maxar, Earthstar Geographics<br />Phối cảnh (minh hoạ): Masterise Homes · Nguồn tin: Báo VnExpress
      </div>
      {c.dur.map((_, i) => (
        <Sequence key={`vo${i}`} from={f(starts[i])}><Audio src={staticFile(`m4/${c.key}_s${i + 1}.wav`)} /></Sequence>
      ))}
      {SFX.map((s, i) => (
        <Sequence key={`sfx${i}`} from={f(s.at)}><Audio src={staticFile(s.src)} volume={s.vol} /></Sequence>
      ))}
      <Audio src={staticFile("gcp/pad.wav")} volume={padVol} />
    </AbsoluteFill>
  );
};
