// Demo 12s các hiệu ứng map flying (M1–M16) trên bản đồ giả lập.
// Thay demo-map.jpg bằng ảnh vệ tinh thật / chuỗi ảnh Google Earth Studio, và vẽ lại các path theo ảnh đó.
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { MapCamera, DrawPath, ClipReveal, MapPin, Callout, Magnifier, DimCenterText, Text3D, Arc, CamKey } from "./MapFx";

const W = 2000;
const H = 2667;
const PROJECT = "M900,1180 L1060,1120 L1180,1200 L1160,1330 L1080,1440 L960,1420 L880,1320 Z";
const PROVINCE = "M300,500 L1300,380 L1750,800 L1700,1700 L1200,2200 L500,2050 L250,1300 Z";
const RIVER = "M700,1000 C850,1050 900,1100 1000,1080 S1250,1120 1300,1250 S1350,1500 1500,1600";

const keys: CamKey[] = [
  { f: 0, x: 1030, y: 1290, zoom: 2.6 },
  { f: 45, x: 1030, y: 1290, zoom: 2.6 },
  { f: 60, x: 1000, y: 1300, zoom: 0.78 }, // M4 crash zoom-out lên cấp tỉnh
  { f: 105, x: 1000, y: 1300, zoom: 0.8 },
  { f: 120, x: 1050, y: 1280, zoom: 2.2, tilt: 25, rotate: -8 }, // fly-in + nghiêng 3D
  { f: 210, x: 1040, y: 1290, zoom: 2.4, tilt: 25, rotate: 6 }, // orbit chậm (M16)
  { f: 225, x: 1000, y: 1300, zoom: 1.0 },
  { f: 360, x: 1000, y: 1300, zoom: 1.05 },
];

const Badge: React.FC<{ text: string; bg?: string }> = ({ text, bg = "linear-gradient(#2b2f6b,#121535)" }) => (
  <div style={{ background: bg, color: "#F6DE6E", fontFamily: "Montserrat", fontWeight: 800, fontSize: 26,
    padding: "10px 18px", borderRadius: 10, border: "2px solid #C9A14A", whiteSpace: "nowrap",
    boxShadow: "0 6px 18px rgba(0,0,0,.5)" }}>{text}</div>
);

export const MapDemo: React.FC = () => (
  <AbsoluteFill>
    <MapCamera
      src="demo-map.jpg"
      mapW={W}
      mapH={H}
      keys={keys}
      overlay={
        <>
          <Magnifier src="demo-map.jpg" mapW={W} mapH={H} keys={keys} mag={2.2} start={225} end={305} growFrom={285}
            path={[{ f: 225, x: 300, y: 600 }, { f: 255, x: 700, y: 1100 }, { f: 275, x: 540, y: 960 }]} />
          <DimCenterText line1="Ngược lại" line2="NẾU GIÁ HỢP LÝ" start={310} dur={50} />
        </>
      }
    >
      {/* M1 + M2 + M3 */}
      <DrawPath id="proj" d={PROJECT} mapW={W} mapH={H} dur={24} color="#9FE0FF" />
      <ClipReveal src="demo-masterplan.jpg" d={PROJECT} mapW={W} mapH={H} start={18} dur={18} />
      <MapPin x={1030} y={1180} start={30}><Badge text="KING PARK" /></MapPin>
      {/* M5 ranh tỉnh + ghim tỉnh */}
      <DrawPath id="prov" d={PROVINCE} mapW={W} mapH={H} start={55} dur={30} color="#D9F27A" width={6} fillOpacity={0.12} />
      <MapPin x={1400} y={900} start={75}><Badge text="Tỉnh Bắc Ninh" bg="linear-gradient(#d2283a,#7c0f1c)" /></MapPin>
      <Arc id="arc1" from={[1400, 900]} to={[1030, 1290]} start={85} mapW={W} mapH={H} />
      {/* M6 sông + chữ dọc sông */}
      <DrawPath id="river" d={RIVER} mapW={W} mapH={H} start={110} dur={25} color="#3B6BFF" width={26} fill="none" label="SÔNG CẦU" />
      {/* M7 chữ 3D */}
      <Sequence from={130} durationInFrames={50} layout="none">
        <Text3D x={1040} y={1400} text="268,8HA" />
      </Sequence>
      {/* M10 nhãn cam đường dóng gấp khúc, lần lượt */}
      <Callout x={960} y={1200} start={175} small="Thành phố" big="GIÀU CÓ" dx={-150} dy={-160} />
      <Callout x={1150} y={1330} start={190} small="Quỹ căn" big="GIỚI HẠN" dx={120} dy={-60} />
    </MapCamera>
  </AbsoluteFill>
);
