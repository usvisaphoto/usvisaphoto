import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 text-slate-800 shadow-2xl">
        <Link href="/" className="mb-8 inline-block text-sm font-semibold text-blue-700 hover:underline">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-extrabold text-blue-950">Contact</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Need help with your visa or passport photo? Contact us anytime.
        </p>

        <div className="mt-10 grid gap-6">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-blue-950">Email Support</h2>
            <a href="mailto:usvisaphoto1@gmail.com" className="mt-3 block font-bold text-blue-700">
              usvisaphoto1@gmail.com
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-blue-950">Manual Review</h2>
            <p className="mt-3 text-slate-600">
              If your photo requires manual review, please email us with your order details.
              We usually respond within 24 hours.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-blue-950">Business Inquiries</h2>
            <p className="mt-3 text-slate-600">
              For partnerships, support, or service questions, contact us by email.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
