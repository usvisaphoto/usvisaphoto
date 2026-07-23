export default function GuaranteeSection() {
  return (
    <section className="mx-auto mt-14 max-w-6xl px-6">
      <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-8 text-center shadow-xl">

        <div className="text-4xl">
          ✅
        </div>

        <h2 className="mt-4 text-3xl font-extrabold text-white">
          Photo Acceptance Guarantee
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
          Every photo is prepared to meet official U.S. visa and passport
          requirements. If your photo needs adjustment, we&apos;ll help you fix it.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl bg-white/10 p-5">
            <div className="text-3xl">📷</div>
            <h3 className="mt-3 font-bold text-white">
              Correct Size
            </h3>
            <p className="mt-2 text-sm text-blue-100">
              2×2 inch • 600×600 pixels
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5">
            <div className="text-3xl">🧑</div>
            <h3 className="mt-3 font-bold text-white">
              Proper Head Position
            </h3>
            <p className="mt-2 text-sm text-blue-100">
              Automatic crown-to-chin sizing.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5">
            <div className="text-3xl">💬</div>
            <h3 className="mt-3 font-bold text-white">
              Real Support
            </h3>
            <p className="mt-2 text-sm text-blue-100">
              Need help? Contact us anytime.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
