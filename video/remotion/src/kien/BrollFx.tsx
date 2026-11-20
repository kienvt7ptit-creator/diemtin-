// B-roll & chuyển cảnh học từ video mẫu (mã B1–B3, X2, X3, X5 trong
// references/mau-xen-ke-talking-head-bds.md). Khung 1080×1920, 30fps.
// X2 (whip-blur) và X3 (light leak lóe) MẶC ĐỊNH TẮT với Kiên — chỉ dùng khi Kiên yêu cầu.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// B1 — ảnh tĩnh thành video: push-in chậm (hoặc pan).
export const KenBurns: React.FC<{ src: string; from?: number; to?: number; panX?: number }> = ({
  src, from = 1, to = 1.06, panX = 0,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = f / Math.max(1, durationInFrames - 1);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${from + (to - from) * p}) translateX(${panX * p}px)` }} />
    </AbsoluteFill>
  );
};

// B2 — thẻ ảnh nổi bo góc trên nền chính ảnh đó phóng to + mờ.
export const FloatCard: React.FC<{ src: string; cardTop?: number; children?: React.ReactNode }> = ({
  src, cardTop = 640, children,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inP = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const drift = 1 + 0.04 * (f / durationInFrames);
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", inset: -60, width: "calc(100% + 120px)",
        height: "calc(100% + 120px)", objectFit: "cover", filter: "blur(30px) brightness(0.75)" }} />
      <div style={{ position: "absolute", left: "4%", width: "92%", top: cardTop, aspectRatio: "16 / 9",
        borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,.45)",
        transform: `translateY(${40 * (1 - inP)}px) scale(${0.96 + 0.04 * inP})`, opacity: inP }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${drift})` }} />
      </div>
      {children /* chữ/số đặt ngay trên thẻ, vd top = cardTop - 220 */}
    </AbsoluteFill>
  );
};

// B3 — lưới 3 thẻ sản phẩm trên nền màu thương hiệu, trượt vào lệch nhau 4f.
export const CardGrid: React.FC<{ items: { src: string; label: string }[]; bg?: string }> = ({
  items, bg = "#1FA88F",
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: bg, padding: "90px 40px", gap: 28, display: "flex", flexDirection: "column" }}>
      {items.slice(0, 3).map((it, i) => {
        const p = interpolate(f - i * 4, [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        return (
          <div key={i} style={{ flex: 1, position: "relative", borderRadius: 26, overflow: "hidden",
            border: "4px solid rgba(255,255,255,.75)", boxShadow: "0 14px 36px rgba(0,0,0,.25)",
            transform: `translateX(${(1 - p) * 110}%)`, opacity: p }}>
            <Img src={staticFile(it.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", left: 24, bottom: 18, fontFamily: "Montserrat", fontWeight: 700,
              fontSize: 28, letterSpacing: "0.04em", color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,.6)" }}>
              {it.label.toUpperCase()}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// X2 — whip-blur: đặt ở cuối cảnh A (mode="out") và đầu cảnh B (mode="in"), mỗi bên 4f.
// Chỉ bật khi Kiên yêu cầu. Áp lên container chứa cảnh.
export const whipStyle = (frame: number, len: number, mode: "in" | "out", dir: "x" | "y" = "y"): React.CSSProperties => {
  const p = mode === "out"
    ? interpolate(frame, [len - 4, len], [0, 1], clamp)
    : interpolate(frame, [0, 4], [1, 0], clamp);
  const shift = (mode === "out" ? -1 : 1) * 15 * p;
  return {
    transform: dir === "y" ? `translateY(${shift}%)` : `translateX(${shift}%)`,
    filter: `blur(${40 * p}px)`,
  };
};

// X3 — light leak đỏ–cam lóe tại điểm cắt (đặt Sequence bắt đầu 5f trước điểm cắt, dài 10f).
// Chỉ bật khi Kiên yêu cầu; mặc định thay bằng SoftLeak (opacity ≤ 0.35).
export const LeakFlash: React.FC<{ peak?: number; from?: "left" | "right" }> = ({ peak = 0.7, from = "left" }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 5, 10], [0, peak, 0], clamp);
  const pos = from === "left" ? "0% 100%" : "100% 0%";
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: o, pointerEvents: "none",
      background: `radial-gradient(120% 90% at ${pos}, #FF3B1F 0%, #FF8A3D 35%, rgba(255,160,80,0) 70%)` }} />
  );
};

// B8 / bản an toàn của X3 — light leak cam mềm ở mép, drift chậm.
export const SoftLeak: React.FC<{ opacity?: number }> = ({ opacity = 0.35 }) => {
  const f = useCurrentFrame();
  const x = 85 + 6 * Math.sin(f / 40);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity, pointerEvents: "none",
      background: `radial-gradient(70% 60% at ${x}% 85%, #FF8A3D 0%, rgba(255,138,61,0) 70%)` }} />
  );
};
