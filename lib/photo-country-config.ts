export const countryCodes = ["US", "KR", "JP", "CN", "CA", "IN", "VN", "Other"] as const;
export const otherCountryCodes = ["TR", "MY", "HK", "FI", "AR"] as const;

export type CountryCode = (typeof countryCodes)[number] | (typeof otherCountryCodes)[number];

export type CountryProfile = {
  code: CountryCode;
  flag: string;
  country: string;
  heading: string;
  description: string;
  sizeLabel: string;
  shortSize: string;
  widthMm: number;
  heightMm: number;
  pixelWidth: number;
  pixelHeight: number;
  headHeightMm: number;
  topMarginMm: number;
  background: string;
  accent: string;
  accentSoft: string;
  ink: string;
};

export const COUNTRY_PROFILES: Record<CountryCode, CountryProfile> = {
  US: { code: "US", flag: "🇺🇸", country: "United States", heading: "Embassy-ready U.S. visa and passport photos.", description: "Upload once. We check face, expression, eyewear, composition, and the final 600 × 600 output before you pay.", sizeLabel: "2 × 2 inch", shortSize: "US 2 × 2", widthMm: 50.8, heightMm: 50.8, pixelWidth: 600, pixelHeight: 600, headHeightMm: 28, topMarginMm: 5, background: "linear-gradient(135deg,#071a4a 0%,#173c91 52%,#07152f 100%)", accent: "#67e8f9", accentSoft: "#cffafe", ink: "#082f49" },
  KR: { code: "KR", flag: "🇰🇷", country: "Korea", heading: "대한민국 여권사진을 정확한 규격으로 준비하세요.", description: "대한민국 여권용 3.5 × 4.5 cm 구도와 흰색 배경, 얼굴 위치를 결제 전에 확인합니다.", sizeLabel: "35 × 45 mm", shortSize: "KR 3.5 × 4.5", widthMm: 35, heightMm: 45, pixelWidth: 413, pixelHeight: 531, headHeightMm: 32, topMarginMm: 4, background: "linear-gradient(135deg,#071c4b 0%,#22569d 48%,#9f1239 115%)", accent: "#f43f5e", accentSoft: "#ffe4e6", ink: "#4c0519" },
  JP: { code: "JP", flag: "🇯🇵", country: "Japan", heading: "日本のパスポート写真を、正しいサイズで。", description: "日本旅券用 35 × 45 mm の構図、背景、顔の位置を作成前に確認します。", sizeLabel: "35 × 45 mm", shortSize: "JP 35 × 45", widthMm: 35, heightMm: 45, pixelWidth: 413, pixelHeight: 531, headHeightMm: 34, topMarginMm: 4, background: "linear-gradient(135deg,#3f0a17 0%,#9f1239 48%,#1f1116 100%)", accent: "#fb7185", accentSoft: "#ffe4e6", ink: "#4c0519" },
  CN: { code: "CN", flag: "🇨🇳", country: "China", heading: "中国护照照片，按标准尺寸制作。", description: "检查中国护照常用 33 × 48 mm 构图、白色背景和面部位置。", sizeLabel: "33 × 48 mm", shortSize: "CN 33 × 48", widthMm: 33, heightMm: 48, pixelWidth: 390, pixelHeight: 567, headHeightMm: 33, topMarginMm: 4, background: "linear-gradient(135deg,#5f0711 0%,#b91c1c 55%,#451a03 100%)", accent: "#facc15", accentSoft: "#fef9c3", ink: "#713f12" },
  CA: { code: "CA", flag: "🇨🇦", country: "Canada", heading: "Canadian passport photos, sized and checked.", description: "Prepare the 50 × 70 mm Canadian passport format with composition and face-height guidance.", sizeLabel: "50 × 70 mm", shortSize: "CA 50 × 70", widthMm: 50, heightMm: 70, pixelWidth: 591, pixelHeight: 827, headHeightMm: 34, topMarginMm: 5, background: "linear-gradient(135deg,#450a0a 0%,#dc2626 52%,#2a0909 100%)", accent: "#ffffff", accentSoft: "#fee2e2", ink: "#7f1d1d" },
  IN: { code: "IN", flag: "🇮🇳", country: "India", heading: "India passport photos, ready in the correct format.", description: "Validate the 35 × 45 mm passport layout, white background, expression, and face placement.", sizeLabel: "35 × 45 mm", shortSize: "IN 35 × 45", widthMm: 35, heightMm: 45, pixelWidth: 413, pixelHeight: 531, headHeightMm: 32, topMarginMm: 4, background: "linear-gradient(135deg,#7c2d12 0%,#1e3a8a 50%,#14532d 100%)", accent: "#fb923c", accentSoft: "#ffedd5", ink: "#7c2d12" },
  VN: { code: "VN", flag: "🇻🇳", country: "Vietnam", heading: "Ảnh hộ chiếu Việt Nam đúng kích thước.", description: "Kiểm tra bố cục 40 × 60 mm, nền trắng và vị trí khuôn mặt trước khi thanh toán.", sizeLabel: "40 × 60 mm", shortSize: "VN 4 × 6", widthMm: 40, heightMm: 60, pixelWidth: 472, pixelHeight: 709, headHeightMm: 34, topMarginMm: 5, background: "linear-gradient(135deg,#5f0711 0%,#b91c1c 55%,#3f0b10 100%)", accent: "#fde047", accentSoft: "#fef9c3", ink: "#713f12" },
  Other: { code: "Other", flag: "🌐", country: "International", heading: "International passport and ID photos.", description: "Use the common 35 × 45 mm format and verify the background, expression, and composition before payment.", sizeLabel: "35 × 45 mm", shortSize: "35 × 45", widthMm: 35, heightMm: 45, pixelWidth: 413, pixelHeight: 531, headHeightMm: 32, topMarginMm: 4, background: "linear-gradient(135deg,#172554 0%,#4338ca 50%,#0f766e 100%)", accent: "#5eead4", accentSoft: "#ccfbf1", ink: "#134e4a" },
  TR: { code: "TR", flag: "🇹🇷", country: "Türkiye", heading: "Türkiye biyometrik pasaport fotoğrafınızı hazırlayın.", description: "50 × 60 mm biyometrik fotoğraf ölçüsünü, beyaz arka planı ve yüz konumunu ödeme öncesinde kontrol edin.", sizeLabel: "50 × 60 mm", shortSize: "TR 50 × 60", widthMm: 50, heightMm: 60, pixelWidth: 591, pixelHeight: 709, headHeightMm: 34, topMarginMm: 5, background: "linear-gradient(135deg,#450a0a 0%,#be123c 55%,#22070b 100%)", accent: "#ffffff", accentSoft: "#ffe4e6", ink: "#881337" },
  MY: { code: "MY", flag: "🇲🇾", country: "Malaysia", heading: "Malaysia passport photos in the correct format.", description: "Prepare the official 35 × 50 mm layout with a white background and balanced face placement.", sizeLabel: "35 × 50 mm", shortSize: "MY 35 × 50", widthMm: 35, heightMm: 50, pixelWidth: 413, pixelHeight: 591, headHeightMm: 28, topMarginMm: 5, background: "linear-gradient(135deg,#071a4a 0%,#1d4ed8 48%,#9f1239 110%)", accent: "#facc15", accentSoft: "#fef9c3", ink: "#713f12" },
  HK: { code: "HK", flag: "🇭🇰", country: "Hong Kong", heading: "Hong Kong passport photos, precisely prepared.", description: "Create the 40 × 50 mm travel-document format with the required white background and face height.", sizeLabel: "40 × 50 mm", shortSize: "HK 40 × 50", widthMm: 40, heightMm: 50, pixelWidth: 472, pixelHeight: 591, headHeightMm: 34, topMarginMm: 4, background: "linear-gradient(135deg,#450a0a 0%,#dc2626 55%,#2a0909 100%)", accent: "#ffffff", accentSoft: "#fee2e2", ink: "#7f1d1d" },
  FI: { code: "FI", flag: "🇫🇮", country: "Finland", heading: "Finnish passport photos at the exact digital size.", description: "Prepare Finland’s exact 500 × 653 pixel passport output with compliant face placement and background.", sizeLabel: "36 × 47 mm", shortSize: "FI 500 × 653", widthMm: 36, heightMm: 47, pixelWidth: 500, pixelHeight: 653, headHeightMm: 32, topMarginMm: 4, background: "linear-gradient(135deg,#082f49 0%,#075985 52%,#172554 100%)", accent: "#ffffff", accentSoft: "#e0f2fe", ink: "#0c4a6e" },
  AR: { code: "AR", flag: "🇦🇷", country: "Argentina Consular", heading: "Argentina consular photos in 4 × 4 cm format.", description: "Prepare the square 40 × 40 mm format used for Argentine consular and provisional-passport services.", sizeLabel: "40 × 40 mm", shortSize: "AR 4 × 4", widthMm: 40, heightMm: 40, pixelWidth: 472, pixelHeight: 472, headHeightMm: 27, topMarginMm: 4, background: "linear-gradient(135deg,#075985 0%,#38bdf8 48%,#f8fafc 130%)", accent: "#fde047", accentSoft: "#fef9c3", ink: "#713f12" },
};
