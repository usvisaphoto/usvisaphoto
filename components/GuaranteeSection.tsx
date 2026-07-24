import Link from "next/link";

export default function GuaranteeSection() {
  return (
    <section className="mx-auto mt-14 max-w-6xl px-6">
      <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-8 text-center shadow-xl">

        <div className="text-4xl">
          ✅
        </div>

        <h2 className="mt-4 text-3xl font-extrabold text-white">
          Built to Official Photo Standards
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
          Every photo is automatically checked against official U.S. visa and
          passport size and formatting requirements before you pay anything.
          You always see your preview first &mdash; you only pay to unlock
          the final high-quality download.
        </p>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-blue-200">
          Something look off after purchase? Contact us within 7 days &mdash;
          see our{" "}
          <Link href="/refund" className="font-bold text-white underline underline-offset-2">
            Refund Policy
          </Link>{" "}
          for details.
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
