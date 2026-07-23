import Link from "next/link";

export default function HomeTrustSections() {
  const trustItems = [
  [
    "⭐ 25 Years Experience",
    "Built on professional studio standards.",
  ],
  [
    "🔒 Privacy Protected",
    "Your photos are processed securely and are never permanently stored.",
  ],
  [
    "✅ Embassy Accepted Standards",
    "Prepared to meet official U.S. visa and passport photo requirements.",
  ],
];

  const steps = ["Upload", "Auto Detect", "Create Photo", "Download"];

  const faqs = [
    ["Are my photos stored?", "No. Uploaded and generated photos are not permanently stored."],
    ["Can I use this for a U.S. visa?", "Yes. It is designed for U.S. 2x2 visa and passport-style photos."],
    ["Is this a government website?", "No. USVisaPhoto is an independent photo preparation service."],
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 p-10">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
  READY TO CREATE?
</p>

<h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
  Your embassy-ready photo
  <br />
  is only minutes away.
</h2>

<p className="mx-auto mt-4 max-w-2xl text-blue-100">
  Upload one photo.
  <br />
  We&apos;ll handle the rest.
</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {trustItems.map(([title, desc]) => (
          <div key={title} className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white">
            <h3 className="text-2xl font-extrabold">{title}</h3>
            <p className="mt-3 leading-7 text-blue-100">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
        <h2 className="text-3xl font-extrabold text-blue-950">How It Works</h2>

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-950 text-lg font-bold text-white">
                {index + 1}
              </div>
              <h3 className="font-extrabold text-blue-950">{step}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-7 text-white">
          <h2 className="text-2xl font-extrabold">Why USVisaPhoto?</h2>
          <ul className="mt-5 space-y-3 text-blue-100">
            <li>✓ 25 years of professional photo standards</li>
            <li>✓ Secure payment through trusted providers</li>
            <li>✓ No permanent photo storage</li>
            <li>✓ Manual review available by email</li>
          </ul>
          <Link href="/why-us" className="mt-6 inline-block rounded-full bg-white px-5 py-3 font-bold text-blue-950">
            Learn More
          </Link>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 p-7 text-white">
          <h2 className="text-2xl font-extrabold">FAQ</h2>
          <div className="mt-5 space-y-4">
            {faqs.map(([q, a]) => (
              <div key={q}>
                <h3 className="font-bold text-white">{q}</h3>
                <p className="mt-1 text-sm leading-6 text-blue-100">{a}</p>
              </div>
            ))}
          </div>
          <Link href="/faq" className="mt-6 inline-block rounded-full bg-white px-5 py-3 font-bold text-blue-950">
            View FAQ
          </Link>
        </div>
      </div>
    </section>
  );
}
