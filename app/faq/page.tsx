const faqs = [
  {
    q: "Are my photos permanently stored?",
    a: "No. Your uploaded and generated photos are processed securely and are not permanently stored.",
  },
  {
    q: "Can I use this for a U.S. visa photo?",
    a: "Yes. USVisaPhoto is designed for U.S. 2x2 inch visa and passport-style photo requirements.",
  },
  {
    q: "Is USVisaPhoto affiliated with the U.S. government?",
    a: "No. USVisaPhoto is an independent photo preparation service and is not affiliated with any government agency.",
  },
  {
    q: "When can I request a refund?",
    a: "Refunds may be issued for duplicate payments, technical failures, or if we cannot deliver the purchased photo.",
  },
  {
    q: "Can I get a refund after downloading?",
    a: "No. Because this is a digital product, completed downloads are final and non-refundable.",
  },
  {
    q: "What if my photo needs manual review?",
    a: "You can contact us at usvisaphoto1@gmail.com. Manual review is usually handled within 24 hours.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 text-slate-800 shadow-2xl">
        <a href="/" className="mb-8 inline-block text-sm font-semibold text-blue-700 hover:underline">
          ← Back to Home
        </a>

        <h1 className="text-4xl font-extrabold text-blue-950">FAQ</h1>
        <p className="mt-4 text-lg text-slate-600">
          Common questions about USVisaPhoto.
        </p>

        <div className="mt-10 space-y-5">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-blue-950">{item.q}</h2>
              <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}