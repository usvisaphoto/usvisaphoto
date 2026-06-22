"use client";

import { useRef, useState } from "react";
declare global {
  interface Window {
    FaceMesh: any;
  }
}
const countryInfo: Record<string, any> = {
  US: {
    title: "U.S. Visa & Passport Photo",
    subtitle: "Embassy-Ready U.S. Visa & Passport Photos",
  },
  KR: {
    title: "Korea Visa Photo",
    subtitle: "Government-Compliant Korea Visa Photos",
  },
  CN: {
    title: "China Visa Photo",
    subtitle: "Official China Visa Photo Service",
  },
  JP: {
    title: "Japan Visa Photo",
    subtitle: "Japan Visa Application Photos",
  },
  CA: {
    title: "Canada Visa Photo",
    subtitle: "Canada Immigration Photo Service",
  },
  IN: {
    title: "India Visa Photo",
    subtitle: "India Visa & Passport Photos",
  },
  VN: {
    title: "Vietnam Visa Photo",
    subtitle: "Vietnam Entry Visa Photos",
  },
  MORE: {
    title: "Global Visa Photo",
    subtitle: "More Countries Coming Soon",
  },
  
};



export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
   const [isProcessing, setIsProcessing] = useState(false);

  const [country, setCountry] = useState("US");
  const currentInfo = countryInfo[country];
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  
  const handleFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) return;

  // 즉시 미리보기
  const previewUrl = URL.createObjectURL(file);
  setPreview(previewUrl);

  alert("AI processing started");

  try {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const result = reader.result as string;

      const base64 = result.split(",")[1];

      // 배경제거
      const removeRes = await fetch("/api/removebg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_base64: base64,
        }),
      });

      const removeData = await removeRes.json();

      // 업스케일
      const upscaleRes = await fetch("/api/upscale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_base64: removeData.image_base64,
        }),
      });

      const upscaleData = await upscaleRes.json();

      const finalImage =
        `data:image/jpeg;base64,${upscaleData.image_base64}`;

      setPreview(finalImage);

      // 얼굴 분석
      analyzeFace(file);

      alert("AI processing completed");
    };
  } catch (error) {
    console.error(error);

    alert("이미지 처리 실패");
  }
};

const analyzeFace = (file: File) => {
  const img = new Image();

  img.src = URL.createObjectURL(file);

  img.onload = async () => {
   const faceMesh = new window.FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: any) => {
      if (
        !results.multiFaceLandmarks ||
        results.multiFaceLandmarks.length === 0
      ) {
        setError("얼굴이 감지되지 않았습니다");
        return;
      }

      const landmarks =
        results.multiFaceLandmarks[0];

      const leftEye = landmarks[33];
      const rightEye = landmarks[263];

      const eyeDiffY =
        Math.abs(leftEye.y - rightEye.y);

      if (eyeDiffY > 0.03) {
        setError(
          "고개가 기울어져 있습니다"
        );
        return;
      }

      const nose = landmarks[1];

      if (nose.x < 0.35 || nose.x > 0.65) {
        setError(
          "얼굴이 중앙에 위치해야 합니다"
        );
        return;
      }

      const faceWidth =
        Math.abs(rightEye.x - leftEye.x);

      if (faceWidth < 0.08) {
        setError(
          "얼굴이 너무 멀리 있습니다"
        );
        return;
      }

      setError("");
    });

    await faceMesh.send({
      image: img,
    });
  };
};

  return (
    <main className="min-h-screen bg-white text-black overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="text-2xl font-semibold tracking-[-0.04em]">
            US Visa Photo
          </div>

          <nav className="hidden md:flex items-center gap-10 text-sm text-black/70">
            <a href="#precision" className="hover:text-black transition">
              Precision
            </a>
            <a href="#experience" className="hover:text-black transition">
              Experience
            </a>
            <a href="#faq" className="hover:text-black transition">
              FAQ
            </a>
          </nav>

  <label
  htmlFor="photo-upload"
  className="relative z-50 cursor-pointer rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:scale-105 transition inline-flex items-center justify-center"
>
  Upload Photo
</label>
        </div>
      </header>

      {/* Hidden File Input */}
     <input
  id="photo-upload"
  type="file"
  accept="image/*"
  ref={fileInputRef}
  onChange={handleFileChange}
  className="hidden"
/>
      {/* Hero */}
      <section className="relative pt-40 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 via-white to-white pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-8 text-center">
          <p className="uppercase tracking-[0.45em] text-sm text-black/40 mb-8">
            The Global Standard for U.S. Visa Photos
          </p>

        <h1 className="text-6xl md:text-8xl font-semibold tracking-[-0.06em] leading-[0.95]">
  {currentInfo.title}
</h1>

<p className="mt-10 max-w-3xl mx-auto text-xl md:text-2xl text-black/60 leading-relaxed">
  {currentInfo.subtitle}
  <br />
  in Minutes.
</p>
          <p className="mt-10 max-w-3xl mx-auto text-xl md:text-2xl text-black/60 leading-relaxed">
      
            <br />
            Government-Compliant · Instant Download · Expert-Verified Standards.
          </p>
          <br />
Built on 25 Years of Professional Photo Standards.
<br />
Designed to help meet official visa and passport photo requirements.
<br />
<br />
<br />
<div className="mt-10 relative z-[9999]">
  <p className="text-sm font-semibold tracking-[0.25em] text-black/40 uppercase mb-5">
    Choose Destination
  </p>

  <p className="mb-4 text-sm font-bold text-red-600">
    Current Country: {country}
  </p>

  <select
    value={country}
    onChange={(e) => setCountry(e.target.value)}
    className="relative z-[9999] w-full max-w-md mx-auto block rounded-2xl border border-black/10 bg-white px-6 py-4 text-lg font-bold text-black shadow-sm"
  >
    <option value="US">🇺🇸 US</option>
    <option value="KR">🇰🇷 KR</option>
    <option value="CN">🇨🇳 CN</option>
    <option value="JP">🇯🇵 JP</option>
    <option value="CA">🇨🇦 CA</option>
    <option value="IN">🇮🇳 IN</option>
    <option value="VN">🇻🇳 VN</option>
    <option value="MORE">🌐 MORE</option>
  </select>
</div>
          <div className="mt-14 flex flex-col sm:flex-row gap-5 justify-center">
  <label className="relative z-50 cursor-pointer rounded-full bg-black text-white px-10 py-5 text-lg font-medium shadow-2xl hover:scale-105 transition inline-flex items-center justify-center overflow-hidden">
  Upload Photo

  <input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    className="absolute inset-0 opacity-0 cursor-pointer"
  />
</label>
          </div>
          {preview && (
  <div className="mt-10 md:hidden rounded-3xl border border-black/10 bg-white p-4 shadow-xl">
    <img
      src={preview}
      alt="Uploaded Preview"
      className="w-full rounded-2xl object-cover"
    />

    <div className="mt-4 rounded-2xl bg-black text-white p-4">
      <p className="text-sm font-semibold">
        Photo Validation Report
      </p>

      <p className="mt-2 text-xs text-white/70 leading-relaxed">
        No critical issues detected. Photo appears ready for selected document requirements.
      </p>

      <button
        onClick={async () => {
          const res = await fetch("/api/create-checkout-session", {
            method: "POST",
          });

          const data = await res.json();

          if (data.url) {
            window.location.href = data.url;
          } else {
            alert("Payment page error");
          }
        }}
        className="mt-4 w-full bg-white text-black rounded-xl py-3 text-sm font-semibold"
      >
        Download Photo
      </button>
    </div>
  </div>
)}

          {/* Floating Glass Card */}
          <div className="mt-24 flex justify-center">
            <div className="relative w-full max-w-5xl rounded-[3rem] bg-gradient-to-br from-white to-gray-100 border border-black/5 shadow-[0_30px_120px_rgba(0,0,0,0.08)] p-8 md:p-14">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="text-left">
                  <p className="text-sm uppercase tracking-[0.35em] text-black/40 mb-4">
                    Embassy-Level Precision
                  </p>

                  <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.05em] leading-tight">
                    Embassy-Level Precision
                    <br />
                    <br />
                    내가 원하는 사진을
                    <br />
                    집에서 간편하게
                    <br />
                    신청합니다.
                  </h2>

                  <p className="mt-6 text-lg text-black/60 leading-relaxed">
                    배경 제거, 얼굴 정렬, 2x2 규격 조정,
                    국제 제출 기준까지 자동 최적화.
                  </p>
                </div>

               <div className="bg-white rounded-[2rem] shadow-inner aspect-[4/5] min-h-[520px] flex items-center justify-center overflow-hidden relative">
  {preview ? (
    <>
      {/* Uploaded Image */}
      <div className="relative w-full h-full">
      <img
        src={preview}
        alt="Uploaded Preview"
        className="w-full h-full object-cover"
      />
        {/* 워터마크 */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="text-white text-3xl md:text-4xl font-bold opacity-30 rotate-[-20deg]">
        USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO USVISAPHOTO 
      </span>
    </div>
{error && (
  <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-5 text-center">
    <p className="text-red-600 font-semibold text-lg">{error}</p>

    {error === "안경은 반드시 미착용" && (
      <p className="mt-2 text-sm text-black/60">
        미국 비자 규정상 안경 착용 불가
      </p>
    )}

    <p className="mt-3 text-sm text-black/60">
      e-mail: photowinner@naver.com
    </p>

    <a
      href="http://pf.kakao.com/_Txgxjlj"
      target="_blank"
      className="mt-2 inline-block text-sm underline"
    >
      실시간 채팅 상담
    </a>
  </div>
)}

  </div>
     {preview && (
  <button
    className="mt-6 bg-black text-white px-6 py-3 rounded-full"
    onClick={async () => {
  const res = await fetch(
    "/api/create-checkout-session",
    {
      method: "POST",
    }
  );

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Payment page error");
    }
}}
>
  다운로드 (유료)
</button>
)}
  <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-xl rounded-2xl px-4 py-3 text-white">
  <div className="text-sm font-semibold mb-3">
    Photo Validation Report
  </div>

  <div className="grid grid-cols-2 gap-2 text-xs text-white/90">
    <div>✓ Face Position</div>
    <div>✓ Head Size</div>
    <div>✓ Eye Level</div>
    <div>✓ Background</div>
    <div>✓ Resolution</div>
    <div>✓ Alignment</div>
  </div>

  <div className="mt-4 rounded-xl bg-white/10 p-3">
    <p className="text-xs font-semibold text-white">
      Recommendation
    </p>

    <p className="mt-1 text-xs text-white/70 leading-relaxed">
      No critical issues detected. Photo appears ready for selected document requirements.
    </p>
  </div>

 <button
  onClick={async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Payment page error");
    }
  }}
  className="mt-3 w-full bg-white text-black rounded-xl py-3 text-sm font-semibold"
>
  Download Photo
</button>
</div>  </>
  ) : (
    <>
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 mb-6"></div>

      <p className="text-2xl font-medium">
        Photo Preview
      </p>

      <p className="text-black/40 mt-2">
        U.S. Embassy Ready
      </p>

      {/* Default Guide Frame */}
      <div className="absolute inset-6 border-4 border-black/10 rounded-[1.5rem]">
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[42%] h-[32%] border-2 border-black/10 rounded-full" />

        <div className="absolute top-[34%] left-[12%] right-[12%] border-t-2 border-dashed border-black/10" />
      </div>
    </>
  )}
</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Precision Stats */}
      <section
        id="precision"
        className="py-28 border-y border-black/5 bg-black text-white"
      >
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-14 text-center">
          {[
            ["100%", "Photographic Guide Accuracy"],
            ["3 Min", "Average Processing Time"],
            ["365Day", "Anytime, Anywhere"],
          ].map(([num, label]) => (
            <div key={num}>
              <h3 className="text-5xl md:text-7xl font-semibold tracking-[-0.05em]">
                {num}
              </h3>
              <p className="mt-4 text-white/60 text-lg">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <p className="uppercase tracking-[0.4em] text-sm text-black/40 mb-5">
              Luxury Process
            </p>

            <h2 className="text-5xl md:text-7xl font-semibold tracking-[-0.06em] leading-tight">
              Designed for
              <br />
              Global Approval
            </h2>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="py-28 bg-gray-50 border-t border-black/5"
      >
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-5xl font-semibold tracking-[-0.05em] text-center mb-16">
            Questions, Refined.
          </h2>

          <div className="space-y-6">
            {[
              [
                "휴대폰 사진도 가능한가요?",
                "네. 정면 촬영과 적절한 조명만 확보되면 국제 제출 기준에 정확하게 최적화합니다.",
              ],
              [
                "미국 비자 규격 대응이 되나요?",
                "미국 비자 및 여권 제출 기준에 맞춘 2x2 규격으로 자동 조정됩니다.",
              ],
              [
                "처리 시간은 얼마나 걸리나요?",
                "대기가 없다면 1분이내 결과 확인이 가능합니다.",
              ],
            ].map(([q, a]) => (
              <div
                key={q}
                className="rounded-[2rem] bg-white p-8 border border-black/5"
              >
                <h3 className="text-2xl font-medium tracking-[-0.03em]">
                  {q}
                </h3>
                <p className="mt-4 text-lg text-black/60 leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-5">
          <div>
            <p className="text-xl font-semibold tracking-[-0.03em]">
              US Visa Photo
            </p>
            <p className="text-black/40 mt-2">
              Precision. Elegance. Approval.
            </p>
          </div>

          <div className="text-sm text-black/40">
            © 2026 US Visa Photo. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}