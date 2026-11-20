// Tiêu đề slam kiểu trailer: scale + blur vào trong 6–8 frame rồi đứng yên.
// Không rung, không chớp (quy tắc Kiên).
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

type Props = {
  lines: string[];            // 1–3 dòng, in hoa
  kicker?: string;            // dòng nhỏ phía trên, vd "CHƯƠNG I"
  variant?: "metal" | "red";  // kim loại bạc hoặc khối đỏ chữ trắng
  y?: number;                 // tâm dọc (px trên khung 1920). Mặc định 820
  inFrames?: number;          // mặc định 7
  durationFrames: number;     // tổng thời gian hiện
};

const METAL =
  "linear-gradient(180deg,#FFFFFF 0%,#C9CED6 45%,#6E7480 55%,#E8EBF0 100%)";

export const MarvelTitle: React.FC<Props> = ({
  lines,
  kicker,
  variant = "metal",
  y = 820,
  inFrames = 7,
  durationFrames,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, inFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const out = interpolate(f, [durationFrames - 6, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = 1.15 - 0.15 * p;
  const blur = 12 * (1 - p);

  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: y,
          transform: `translateY(-50%) scale(${scale})`,
          filter: `blur(${blur}px)`,
          opacity: p * out,
          textAlign: "center",
          width: 900,
        }}
      >
        {kicker && (
          <div
            style={{
              fontFamily: "Oswald",
              fontWeight: 500,
              fontSize: 32,
              letterSpacing: "0.3em",
              color: "#F4F1EA",
              opacity: 0.85,
              marginBottom: 18,
            }}
          >
            {kicker}
          </div>
        )}
        {lines.map((t, i) =>
          variant === "red" ? (
            <div
              key={i}
              style={{
                display: "inline-block",
                background: "#C8102E",
                color: "#FFFFFF",
                fontFamily: "Anton",
                fontSize: 128,
                lineHeight: 1.25,
                letterSpacing: "0.04em",
                padding: "10px 28px 6px",
                margin: "6px 0",
              }}
            >
              {t}
            </div>
          ) : (
            <div
              key={i}
              style={{
                fontFamily: "Anton",
                fontSize: 140,
                lineHeight: 1.3, // chừa chỗ cho dấu tiếng Việt (background-clip cắt phần vượt dòng)
                paddingTop: "0.1em",
                letterSpacing: "0.06em",
                backgroundImage: METAL,
                WebkitBackgroundClip: "text",
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(0,0,0,.6)",
                filter: "drop-shadow(0 6px 18px rgba(0,0,0,.55))",
              }}
            >
              {t}
            </div>
          )
        )}
      </div>
    </AbsoluteFill>
  );
};
