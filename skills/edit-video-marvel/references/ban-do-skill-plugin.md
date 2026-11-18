# Bản đồ skill & plugin — dùng gì cho bước nào

## Skill nội bộ của Kiên (đã huấn luyện)
| Skill | Dùng trong video Marvel để | Gọi |
|---|---|---|
| `kien-video-tiktok-facebook` (Loại 3) | Thân bài M2 dọc: Kiểu A talking-head (KCaptions, inset, Card), Kiểu B storytelling (KTitle gradient + chữ viết tay, SubSmall, cấu trúc 6 bước) | `Skill: anthropic-skills:kien-video-tiktok-facebook` |
| `kien-video-gioi-thieu-du-an-youtube` (Loại 2) | Thân bài M2 về dự án: Kiểu N (cụm 2–3 từ, ảnh chính sách) và Kiểu L ngang 16:9 (chip ý chính, B-roll phủ, thumbnail 1280×720 băng đỏ) | `Skill: anthropic-skills:kien-video-gioi-thieu-du-an-youtube` |
| `skill-nghia` | Gu thẩm mỹ anti-slop cho đồ họa, thẻ chữ, thumbnail; cấm neon/tím AI/emoji | `Skill: anthropic-skills:skill-nghia` |

## Plugin / skill dựng video
| Công cụ | Vai trò | Ghi chú |
|---|---|---|
| **Remotion** (`remotion:remotion-best-practices` là router) | Stack chính của Kiên | `remotion-markup` (transitions, light-leaks, video-editing, voiceover, audio-visualization, cropping), `remotion-captions` (phụ đề từ ASR), `remotion-render` (xuất), `remotion-studio` (xem thử) |
| **video-shotcraft** | 157 thẻ công thức cảnh quay + phương pháp beat-sync + sound design | Thẻ hay dùng: `rhythm/trailer-grammar-moves`, `rhythm/beat-cut-moves`, `rhythm/speed-ramp-freeze`, `rhythm/montage-rhythm-moves`, `rhythm/panel-grid-moves`, `rhythm/quad-split-parallel-scenes`, `rhythm/rhythm-interrupt-moves`, `opening/crane-rise-reveal`, `opening/text-as-mask`, `opening/letterspace-materialize`, `opening/fracture`, `effects/slam-entrance-moves`, `effects/impact-feedback`, `effects/light-play-moves`, `effects/spotlight-sweep-moves`, `effects/brand-frame-snap`, `camera/crash-zoom-punch`, `camera/depth-layer-moves`, `camera/tension-camera-moves`, `transition/shot-transitions`, `transition/transition-hidden-cut`, `transition/circle-match-iris`, `outro/logo-shrink-wordmark-lockup`, `outro/grain-dissolve`, `outro/edit-hook-moves`, `typography/cel-flash-stomp` (bỏ phần flash), `typography/type-rhythm-sync`. Tài liệu: `references/music-beat-sync.md`, `references/sound-design.md`, `references/aesthetic-rules.md`, `references/final-review.md` |
| **HyperFrames** (`anthropic-skills:hyperframes` là cửa vào) | Khi cần HTML/GSAP/Three.js/shader, Lottie, hoặc Kiên chọn HyperFrames | Các skill con: `hyperframes-core`, `-animation`, `-keyframes`, `-creative`, `-cli`, `-registry` |
| **media-use** | BGM, SFX, ảnh, icon, logo, voice TTS, grade/LUT, tách nền, phụ đề | `node <SKILL_DIR>/scripts/resolve.mjs --type bgm --intent "epic hybrid orchestral trailer" --project <dir>`; kiểm tra `--doctor` lần đầu |

## Plugin MCP
| Plugin | Việc trong pipeline |
|---|---|
| **vidIQ** | `keyword_research`, `outliers`, `trending_videos` (tìm trend trailer/BĐS); `generate_titles` + `score_title`; `generate_thumbnail` + `score_thumbnail` + `refine_thumbnail`; `generate_music` (nhạc epic có quyền); `voiceover_generate`; `find_broll`; `motion_graphics`; `tiktok_trending_sound_search`; `generate_video_chapters`; `video_upload` / `social_post_draft_create` / `instagram_publish_reel` (chỉ đăng khi Kiên bảo) |
| **ElevenLabs** | Voice trailer trầm: `creative_list_voices` chọn giọng (không bịa voice_id) hoặc `creative_design_voice` ("giọng nam trầm kiểu người dẫn trailer phim, tiếng Việt") → `creative_save_designed_voice` → `creative_generate_speech`. `creative_transcribe_audio` thay ASR khi cần. `creative_generate_image`/`creative_generate_video` cho nền/cảnh phụ (tốn credit, hỏi Kiên trước video dài). Mọi generation trả về flow → poll `creative_get_flow_run_status`, không gọi lại để "thử lại". Không kết nối được thì báo Kiên và dùng media-use/vidIQ |
| **Canva** | Thumbnail/poster phim, `remove-background`, `separate-image-layers` cho parallax 2.5D, `generate-image` cho nền |
| **Google Drive** | Lấy nguồn Kiên up (`search_files`, `download_file_content`), trả bản render (`create_file`) |
| **Notion** | Ghi doc dự án, tra lịch sử bài/brief (`notion-search`, `notion-create-pages`) |
| **Claude Docs / Artifact** | Storyboard dạng trang để Kiên duyệt nhanh khi chế độ cần duyệt |

## Lỗi hay gặp
- Máy ảo chậm khi encode → mã hoá theo đoạn ≤150 frame, có `-nostdin` + `timeout`; hoặc copy đoạn 6s lên cloud.
- Lệch tiếng sau cắt → đếm frame bằng làm tròn cộng dồn, không làm tròn từng đoạn.
- Remotion timeout → `--timeout=120000` + cache flag.
- Beat lệch nửa/gấp đôi → thử 0.5x/1x/2x, chọn lưới mà kick rơi vào phách nguyên nhiều nhất.
- File >25MB → tách rồi concat khi gửi.
