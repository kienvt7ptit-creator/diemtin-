// Hiệu ứng chữ học từ video mẫu "xen kẽ talking-head BĐS" (mã T1–T7, T12 trong
// references/mau-xen-ke-talking-head-bds.md). Khung 1080×1920, 30fps.
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const FONTS = {
  condensed: "Anton",          // từ khóa in hoa
  number: "Montserrat",        // con số (800)
  script: "Great Vibes",       // chữ viết tay đè chéo
  small: "Be Vietnam Pro",     // kicker / từ nối
};

export const COLORS = {
  magenta: "linear-gradient(180deg,#FB77FB,#BD44C0)",
  teal: "linear-gradient(180deg,#3FEDF1,#07858C)",
  navy: "linear-gradient(180deg,#3A64A8,#1E3570)",
  red: "#F2416B",
  yellow: "#F6DE6E",
  orange: "#F08A4B",
  mint: "#8FE3C8",
  darkGreen: "#2F5E3E",
};

const fill = (c: string): React.CSSProperties =>
  c.startsWith("linear-gradient")
    ? { backgroundImage: c, WebkitBackgroundClip: "text", color: "transparent" }
    : { color: c };

// T1 — gõ từng ký tự (~1 ký tự/frame), ra bằng fade.
export const TypeOn: React.FC<{
  text: string;
  start?: number;
  cps?: number; // ký tự mỗi frame
  dur: number;
  style?: React.CSSProperties;
}> = ({ text, start = 0, cps = 1, dur, style }) => {
  const f = useCurrentFrame() - start;
  if (f < 0) return null;
  const chars = Array.from(text);
  const n = Math.min(chars.length, Math.floor(f * cps) + 1);
  const op = interpolate(f, [dur - 4, dur], [1, 0], clamp);
  return (
    <span style={{ fontFamily: FONTS.small, fontWeight: 500, fontSize: 34, color: "#fff", opacity: op,
      textShadow: "0 2px 8px rgba(0,0,0,.45)", whiteSpace: "pre", ...style }}>
      {chars.slice(0, n).join("")}
    </span>
  );
};

// T5 — blur-in (số lớn / từ khóa). T6 — ra bằng motion-blur ngang.
export const BlurIn: React.FC<{
  children: React.ReactNode;
  start?: number;
  inF?: number;
  dur: number;
  exit?: "fade" | "whip-left" | "whip-right" | "shrink";
  style?: React.CSSProperties;
}> = ({ children, start = 0, inF = 7, dur, exit = "fade", style }) => {
  const f = useCurrentFrame() - start;
  if (f < 0 || f > dur) return null;
  const p = interpolate(f, [0, inF], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const q = interpolate(f, [dur - 5, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  let tx = 0, sx = 1, blurX = 0, op = p;
  if (exit === "whip-left" || exit === "whip-right") {
    tx = (exit === "whip-left" ? -1 : 1) * 180 * q;
    blurX = 20 * q;
    op = p * (1 - q);
  } else if (exit === "shrink") {
    sx = 1 - 0.45 * q;
    op = p * (1 - q);
  } else op = p * (1 - q);
  return (
    <div style={{ display: "inline-block", opacity: op,
      transform: `translateX(${tx}px) scale(${(1.08 - 0.08 * p) * sx})`,
      filter: `blur(${18 * (1 - p)}px)${blurX ? ` blur(${blurX / 3}px)` : ""}`, ...style }}>
      {children}
    </div>
  );
};

// T4 — số lăn kiểu slot: mỗi chữ số cuộn dọc, lệch nhau 2f, dừng có overshoot.
export const NumberRoll: React.FC<{
  value: string; // "604", "17", "4,5"
  start?: number;
  color?: string;
  size?: number;
}> = ({ value, start = 0, color = COLORS.yellow, size = 150 }) => {
  const f = useCurrentFrame() - start;
  if (f < 0) return null;
  const h = size * 1.05;
  return (
    <span style={{ display: "inline-flex", fontFamily: FONTS.number, fontWeight: 800, fontSize: size, lineHeight: `${h}px`,
      ...fill(color), textShadow: "none" }}>
      {Array.from(value).map((ch, i) => {
        const d = Number(ch);
        if (Number.isNaN(d)) return <span key={i}>{ch}</span>;
        const p = interpolate(f - i * 2, [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
        const spins = 10 + d; // cuộn qua 1 vòng rồi dừng ở chữ số đích
        const pos = p * spins;
        return (
          <span key={i} style={{ display: "inline-block", height: h, overflow: "hidden" }}>
            <span style={{ display: "block", transform: `translateY(${-(pos % 10) * h}px)` }}>
              {Array.from({ length: 11 }, (_, k) => (
                <span key={k} style={{ display: "block", height: h, ...fill(color) }}>{k % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

// T2 + T3 — xếp tầng: kicker nhỏ / từ khóa to (condensed hoặc số) / script đè chéo / dòng nhỏ dưới.
export const KeywordStack: React.FC<{
  kicker?: string;
  keyword: string;
  keywordFont?: "condensed" | "number";
  color?: string;
  script?: string;
  scriptColor?: string;
  sub?: string;
  dur: number;
  top?: number; // px trên khung 1920
  align?: "left" | "center";
}> = ({ kicker, keyword, keywordFont = "condensed", color = COLORS.teal, script, scriptColor = "#3FEDF1",
  sub, dur, top = 360, align = "center" }) => {
  const f = useCurrentFrame();
  const scriptP = interpolate(f, [8, 20], [0, 100], clamp); // wipe như đang viết
  const out = interpolate(f, [dur - 5, dur], [1, 0], clamp);
  const isNum = keywordFont === "number";
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, textAlign: align, opacity: out }}>
      {kicker && (
        <div style={{ textAlign: "left", marginBottom: 4 }}>
          <TypeOn text={kicker} dur={dur} />
        </div>
      )}
      <div style={{ position: "relative", display: "inline-block" }}>
        <BlurIn dur={dur + 10}>
          <span style={{ fontFamily: isNum ? FONTS.number : FONTS.condensed, fontWeight: isNum ? 800 : 400,
            fontSize: isNum ? 150 : 132, lineHeight: 1.3, paddingTop: "0.1em", letterSpacing: isNum ? "-0.02em" : "0.01em",
            ...fill(color), filter: "drop-shadow(0 4px 14px rgba(0,0,0,.35))" }}>
            {keyword}
          </span>
        </BlurIn>
        {script && (
          <span style={{ position: "absolute", right: -40, bottom: -64, fontFamily: FONTS.script, fontSize: 96,
            color: scriptColor, transform: "rotate(-8deg)", whiteSpace: "nowrap",
            clipPath: `inset(0 ${100 - scriptP}% 0 0)`, textShadow: "0 3px 10px rgba(0,0,0,.4)" }}>
            {script}
          </span>
        )}
      </div>
      {sub && (
        <div style={{ textAlign: "right", marginTop: script ? 40 : 6 }}>
          <TypeOn text={sub} start={8} dur={dur - 8} style={{ fontSize: 38 }} />
        </div>
      )}
    </div>
  );
};

// T12 — khóa CTA cuối video.
export const CtaLock: React.FC<{ line1: string; bold?: string; name: string; script: string; sub: string; dur: number }> = ({
  line1, bold, name, script, sub, dur,
}) => (
  <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center" }}>
    <TypeOn text={line1} dur={dur} style={{ fontSize: 26 }} />
    {bold && <TypeOn text={" " + bold} start={line1.length} dur={dur - line1.length} style={{ fontSize: 26, fontWeight: 800 }} />}
    <div><BlurIn start={6} dur={dur}><span style={{ fontFamily: FONTS.number, fontWeight: 800, fontSize: 110, color: "#fff",
      textShadow: "0 4px 16px rgba(0,0,0,.45)" }}>{name}</span></BlurIn></div>
    <div><TypeOn text={script} start={14} dur={dur - 14} style={{ fontFamily: FONTS.script, fontSize: 64 }} /></div>
    <div><TypeOn text={sub} start={26} dur={dur - 26} style={{ fontSize: 30 }} /></div>
  </div>
);
