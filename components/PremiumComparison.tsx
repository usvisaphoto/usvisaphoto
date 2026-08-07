export default function PremiumComparison() {
  const modes = [
    {
      badge: "MOST POPULAR",
      badgeClass: "bg-yellow-400 text-blue-950",
      title: "Embassy-Ready Upgrade",
      regularPrice: "$14.99",
      launchPrice: "$9.99",
      cardClass:
        "border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white text-slate-900 shadow-2xl",
      bestFor:
        "For most phone photos, existing ID photos, and photos that need professional preparation before submission.",
      whatItDoes: [
        "Embassy photo validation",
        "Correct size and composition",
        "Natural lighting and color correction",
        "Hair and clothing cleanup",
        "Natural eye restoration when needed",
        "Glasses removal when possible",
        "Identity preserved",
        "Protected preview before payment",
      ],
      note: "We correct the photo — not the person.",
    },
    {
      badge: "NEED EXTRA HELP?",
      badgeClass: "bg-slate-900 text-white",
      title: "Expert Manual Editing",
      regularPrice: "$29.99",
      launchPrice: "$19.99",
      cardClass: "bg-slate-950/80 text-white ring-1 ring-white/15",
      bestFor:
        "For difficult photos that need a specialist's individual attention or cannot be prepared reliably by the standard workflow.",
      whatItDoes: [
        "Everything needed for an embassy-ready result",
        "Personal specialist review",
        "Difficult crop and composition correction",
        "Advanced manual correction",
        "Individual quality check",
        "Priority support",
      ],
      note: "Real support. Personal review. We stay with you until the photo is right.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20" id="pricing">
      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 text-white shadow-2xl md:p-10">
        <div className="text-center">
          <div className="inline-flex rounded-full bg-amber-300 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-blue-950">
            Grand Opening · 33% Off
          </div>
          <h2 className="mt-5 text-3xl font-extrabold md:text-5xl">
            Two clear ways to get your photo right.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            No confusing basic tiers. Choose professional preparation for most photos, or personal expert editing for difficult cases.
          </p>
          <p className="mt-3 text-sm font-bold text-amber-200">Limited-time opening prices · Ends September 7, 2026.</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          {modes.map((mode) => (
            <div key={mode.title} className={`rounded-3xl p-7 ${mode.cardClass}`}>
              <div className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${mode.badgeClass}`}>
                {mode.badge}
              </div>
              <h3 className="mt-5 text-2xl font-black">{mode.title}</h3>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-lg font-bold opacity-50 line-through">{mode.regularPrice}</span>
                <span className="text-4xl font-black">{mode.launchPrice}</span>
              </div>
              <p className="mt-1 text-xs font-black uppercase tracking-wider opacity-70">Grand Opening Price</p>
              <p className="mt-5 text-sm font-bold leading-6 opacity-90">{mode.bestFor}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {mode.whatItDoes.map((line) => <li key={line}>✓ {line}</li>)}
              </ul>
              <p className="mt-6 border-t border-current/10 pt-5 text-sm font-bold leading-6 opacity-80">{mode.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
