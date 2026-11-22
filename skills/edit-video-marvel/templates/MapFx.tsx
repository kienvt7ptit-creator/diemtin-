// Hiệu ứng "map flying" học từ video King Park (mã MF1–MF17 trong references/mau-map-flying.md; MF17 = Tower3D).
// Cách dùng: một tấm ảnh vệ tinh lớn (hoặc chuỗi ảnh Google Earth Studio) làm nền,
// mọi lớp vẽ đặt theo TOẠ ĐỘ PIXEL CỦA TẤM BẢN ĐỒ bên trong <MapCamera>.
// Khung 1080×1920, 30fps. Toàn bộ chuyển động lấy từ useCurrentFrame() (tất định).
import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeIO = Easing.inOut(Easing.cubic);

// ---------- Camera ----------
export type CamKey = { f: number; x: number; y: number; zoom: number; rotate?: number; tilt?: number };
type Cam = { x: number; y: number; zoom: number; rotate: number; tilt: number };
const CamCtx = createContext<Cam>({ x: 0, y: 0, zoom: 1, rotate: 0, tilt: 0 });
export const useCam = () => useContext(CamCtx);

export const camAt = (keys: CamKey[], frame: number): Cam => {
  const k = [...keys].sort((a, b) => a.f - b.f);
  if (frame <= k[0].f) return { rotate: 0, tilt: 0, ...k[0] };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i], b = k[i + 1];
    if (frame <= b.f) {
      const p = easeIO((frame - a.f) / Math.max(1, b.f - a.f));
      const lerp = (u: number, v: number) => u + (v - u) * p;
      return {
        x: lerp(a.x, b.x),
        y: lerp(a.y, b.y),
        // zoom nội suy theo log để tốc độ zoom đều mắt (MF4 crash zoom)
        zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom))),
        rotate: lerp(a.rotate ?? 0, b.rotate ?? 0),
        tilt: lerp(a.tilt ?? 0, b.tilt ?? 0),
      };
    }
  }
  const l = k[k.length - 1];
  return { rotate: 0, tilt: 0, ...l };
};

/** MF4/MF16 + tilt 3D: đặt điểm (x,y) của tấm bản đồ vào giữa khung. children vẽ theo toạ độ bản đồ. */
export const MapCamera: React.FC<{
  src: string;
  mapW: number;
  mapH: number;
  keys: CamKey[];
  children?: React.ReactNode;
  overlay?: React.ReactNode; // lớp theo toạ độ màn hình (thẻ, chữ giữa khung)
  background?: string; // nền phía sau tấm bản đồ (vd. gradient bầu trời khi camera nghiêng)
}> = ({ src, mapW, mapH, keys, children, overlay, background = "#0d130f" }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(keys, f);
  return (
    <AbsoluteFill style={{ background, overflow: "hidden", perspective: 1600 }}>
      <div
        style={{
          position: "absolute",
          left: width / 2,
          top: height / 2,
          width: mapW,
          height: mapH,
          transformOrigin: "0 0",
          transformStyle: "preserve-3d", // cho khối 3D (Tower3D) đứng lên khỏi mặt bản đồ
          // scale3d để chiều cao khối 3D zoom cùng tỉ lệ với mặt bản đồ
          transform: `rotateX(${cam.tilt}deg) rotate(${cam.rotate}deg) scale3d(${cam.zoom}, ${cam.zoom}, ${cam.zoom}) translate(${-cam.x}px, ${-cam.y}px)`,
        }}
      >
        <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: mapW, height: mapH }} />
        <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
      </div>
      {overlay}
    </AbsoluteFill>
  );
};

/** Giữ phần tử cố định cỡ trên màn hình dù bản đồ zoom/xoay (ghim, nhãn). */
const ScreenSize: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => {
  const cam = useCam();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0,
      transform: `scale(${1 / cam.zoom}) rotate(${-cam.rotate}deg)` }}>
      {children}
    </div>
  );
};

// ---------- Vẽ đường ----------
/** MF1/MF5/MF6: path tự vẽ có glow. Toạ độ bản đồ. label → chữ chạy dọc path (textPath). */
export const DrawPath: React.FC<{
  d: string;
  mapW: number;
  mapH: number;
  start?: number;
  dur?: number;
  color?: string;
  width?: number; // px trên màn hình
  glow?: number;
  fillOpacity?: number; // tô nền trong path kín (vd. tỉnh tô màu MF13)
  fill?: string;
  label?: string;
  labelColor?: string;
  labelSize?: number;
  id: string;
}> = ({ d, mapW, mapH, start = 0, dur = 30, color = "#8FD8FF", width = 5, glow = 14, fillOpacity = 0,
  fill, label, labelColor = "#7FB2FF", labelSize = 44, id }) => {
  const f = useCurrentFrame() - start;
  const cam = useCam();
  if (f < 0) return null;
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: easeIO });
  const sw = width / cam.zoom;
  const fo = interpolate(f, [dur * 0.6, dur], [0, fillOpacity], clamp);
  return (
    <svg width={mapW} height={mapH} viewBox={`0 0 ${mapW} ${mapH}`}
      style={{ position: "absolute", inset: 0, overflow: "visible",
        filter: `drop-shadow(0 0 ${glow / cam.zoom}px ${color}) drop-shadow(0 0 ${(glow * 2.5) / cam.zoom}px ${color})` }}>
      <path id={id} d={d} fill={fill ?? color} fillOpacity={fo} stroke={color} strokeWidth={sw}
        strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {label && (
        <text fill={labelColor} fontFamily="Montserrat" fontWeight={800} fontSize={labelSize / cam.zoom}
          letterSpacing={(labelSize * 0.25) / cam.zoom} opacity={interpolate(f, [dur, dur + 12], [0, 1], clamp)}>
          <textPath href={`#${id}`} startOffset="35%">{label}</textPath>
        </text>
      )}
    </svg>
  );
};

/** MF2: ảnh mặt bằng hiện bên trong ranh (cùng kích thước tấm bản đồ, nền trong suốt hoặc đã nắn). */
export const ClipReveal: React.FC<{ src: string; d: string; mapW: number; mapH: number; start?: number; dur?: number }> = ({
  src, d, mapW, mapH, start = 0, dur = 15,
}) => {
  const f = useCurrentFrame() - start;
  if (f < 0) return null;
  const shade = interpolate(f, [0, 8, dur], [0, 0.5, 0], clamp);
  const op = interpolate(f, [6, dur], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, width: mapW, height: mapH, clipPath: `path('${d}')` }}>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: shade }} />
      <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: mapW, height: mapH, opacity: op }} />
    </div>
  );
};

/** MF13: vòng cung sáng nối 2 điểm (toạ độ bản đồ). */
export const Arc: React.FC<{ from: [number, number]; to: [number, number]; lift?: number; start?: number; dur?: number;
  color?: string; mapW: number; mapH: number; id: string }> = ({ from, to, lift = 0.35, start = 0, dur = 24,
  color = "#BFE9FF", mapW, mapH, id }) => {
  const [x1, y1] = from, [x2, y2] = to;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const cx = mx - dy * lift, cy = my + dx * lift;
  return <DrawPath id={id} d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`} mapW={mapW} mapH={mapH} start={start} dur={dur}
    color={color} width={4} glow={10} fill="none" />;
};

// ---------- Ghim & nhãn (cỡ cố định trên màn hình) ----------
/** MF3/MF11: ghim có que, rơi + pop overshoot. content = huy hiệu/ảnh/icon tuỳ ý. */
export const MapPin: React.FC<{ x: number; y: number; start?: number; stem?: number; children: React.ReactNode }> = ({
  x, y, start = 0, stem = 70, children,
}) => {
  const f = useCurrentFrame() - start;
  if (f < 0) return null;
  const p = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
  const drop = interpolate(f, [0, 8], [-40, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <ScreenSize x={x} y={y}>
      <div style={{ position: "absolute", left: -2, top: -stem, width: 4, height: stem * Math.min(1, p),
        background: "linear-gradient(#ffffff, #5aa9ff)", boxShadow: "0 0 8px #5aa9ff" }} />
      <div style={{ position: "absolute", left: 0, top: -stem + drop, transform: `translate(-50%, -100%) scale(${0.6 + 0.4 * p})`,
        transformOrigin: "50% 100%", opacity: Math.min(1, p * 1.5) }}>
        {children}
      </div>
      <div style={{ position: "absolute", left: -10, top: -4, width: 20, height: 8, borderRadius: "50%",
        background: "rgba(0,0,0,.45)", opacity: p }} />
    </ScreenSize>
  );
};

/** MF9 (straight) / MF10 (elbow): đường dóng tự vẽ rồi nhãn 2 dòng gõ chữ. */
export const Callout: React.FC<{
  x: number; y: number; start?: number; small: string; big: string;
  dx?: number; dy?: number; elbow?: boolean; color?: string;
}> = ({ x, y, start = 0, small, big, dx = -260, dy = -120, elbow = true, color = "#FF8A1F" }) => {
  const f = useCurrentFrame() - start;
  if (f < 0) return null;
  const pl = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: easeIO });
  const pts = elbow ? `0,0 ${dx * 0.35},${dy} ${dx},${dy}` : `0,0 0,${dy}`;
  const ex = elbow ? dx : 0, ey = dy;
  const nSmall = Math.floor(interpolate(f, [8, 8 + small.length], [0, small.length], clamp));
  const nBig = Math.floor(interpolate(f, [12, 12 + big.length], [0, big.length], clamp));
  return (
    <ScreenSize x={x} y={y}>
      <div style={{ position: "absolute", left: -6, top: -6, width: 12, height: 12, borderRadius: 6, background: "#fff",
        boxShadow: `0 0 10px ${color}` }} />
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
        <polyline points={pts} fill="none" stroke="#fff" strokeWidth={3} pathLength={1} strokeDasharray={1}
          strokeDashoffset={1 - pl} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,.8))" }} />
      </svg>
      <div style={{ position: "absolute", left: ex, top: ey, transform: `translate(${elbow && dx < 0 ? "-100%" : elbow ? "0" : "-50%"}, -100%)`,
        whiteSpace: "nowrap", paddingBottom: 6, textAlign: elbow && dx < 0 ? "right" : "left" }}>
        <div style={{ fontFamily: "Great Vibes", fontSize: 34, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,.6)" }}>
          {small.slice(0, nSmall)}
        </div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 52, lineHeight: 1.2, color,
          textShadow: `0 0 12px ${color}, 0 2px 6px rgba(0,0,0,.7)` }}>
          {big.slice(0, nBig)}
        </div>
      </div>
    </ScreenSize>
  );
};

// ---------- Kính lúp (MF12) ----------
/** Kính lúp theo toạ độ màn hình; bên trong là tấm bản đồ phóng mag lần quanh điểm dưới kính.
 *  Dùng khi camera không xoay/nghiêng. grow: 0→1 phóng kính phủ khung = zoom xuyên qua kính.
 *  Mọi mốc frame (path.f, growFrom, start, end) là frame TUYỆT ĐỐI của composition — không bọc trong <Sequence>. */
export const Magnifier: React.FC<{
  src: string; mapW: number; mapH: number; keys: CamKey[];
  path: { f: number; x: number; y: number }[]; mag?: number; size?: number; growFrom?: number; growDur?: number;
  start?: number; end?: number;
}> = ({ src, mapW, mapH, keys, path, mag = 2, size = 300, growFrom, growDur = 15, start = -Infinity, end = Infinity }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (f < start || f > end) return null;
  const cam = camAt(keys, f);
  const xs = path.map((p) => p.f);
  const lx = interpolate(f, xs, path.map((p) => p.x), { ...clamp, easing: easeIO });
  const ly = interpolate(f, xs, path.map((p) => p.y), { ...clamp, easing: easeIO });
  const g = growFrom === undefined ? 0 : interpolate(f, [growFrom, growFrom + growDur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const D = size + g * Math.hypot(width, height) * 1.2;
  const mx = cam.x + (lx - width / 2) / cam.zoom;
  const my = cam.y + (ly - height / 2) / cam.zoom;
  const z = cam.zoom * mag;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: lx - D / 2, top: ly - D / 2, width: D, height: D, borderRadius: "50%",
        overflow: "hidden", boxShadow: "inset 0 0 30px rgba(255,255,255,.35), 0 10px 30px rgba(0,0,0,.5)",
        border: `${10 * (1 - g)}px solid #C9A14A` }}>
        <Img src={staticFile(src)} style={{ position: "absolute", left: D / 2, top: D / 2, width: mapW, height: mapH,
          transformOrigin: "0 0", transform: `scale(${z}) translate(${-mx}px, ${-my}px)` }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,.25), rgba(255,255,255,0) 45%)" }} />
      </div>
      {g < 0.05 && (
        <div style={{ position: "absolute", left: lx + size * 0.32, top: ly + size * 0.32, width: 34, height: size * 0.9,
          borderRadius: 17, background: "linear-gradient(90deg,#5a1a12,#9b3b26,#5a1a12)", transformOrigin: "50% 0",
          transform: "rotate(-40deg)", boxShadow: "0 6px 16px rgba(0,0,0,.5)" }} />
      )}
    </AbsoluteFill>
  );
};

// ---------- Chữ ----------
/** MF15: làm tối bản đồ + chữ 2 dòng giữa khung. */
export const DimCenterText: React.FC<{ line1: string; line2: string; start?: number; dur: number; dim?: number }> = ({
  line1, line2, start = 0, dur, dim = 0.6,
}) => {
  const f = useCurrentFrame() - start;
  if (f < 0 || f > dur) return null;
  const a = interpolate(f, [0, 9, dur - 8, dur], [0, 1, 1, 0], clamp);
  const b = interpolate(f, [3, 11], [14, 0], clamp);
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${dim * a})`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", opacity: a, filter: `blur(${b}px)` }}>
        <div style={{ fontFamily: "Be Vietnam Pro", fontWeight: 500, fontSize: 64, color: "#fff" }}>{line1}</div>
        <div style={{ fontFamily: "Be Vietnam Pro", fontWeight: 800, fontStyle: "italic", fontSize: 60, color: "#fff",
          letterSpacing: "0.04em", lineHeight: 1.4 }}>- {line2} -</div>
      </div>
    </AbsoluteFill>
  );
};

/** MF7: chữ 3D dựng trên mặt bản đồ (đặt trong MapCamera, cỡ cố định màn hình). */
export const Text3D: React.FC<{ x: number; y: number; text: string; start?: number; color?: string; depth?: number }> = ({
  x, y, text, start = 0, color = "#F2F4F7", depth = 10,
}) => {
  const f = useCurrentFrame() - start;
  if (f < 0) return null;
  const p = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const shadows = Array.from({ length: depth }, (_, i) => `0 ${i + 1}px 0 ${i < depth / 2 ? "#9aa3ad" : "#5d6670"}`).join(",");
  return (
    <ScreenSize x={x} y={y}>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%, -100%) perspective(800px) rotateX(40deg) scaleY(${p})`,
        transformOrigin: "50% 100%", fontFamily: "Montserrat", fontWeight: 800, fontSize: 130, lineHeight: 1.25,
        color, whiteSpace: "nowrap", textShadow: `${shadows}, 0 ${depth + 8}px 24px rgba(0,0,0,.6)` }}>
        {text}
      </div>
    </ScreenSize>
  );
};

// ---------- Khối nhà 3D (MF17) ----------
/** Khối hộp 3D mọc lên từ mặt bản đồ (toà tháp). Đặt trong <MapCamera>, toạ độ & kích thước theo pixel bản đồ.
 *  w×d: mặt bằng, h: chiều cao (px bản đồ; 1 px ≈ m/px của tấm ảnh). Cần camera có tilt để thấy chiều cao. */
export const Tower3D: React.FC<{
  x: number; y: number; w: number; d: number; h: number; start?: number; dur?: number; rotate?: number;
  facade?: string; roof?: string; glow?: string;
}> = ({ x, y, w, d, h, start = 0, dur = 24, rotate = 0, facade = "#EEF3F1", roof = "#5E8F4E", glow = "#7FE7C4" }) => {
  const f = useCurrentFrame() - start;
  const p = f < 0 ? 0 : interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const H = Math.max(0.01, h * p);
  const floors = (shade: number): React.CSSProperties => ({
    position: "absolute",
    background: `repeating-linear-gradient(0deg, rgba(40,70,80,${0.55 * shade}) 0 1.2px, transparent 1.2px 3.4px),
      repeating-linear-gradient(90deg, rgba(30,60,70,${0.35 * shade}) 0 1px, transparent 1px 5px), ${facade}`,
    filter: `brightness(${shade})`,
    outline: `0.6px solid ${glow}`,
    backfaceVisibility: "visible",
  });
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - d / 2, width: w, height: d, transformStyle: "preserve-3d",
      transform: `rotate(${rotate}deg)` }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)", filter: "blur(3px)" }} />
      {/* Bắc, Nam */}
      <div style={{ ...floors(0.78), left: 0, top: 0, width: w, height: H, transformOrigin: "0 0", transform: "rotateX(90deg)" }} />
      <div style={{ ...floors(1.0), left: 0, top: d, width: w, height: H, transformOrigin: "0 0", transform: "rotateX(90deg)" }} />
      {/* Tây, Đông */}
      <div style={{ ...floors(0.88), left: 0, top: 0, width: H, height: d, transformOrigin: "0 0", transform: "rotateY(-90deg)" }} />
      <div style={{ ...floors(0.7), left: w, top: 0, width: H, height: d, transformOrigin: "0 0", transform: "rotateY(-90deg)" }} />
      {/* Mái xanh */}
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: d, background: roof, transform: `translateZ(${H}px)`,
        boxShadow: `0 0 4px ${glow}`, outline: `0.8px solid ${glow}` }} />
    </div>
  );
};

/** MF17b: toà tháp chữ Y – lõi giữa + 3 cánh lệch nhau 120°. angle = hướng cánh thứ nhất (độ, 0 = hướng Đông, chiều kim đồng hồ). */
export const TowerY: React.FC<{
  x: number; y: number; h: number; wing?: number; wingW?: number; core?: number; angle?: number; start?: number; dur?: number;
  facade?: string; roof?: string; glow?: string;
}> = ({ x, y, h, wing = 40, wingW = 16, core = 20, angle = -90, start = 0, dur = 24, ...style }) => (
  <>
    <Tower3D x={x} y={y} w={core} d={core} h={h} start={start} dur={dur} rotate={angle} {...style} />
    {[0, 120, 240].map((a) => {
      const r = ((angle + a) * Math.PI) / 180;
      const off = core / 2 + wing / 2 - 2;
      return (
        <Tower3D key={a} x={x + Math.cos(r) * off} y={y + Math.sin(r) * off} w={wing} d={wingW} h={h}
          start={start} dur={dur} rotate={angle + a} {...style} />
      );
    })}
  </>
);
