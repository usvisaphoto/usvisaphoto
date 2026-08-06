import Image from "next/image";

const beforeIssues = ["Busy background", "Unverified crop", "No compliance report"];
const afterBenefits = [
  "600 × 600 px output",
  "Head position validated",
  "White background prepared",
  "Ready for secure checkout",
];

export default function BeforeAfterSection() {
  return (
    <section className="mx-auto max-w-[88rem] px-4 pb-24 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.08] shadow-[0_30px_100px_rgba(2,6,23,.45)] backdrop-blur-xl sm:rounded-[2.75rem]">
        <div className="grid gap-8 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:px-12">
          <div>
            <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-cyan-100">
              See the embassy-ready difference
            </span>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
              From phone photo to validated application asset.
            </h2>
          </div>
          <div className="lg:pb-1">
            <p className="max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Preview the result before paying. Every photo is checked for face position,
              expression, eyewear, crop, and output dimensions.
            </p>
            <a href="#upload-card" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-cyan-300 px-6 font-black text-blue-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">
              Validate my photo
            </a>
          </div>
        </div>

        <div className="grid gap-0 border-t border-white/10 lg:grid-cols-2">
          <article className="bg-slate-950/45 p-5 sm:p-8 lg:p-10">
            <div className="mb-5 flex items-center justify-between">
              <div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Before</p><h3 className="mt-1 text-xl font-black">Everyday photo</h3></div>
              <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-bold text-rose-200">Unverified</span>
            </div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[36rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-800 shadow-2xl">
              <Image src="/demo/before.jpg" alt="Original phone photo before validation" fill sizes="(max-width: 1024px) 90vw, 42vw" className="object-cover" />
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {beforeIssues.map((item) => <li key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">× {item}</li>)}
            </ul>
          </article>

          <article className="relative bg-gradient-to-br from-white to-blue-50 p-5 text-slate-900 sm:p-8 lg:p-10">
            <div className="absolute right-5 top-5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white shadow-lg sm:right-8 sm:top-8">PASS READY</div>
            <div className="mb-5 pr-24"><p className="text-xs font-black uppercase tracking-[.18em] text-blue-700">After</p><h3 className="mt-1 text-xl font-black text-blue-950">Embassy-ready photo</h3></div>
            <div className="relative mx-auto aspect-square w-full max-w-[36rem] overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white shadow-[0_25px_60px_rgba(30,64,175,.18)]">
              <Image src="/demo/after.jpg" alt="Embassy-ready photo after processing" fill sizes="(max-width: 1024px) 90vw, 42vw" className="object-cover" />
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {afterBenefits.map((item) => <li key={item} className="rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm"><span className="text-emerald-600">✓</span> {item}</li>)}
            </ul>
          </article>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 bg-blue-950/70 px-6 py-5 text-sm text-blue-100 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p><strong className="text-white">Preview first.</strong> Pay only when you are happy with the prepared result.</p>
          <p className="font-bold text-cyan-200">25 years of professional studio experience</p>
        </div>
      </div>
    </section>
  );
}
