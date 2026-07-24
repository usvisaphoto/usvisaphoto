export default function BeforeAfterSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 text-white shadow-2xl md:p-10">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
            See the Difference
          </p>

          <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
            The same photo, prepared for U.S. visa standards.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            See how an everyday phone photo becomes an embassy-ready visa or passport photo.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-6 md:grid-cols-[1fr_90px_1fr]">
          <div className="rounded-3xl bg-[#141d3d] p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">Everyday Photo</h3>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">
                Before
              </span>
            </div>

           <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
  <img
    src="/demo/before.jpg"
    alt="Original everyday phone photo"
    className="h-full w-full object-cover"
  />
</div>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div>✕ Wrong background</div>
              <div>✕ Incorrect size</div>
              <div>✕ Not embassy-ready</div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="hidden h-px w-full bg-white/30 md:block" />
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl font-extrabold text-blue-950 shadow-xl">
              →
            </div>
            <div className="text-center text-xs font-bold uppercase tracking-widest text-blue-200">
              Prepared
            </div>
            <div className="hidden h-px w-full bg-white/30 md:block" />
          </div>

          <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-blue-950">
                Embassy-Ready Photo
              </h3>
              <span className="rounded-full bg-blue-950 px-3 py-1 text-xs font-bold text-white">
                After
              </span>
            </div>

           <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
     <img src="/demo/after.jpg" alt="Embassy-ready processed photo" className="h-full w-full object-cover" />
     </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div className="rounded-xl bg-slate-100 p-3">✓ White background</div>
              <div className="rounded-xl bg-slate-100 p-3">✓ Correct U.S. 2×2 size</div>
              <div className="rounded-xl bg-slate-100 p-3">✓ Proper head alignment</div>
              <div className="rounded-xl bg-slate-100 p-3">✓ Ready for download</div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-300/30 bg-blue-500/10 p-5 text-center">
          <p className="font-bold text-white">
            Built on 25 years of professional studio experience.
          </p>
          <p className="mt-2 text-sm text-blue-100">
            Designed to prepare your photo for official U.S. visa and passport photo requirements.
          </p>
        </div>
        </div>
    </section>
  );
}