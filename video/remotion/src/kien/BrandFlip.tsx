// Thẻ thương hiệu kiểu "lật trang" — dùng ẢNH CỦA KIÊN và chữ của Kiên,
// KHÔNG dùng logo/chữ của Marvel Studios.
// Ảnh lật nhanh (2–3 frame/ảnh, cắt cứng, không flash) dưới khối chữ đỏ,
// sau đó chốt khối đỏ + tên kênh. Tổng ~45–60 frame. Gắn SFX braam ở frame chốt.
import React from "react";
import { AbsoluteFill, Img, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";

type Props = {
  images: string[];        // đường dẫn trong public/, vd "brand/01.jpg"
  title?: string;          // mặc định "KIÊN BÁN NHÀ"
  framesPerImage?: number; // mặc định 3
  lockFrames?: number;     // thời gian chốt sau khi lật, mặc định 24
};

export const BrandFlip: React.FC<Props> = ({
  images,
  title = "KIÊN BÁN NHÀ",
  framesPerImage = 3,
  lockFrames = 24,
}) => {
  const f = useCurrentFrame();
  const flipEnd = images.length * framesPerImage;
  const idx = Math.min(images.length - 1, Math.floor(f / framesPerImage));
  const locked = f >= flipEnd;
  const lockP = interpolate(f, [flipEnd, flipEnd + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(f, [flipEnd + lockFrames - 6, flipEnd + lockFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#0B0B0C", opacity: fadeOut }}>
      <AbsoluteFill style={{ opacity: locked ? 1 - lockP : 1 }}>
        <Img
          src={staticFile(images[idx])}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9) contrast(1.08)" }}
        />
        <AbsoluteFill style={{ background: "rgba(200,16,46,0.35)", mixBlendMode: "multiply" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            background: "#C8102E",
            padding: "22px 44px 14px",
            transform: `scale(${1.08 - 0.08 * lockP})`,
          }}
        >
          <div
            style={{
              fontFamily: "Anton",
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: "0.05em",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
