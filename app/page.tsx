export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-semibold tracking-tight">
            US Visa Photo
          </div>

          <nav className="hidden md:flex gap-8 text-sm text-gray-700">
            <a href="#services" className="hover:text-black">
              서비스
            </a>
            <a href="#features" className="hover:text-black">
              장점
            </a>
            <a href="#faq" className="hover:text-black">
              FAQ
            </a>
          </nav>

          <button className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm hover:bg-black transition">
            시작하기
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-36 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm text-gray-500 mb-5">
              Premium AI Visa Photo Service
            </p>

            <h1 className="text-5xl md:text-7xl font-semibold leading-tight tracking-tight">
              미국 비자사진,
              <br />
              가장 정확하고
              <br />
              가장 간편하게
            </h1>

            <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-xl">
              업로드 한 번으로 미국 비자/여권 규격에 맞춘 사진 완성.
              AI 자동 배경 보정, 2x2 규격 변환, 전문가 기준 품질.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg hover:bg-black transition">
                사진 업로드하기
              </button>

              <button className="border border-gray-300 px-8 py-4 rounded-full text-lg hover:border-black transition">
                예시 보기
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-500">
              <span>미국 비자</span>
              <span>여권</span>
              <span>그린카드</span>
              <span>DS-160</span>
            </div>
          </div>

          {/* Premium Visual */}
          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 p-10 shadow-2xl">
              <div className="aspect-[4/5] rounded-2xl bg-white shadow-inner flex items-center justify-center">
                <div className="text-center px-8">
                  <div className="w-28 h-28 rounded-full bg-gray-300 mx-auto mb-6"></div>
                  <p className="text-xl font-medium">AI Visa Photo Preview</p>
                  <p className="text-gray-500 mt-2">
                    2x2 inch / White Background / Embassy Ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="services"
        className="py-24 bg-gray-50 border-y border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">
              Simple Process
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              빠르고 정확한 3단계
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              [
                "01",
                "사진 업로드",
                "집에서 촬영한 사진도 업로드 가능",
              ],
              [
                "02",
                "AI 자동 보정",
                "배경 제거 · 규격 조정 · 품질 최적화",
              ],
              [
                "03",
                "즉시 다운로드",
                "비자 신청용 파일 바로 사용",
              ],
            ].map(([num, title, desc]) => (
              <div
                key={num}
                className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100"
              >
                <p className="text-sm text-gray-400 mb-4">{num}</p>
                <h3 className="text-2xl font-semibold mb-4">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Trust */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">
            Professional Standard
          </p>

          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            25년 사진 전문가 기준,
            <br />
            이제 AI로 더 빠르게
          </h2>

          <p className="mt-8 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            단순한 사진 편집이 아닙니다. 실제 제출 기준을 고려한
            프리미엄 비자사진 서비스로,
            시간과 비용을 줄이면서도 전문 품질을 제공합니다.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="py-24 bg-gray-50 border-t border-gray-200"
      >
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-semibold text-center mb-14">
            자주 묻는 질문
          </h2>

          <div className="space-y-6">
            {[
              [
                "휴대폰 사진도 가능한가요?",
                "네. 정면, 밝은 조명 조건이면 AI가 규격에 맞게 자동 보정합니다.",
              ],
              [
                "미국 비자 규격에 맞나요?",
                "미국 비자/여권 기준 2x2인치 규격 기준으로 제작됩니다.",
              ],
              [
                "얼마나 걸리나요?",
                "업로드 후 수분 내 결과 확인이 가능합니다.",
              ],
            ].map(([q, a]) => (
              <div
                key={q}
                className="bg-white rounded-2xl p-6 border border-gray-200"
              >
                <h3 className="text-xl font-medium mb-3">{q}</h3>
                <p className="text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 US Visa Photo. All rights reserved.</p>
          <p>Premium AI Visa Photo Service</p>
        </div>
      </footer>
    </main>
  );
}