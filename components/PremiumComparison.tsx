export default function PremiumComparison() {
  const modes = [
    {
      badge: "1. Basic",
      badgeClass: "bg-blue-950 text-white",
      price: "$4.99",
      cardClass: "bg-white text-slate-900",
      bestFor:
        "Best if: your photo is already well-taken \u2014 shoulders and upper body visible, good lighting.",
      whatItDoes: [
        "Removes the background",
        "Resizes and crops to official U.S. visa/passport spec",
      ],
      note: "We don't touch your face or exposure \u2014 just background + official sizing.",
    },
    {
      badge: "2. Professional",
      badgeClass: "bg-yellow-400 text-blue-950",
      price: "$9.99",
      cardClass:
        "border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white text-slate-900 shadow-2xl",
      bestFor:
        "Best if: it's a phone photo with uneven exposure, a face that's too zoomed-in (like an old ID photo), or your eyes/nose/shoulders look off-balance.",
      whatItDoes: [
        "Everything in Basic",
        "Corrects exposure to a natural level",
        "Balances eyes, nose, mouth and shoulders left-to-right",
        "Corrects skin tone",
        "Auto-generates any part of the upper body missing from the original photo",
      ],
      note: "Gives a natural, studio-photographed look \u2014 without changing who you look like.",
      highlight: true,
    },
    {
      badge: "3. Expert",
      badgeClass: "bg-slate-900 text-white",
      price: "$19.99",
      cardClass: "bg-slate-950/70 text-white",
      bestFor:
        "Best if: your photo doesn't meet U.S. visa/passport requirements at all, but you don't want your face altered \u2014 you want it made right, your way.",
      whatItDoes: [
        "Manual expert editing to bring an otherwise unusable photo up to U.S. visa/passport standard",
        "No changes to your face or identity",
      ],
      note: "Handled by a person, for cases Basic and Professional can't fix automatically.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 text-white shadow-2xl md:p-10">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
            Which One Is Right for You?
          </p>

          <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
            Pick based on your photo, not guesswork.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Not sure which to choose? Look at your photo first \u2014 each
            option below tells you exactly when to use it.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {modes.map((mode) => (
            <div key={mode.badge} className={`rounded-3xl p-6 ${mode.cardClass}`}>
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className={`rounded-full px-4 py-2 text-sm font-bold ${mode.badgeClass}`}>
                  {mode.badge}
                </div>
                <div className="text-sm font-extrabold opacity-80">{mode.price}</div>
              </div>

              <p className="text-sm font-bold leading-6 opacity-90">
                {mode.bestFor}
              </p>

              <ul className="mt-5 space-y-2 text-sm">
                {mode.whatItDoes.map((line) => (
                  <li key={line}>✓ {line}</li>
                ))}
              </ul>

              <p className="mt-5 text-xs italic opacity-70">{mode.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
