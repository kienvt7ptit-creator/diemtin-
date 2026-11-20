import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { loadFxFonts } from "./kien/fonts";
import { KeywordStack, NumberRoll, CtaLock, TypeOn } from "./kien/TextFx";
import { FloatCard, CardGrid } from "./kien/BrollFx";
import { MarvelTitle } from "./kien/MarvelTitle";
import { Letterbox } from "./kien/Letterbox";

loadFxFonts();

// Demo 10s dọc 1080×1920 gồm các hiệu ứng của skill edit-video-marvel.
const KienDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#1f2b22" }}>
    <Sequence durationInFrames={60}>
      <FloatCard src="demo-card.png">
        <div style={{ position: "absolute", top: 380, left: 90, right: 90 }}>
          <TypeOn text="Chỉ vỏn vẹn" dur={60} />
          <div style={{ textAlign: "right" }}>
            <NumberRoll value="604" />
          </div>
        </div>
      </FloatCard>
    </Sequence>
    <Sequence from={60} durationInFrames={60}>
      <KeywordStack kicker="ECO RETREAT" keyword="BIỆT THỰ" script="Rừng" dur={60} />
    </Sequence>
    <Sequence from={120} durationInFrames={60}>
      <CardGrid
        items={[
          { src: "demo-card.png", label: "Villa đại lộ" },
          { src: "demo-card.png", label: "Villa rừng đơn lập" },
          { src: "demo-card.png", label: "Villa rừng song lập" },
        ]}
      />
    </Sequence>
    <Sequence from={180} durationInFrames={60}>
      <AbsoluteFill style={{ background: "#0B0B0C" }} />
      <MarvelTitle kicker="CHƯƠNG I" lines={["VỊ TRÍ"]} durationFrames={60} />
      <Letterbox durationFrames={60} />
    </Sequence>
    <Sequence from={240} durationInFrames={60}>
      <CtaLock line1="Inbox ngay" bold="nhận layout chi tiết" name="Kiên" script="Biệt thự tầng hầm" sub="đẹp nhất dự án" dur={60} />
    </Sequence>
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition id="KienDemo" component={KienDemo} durationInFrames={300} fps={30} width={1080} height={1920} />
);
