"""Lưới beat cho BGM trailer (theo video-shotcraft music-beat-sync).

Chạy:
  uv run --with librosa --with scipy --python 3.11 beats.py bgm.mp3 > beats.json

Xuất JSON: bpm, t0, T, residual_ms, beats[], downbeats[], hits[] (các cú đánh lớn
để đặt tiêu đề slam / smash cut), sections[] (đoạn năng lượng thấp/cao).
Tất cả thời gian là giây thực; chỉ đổi sang frame ở bước Remotion.
"""
import json
import sys

import librosa
import numpy as np


def main(path: str) -> None:
    y, sr = librosa.load(path, sr=None, mono=True)
    _, beats = librosa.beat.beat_track(y=y, sr=sr, tightness=400, units="time")
    if len(beats) < 8:
        sys.exit("Quá ít beat — có thể là nhạc không nhịp (ambient). Dựng theo nội dung, không ép cắt beat.")

    # Fit lưới đều t_i = t0 + i*T (tempo scalar của beat_track hay lệch ~2%)
    i = np.arange(len(beats))
    A = np.vstack([i, np.ones_like(i)]).T
    (T, t0), *_ = np.linalg.lstsq(A, beats, rcond=None)
    resid = beats - (t0 + i * T)

    # Hit lớn: các đỉnh onset strength vượt bách phân vị 97
    hop = 512
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    times = librosa.times_like(env, sr=sr, hop_length=hop)
    peaks = librosa.util.peak_pick(env, pre_max=10, post_max=10, pre_avg=20, post_avg=20, delta=0.5, wait=int(sr / hop))
    thr = np.percentile(env, 97)
    hits = [round(float(times[p]), 3) for p in peaks if env[p] >= thr]

    # Năng lượng theo đoạn 2s để tìm chỗ build-up và đỉnh
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    win = int(2 * sr / hop)
    sections = []
    for s in range(0, len(rms), win):
        seg = rms[s : s + win]
        sections.append({"t": round(float(times[min(s, len(times) - 1)]), 2), "rms": round(float(seg.mean()), 5)})

    out = {
        "bpm": round(60.0 / T, 3),
        "t0": round(float(t0), 4),
        "T": round(float(T), 5),
        "residual_ms": round(float(np.abs(resid).max() * 1000), 1),
        "grid_ok": bool(np.abs(resid).max() <= 0.015),
        "beats": [round(float(t0 + k * T), 4) for k in range(len(beats))],
        "downbeats": [round(float(t0 + k * T), 4) for k in range(0, len(beats), 4)],
        "hits": hits,
        "sections": sections,
        "note": "grid_ok=false → nhạc có đổi tempo, cần fit theo từng đoạn. Kiểm tra lưới 0.5x/2x nếu kick rơi vào nửa phách.",
    }
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Cách dùng: beats.py <bgm.mp3>")
    main(sys.argv[1])
