export default function PremiumComparison() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 text-white shadow-2xl md:p-10">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
            See the Difference
          </p>

          <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
            From everyday photo to embassy-ready.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Compare Standard processing with Studio Premium quality.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-950/70 p-6">
            <div className="mb-4 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-blue-100">
              1. Original Selfie
            </div>

            <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-white/10 bg-slate-800 text-center text-sm text-slate-300">
              Original demo image
              <br />
              coming soon
            </div>

            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              <li>• Phone photo</li>
              <li>• Indoor background</li>
              <li>• Casual lighting</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-white p-6 text-slate-900">
            <div className="mb-4 rounded-full bg-blue-950 px-4 py-2 text-sm font-bold text-white">
              2. Standard · $4.99
            </div>

            <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
              Standard result
              <br />
              2×2 white background
            </div>

            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li>✓ White background</li>
              <li>✓ U.S. 2×2 crop</li>
              <li>✓ Instant download</li>
            </ul>
          </div>

          <div className="rounded-3xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white p-6 text-slate-900 shadow-2xl">
            <div className="mb-4 rounded-full bg-yellow-400 px-4 py-2 text-sm font-extrabold text-blue-950">
              3. Studio Premium
            </div>

            <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-yellow-200 bg-white text-center text-sm text-slate-500">
              Premium studio finish
              <br />
              demo coming soon
            </div>

            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li>✓ Everything in Standard</li>
              <li>✓ Natural color balance</li>
              <li>✓ Hair and clothing cleanup</li>
              <li>✓ Professional studio finish</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}