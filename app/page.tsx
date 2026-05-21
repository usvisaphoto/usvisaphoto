"use client";

import { useRef, useState } from "react";
import * as FaceMesh from "@mediapipe/face_mesh";

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  export default function HomePage() 
  
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
    const faceMesh = new FaceMesh.FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
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

          <button
            onClick={handleUploadClick}
            className="rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:scale-105 transition"
          >
            Start Now
          </button>
        </div>
      </header>

      {/* Hidden File Input */}
      <input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  onChange={handleFileChange}
  className="hidden"
/>
      {/* Hero */}
      <section className="relative pt-40 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 via-white to-white" />

        <div className="relative max-w-7xl mx-auto px-8 text-center">
          <p className="uppercase tracking-[0.45em] text-sm text-black/40 mb-8">
            The Global Standard for U.S. Visa Photos
          </p>

          <h1 className="text-6xl md:text-8xl font-semibold tracking-[-0.06em] leading-[0.95]">
            <br />
            미국 비자 / 미국 여권
            <br />
             <span className="block text-4xl md:text-6xl">
    U.S Visa / U.S Passport
  </span>

            <br />
            간편하고 가성비로
            <br />
            <br />
            정확히 정의하다
          </h1>

          <p className="mt-10 max-w-3xl mx-auto text-xl md:text-2xl text-black/60 leading-relaxed">
            미국 비자 규격, 이제 가장 정교한 방식으로.
            <br />
            AI Precision + 25년 전문가 기준.
          </p>

          <div className="mt-14 flex flex-col sm:flex-row gap-5 justify-center">
            <button
              onClick={handleUploadClick}
              className="rounded-full bg-black text-white px-10 py-5 text-lg font-medium shadow-2xl hover:scale-105 transition"
            >
              사진 업로드하기
            </button>

            <button className="rounded-full border border-black/10 px-10 py-5 text-lg hover:border-black/30 transition">
              How It Works
            </button>
          </div>

          {/* Floating Glass Card */}
          <div className="mt-24 flex justify-center">
            <div className="relative w-full max-w-5xl rounded-[3rem] bg-gradient-to-br from-white to-gray-100 border border-black/5 shadow-[0_30px_120px_rgba(0,0,0,0.08)] p-8 md:p-14">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="text-left">
                  <p className="text-sm uppercase tracking-[0.35em] text-black/40 mb-4">
                    Embassy-Level Precision
                  </p>

                  <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.05em] leading-tight">
                    반려없는 100%
                    <br />
                    가이드로
                    <br />
                    미국 비자 / 미국 여권
                    <br />
                    파일 제공
                  </h2>

                  <p className="mt-6 text-lg text-black/60 leading-relaxed">
                    배경 제거, 얼굴 정렬, 2x2 규격 조정,
                    국제 제출 기준까지 자동 최적화.
                  </p>
                </div>

               <div className="bg-white rounded-[2rem] shadow-inner aspect-[4/5] flex items-center justify-center overflow-hidden relative">
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
    onClick={() => alert("결제 후 다운로드 가능합니다")}
  >
    다운로드 (유료)
  </button>
)}
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Visa Photo Guide Frame */}
      <div className="absolute inset-6 border-4 border-white/90 rounded-[1.5rem] shadow-[0_0_0_9999px_rgba(255,255,255,0.03)]">
        {/* Head Position Oval */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[42%] h-[32%] border-2 border-white/80 rounded-full" />

        {/* Eye Line Guide */}
        <div className="absolute top-[34%] left-[12%] right-[12%] border-t-2 border-dashed border-white/70" />

        {/* Chin Line */}
        <div className="absolute bottom-[18%] left-[20%] right-[20%] border-t border-white/50" />
      </div>

      {/* Approval Badge */}
      <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 text-sm font-semibold shadow-lg">
        Embassy Ready
      </div>

      {/* AI Score */}
      <div className="absolute bottom-5 left-5 right-5 bg-black/70 backdrop-blur-xl rounded-2xl px-5 py-4 text-white">
        <div className="flex justify-between items-center text-sm mb-2">
          <span>Embassy Readiness Score</span>
          <span>98%</span>
        </div>

        <div className="w-full bg-white/20 rounded-full h-2">
          <div className="bg-white h-2 rounded-full w-[98%]" />
        </div>

        <p className="text-xs text-white/70 mt-2">
          Head alignment optimal · Background enhancement recommended
        </p>
        <button
  onClick={() => {
  alert("결제 완료 후 다운로드 가능합니다");
}}
  className="mt-4 w-full bg-white text-black rounded-xl py-3 text-sm font-semibold hover:scale-[1.02] transition"
>
  Download Visa Photo
</button>
      </div>
    </>
  ) : (
    <>
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 mb-6"></div>

      <p className="text-2xl font-medium">
        AI Visa Preview
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

          <div className="grid md:grid-cols-3 gap-8">
            {[
              ["01", "Upload", "어디서든 촬영 후 업로드"],
              ["02", "AI Precision", "자동 보정 + 전문가 기준 분석"],
              ["03", "Download", "제출 준비 완료 파일 즉시 제공"],
            ].map(([num, title, desc]) => (
              <div
                key={num}
                className="rounded-[2rem] border border-black/5 p-10 hover:shadow-2xl transition"
              >
                <p className="text-sm text-black/30 mb-6">{num}</p>
                <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                  {title}
                </h3>
                <p className="mt-4 text-black/60 text-lg leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
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
                "네. 정면 촬영과 적절한 조명만 확보되면 AI가 국제 제출 기준에 정확하게 최적화합니다.",
              ],
              [
                "미국 비자 규격 대응이 되나요?",
                "미국 비자 및 여권 제출 기준에 맞춘 2x2 규격으로 자동 조정됩니다.",
              ],
              [
                "처리 시간은 얼마나 걸리나요?",
                "3분 내 결과 확인이 가능합니다.",
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