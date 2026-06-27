export default function RefundPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 text-slate-800 shadow-2xl">

        <a
          href="/"
          className="mb-8 inline-block text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to Home
        </a>

        <h1 className="mb-3 text-4xl font-extrabold text-blue-950">
          Refund Policy
        </h1>

        <p className="mb-10 text-lg text-slate-600">
          Last updated: July 2026
        </p>

        <section className="space-y-8">

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Digital Product
            </h2>

            <p>
              USVisaPhoto provides a digital image processing service.
              Once the final high-quality photo has been downloaded,
              the service is considered fully delivered.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Non-Refundable
            </h2>

            <p>
              Because this is a digital product that is delivered
              immediately after payment, refunds cannot be provided
              after the high-quality image has been downloaded.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Refunds May Be Issued If
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Duplicate payment.</li>
              <li>Payment completed but download unavailable due to our system.</li>
              <li>The service could not generate a photo because of a technical problem.</li>
              <li>A verified billing error occurred.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Manual Review
            </h2>

            <p>
              If you believe your case qualifies for a refund,
              please contact us within 7 days of your purchase.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Contact
            </h2>

            <p className="mt-2 font-bold text-blue-700">
              usvisaphoto1@gmail.com
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}