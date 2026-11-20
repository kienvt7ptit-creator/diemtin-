import { Config } from "@remotion/cli/config";

// Chuẩn của Kiên: H.264, crf 25 khi nén giao file.
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(25);
Config.setOverwriteOutput(true);
