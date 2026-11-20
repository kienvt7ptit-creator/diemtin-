# Video – HyperFrames + Remotion

Hai bộ dựng video cho skill `edit-video-marvel` (`../skills/edit-video-marvel`).
Cần Node.js ≥ 22 và FFmpeg.

## HyperFrames (`hyperframes/`)
Video viết bằng HTML + GSAP, CLI ghim phiên bản `hyperframes@0.9.72`.

```bash
cd video/hyperframes
npm run dev      # mở Studio xem trước trên trình duyệt
npm run check    # kiểm tra lỗi, vùng an toàn TikTok/Shorts, độ tương phản
npm run render   # xuất MP4 vào renders/
```

`index.html` là demo 8 giây dọc 1080×1920: kicker gõ từng ký tự, số "604" blur-in,
chữ viết tay, từ khóa "BIỆT THỰ" gradient xanh ngọc + "Rừng" đè chéo.
Đọc `CLAUDE.md` trong thư mục để biết quy tắc của HyperFrames.

## Remotion (`remotion/`)
Video viết bằng React, ghim `remotion@4.0.250`. Đây là stack chính trong quy trình của Kiên.

```bash
cd video/remotion
npm install
npm run dev      # Remotion Studio
npm run still    # xuất 1 khung PNG
npm run render   # xuất out/kien-demo.mp4 (H.264, crf 25)
```

`src/kien/` chứa toàn bộ component của skill:
- `TextFx.tsx` – TypeOn, BlurIn, NumberRoll, KeywordStack, CtaLock, bảng màu/font
- `BrollFx.tsx` – KenBurns, FloatCard, CardGrid, whipStyle, LeakFlash, SoftLeak
- `MarvelTitle.tsx`, `Letterbox.tsx`, `BrandFlip.tsx` – bộ trailer
- `fonts.ts` – nạp Anton, Montserrat, Great Vibes, Be Vietnam Pro, Oswald (có tiếng Việt)

`src/Root.tsx` có composition `KienDemo` 10 giây dùng các component trên.

Lưu ý: chữ gradient (background-clip) cần `lineHeight ≥ 1.25` và `paddingTop` để không cắt mất dấu tiếng Việt.
