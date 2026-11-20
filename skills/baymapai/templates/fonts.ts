// Nạp 5 font (thêm Oswald cho kicker của MarvelTitle) của bộ hiệu ứng chữ (có subset tiếng Việt). Gọi loadFxFonts() một lần ở Root.
// Cài: npm i @remotion/google-fonts (cùng phiên bản với remotion).
import { loadFont as anton } from "@remotion/google-fonts/Anton";
import { loadFont as montserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as greatVibes } from "@remotion/google-fonts/GreatVibes";
import { loadFont as beVietnam } from "@remotion/google-fonts/BeVietnamPro";
import { loadFont as oswald } from "@remotion/google-fonts/Oswald";

export const loadFxFonts = () => {
  anton("normal", { weights: ["400"], subsets: ["vietnamese", "latin"] });
  montserrat("normal", { weights: ["700", "800"], subsets: ["vietnamese", "latin"] });
  greatVibes("normal", { weights: ["400"], subsets: ["vietnamese", "latin"] });
  beVietnam("normal", { weights: ["400", "500", "800"], subsets: ["vietnamese", "latin"] });
  oswald("normal", { weights: ["500", "700"], subsets: ["vietnamese", "latin"] });
};
