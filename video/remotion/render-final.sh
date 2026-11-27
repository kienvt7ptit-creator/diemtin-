#!/bin/bash
# Dùng: ./render-final.sh <CompositionId> <ten-file> — render + chuẩn hoá -14 LUFS + nén giao file
set -e
cd "$(dirname "$0")"
npx remotion render "$1" "out/$2-raw.mp4" --browser-executable=/opt/pw-browsers/chromium --concurrency=3 --timeout=240000 --crf=25 > "out/$2.log" 2>&1
J=$(ffmpeg -nostats -i "out/$2-raw.mp4" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
set -- "$1" "$2" $(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
ffmpeg -v error -i "out/$2-raw.mp4" -c:v libx264 -preset medium -crf 27 -maxrate 2.4M -bufsize 4.8M -pix_fmt yuv420p \
  -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$3:measured_TP=$4:measured_LRA=$5:measured_thresh=$6:offset=$7:linear=true" \
  -ar 48000 -c:a aac -b:a 160k -movflags +faststart -y "out/$2.mp4"
ls -la "out/$2.mp4"
