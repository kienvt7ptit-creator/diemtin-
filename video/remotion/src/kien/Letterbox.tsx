// Letterbox 2.39:1 trượt vào/ra. Chỉ dùng cho cảnh B-roll điện ảnh không có phụ đề.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const Letterbox: React.FC<{ durationFrames: number; ratio?: number; slide?: number }> = ({
  durationFrames,
  ratio = 2.39,
  slide = 10,
}) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // Khung dọc: dải ảnh 2.39:1 nằm ngang giữa khung; khung ngang: thanh trên/dưới chuẩn.
  const visibleH = Math.min(height, width / ratio);
  const bar = (height - visibleH) / 2;
  const ease = Easing.inOut(Easing.cubic);
  const k =
    interpolate(f, [0, slide], [0, 1], { extrapolateRight: "clamp", easing: ease }) *
    interpolate(f, [durationFrames - slide, durationFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease,
    });
  const h = bar * k;
  const s: React.CSSProperties = { position: "absolute", left: 0, width: "100%", height: h, background: "#0B0B0C" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...s, top: 0 }} />
      <div style={{ ...s, bottom: 0 }} />
    </AbsoluteFill>
  );
};
