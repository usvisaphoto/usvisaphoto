import Link from "next/link";

export default function GuaranteeSection() {
  return (
    <section className="mx-auto mt-14 max-w-6xl px-6">
      <div className="rounded-3xl border border-emerald-300/25 bg-emerald-400/10 p-8 text-center shadow-xl md:p-12">
        <div className="text-4xl">✓</div>
        <p className="mt-4 text-sm font-black uppercase tracking-[.2em] text-emerald-200">Our Service Promise</p>
        <h2 className="mt-3 text-3xl font-extrabold text-white md:text-5xl">We Stand Behind Every Photo.</h2>
        <p className="mx-auto mt-5 max-w-3xl text-xl font-bold leading-8 text-white">
          We don&apos;t just deliver a file and disappear.
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-blue-100">
          If something isn&apos;t right with the photo we prepared, contact us. We&apos;ll review the issue and work with you to make it right. From your first upload to your final photo, we&apos;re here to help.
        </p>

        <div className="mt-9 grid gap-4 text-left md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-5"><div className="text-2xl">💬</div><h3 className="mt-3 font-bold text-white">Real Support</h3><p className="mt-2 text-sm leading-6 text-blue-100">Questions or problems? Contact our photo team for help.</p></div>
          <div className="rounded-2xl bg-white/10 p-5"><div className="text-2xl">👤</div><h3 className="mt-3 font-bold text-white">Personal Review</h3><p className="mt-2 text-sm leading-6 text-blue-100">Difficult cases can be handled individually through Expert Manual Editing.</p></div>
          <div className="rounded-2xl bg-white/10 p-5"><div className="text-2xl">🛡️</div><h3 className="mt-3 font-bold text-white">Here After Payment</h3><p className="mt-2 text-sm leading-6 text-blue-100">Our support does not end when you download your photo.</p></div>
        </div>

        <p className="mx-auto mt-7 max-w-2xl text-xs leading-5 text-blue-200">
          Final acceptance is determined by the receiving government authority. For purchase and correction terms, see our{" "}<Link href="/refund" className="font-bold text-white underline underline-offset-2">Refund Policy</Link>.
        </p>
      </div>
    </section>
  );
}
