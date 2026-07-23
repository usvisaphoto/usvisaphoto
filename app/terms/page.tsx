import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 text-slate-800 shadow-2xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to Home
        </Link>

        <h1 className="mb-3 text-4xl font-extrabold text-blue-950">
          Terms of Service
        </h1>

        <p className="mb-10 text-lg text-slate-600">
          Last updated: July 2026
        </p>

        <section className="space-y-8">
          <div>
            <h2 className="mb-2 text-2xl font-bold">Service Overview</h2>
            <p>
              USVisaPhoto provides an online digital photo processing service
              designed to help users create visa and passport-style photos.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">User Responsibility</h2>
            <p>
              You are responsible for uploading a clear, recent, front-facing
              photo that meets official photo requirements. Photos with closed
              eyes, heavy shadows, hats, filters, extreme expressions, or poor
              image quality may not be accepted by official agencies.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              No Government Affiliation
            </h2>
            <p>
              USVisaPhoto is not affiliated with any government agency,
              embassy, or consulate. We provide a photo preparation service
              based on publicly available photo requirements.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">Digital Delivery</h2>
            <p>
              After payment, your final photo is delivered as a digital download.
              Once downloaded, the service is considered completed.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">Payments</h2>
            <p>
              Payments are processed securely by third-party payment providers
              such as PayPal or Toss Payments. We do not store credit card
              information.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">Refunds</h2>
            <p>
              Refunds are handled according to our Refund Policy. Completed
              downloads are generally non-refundable because the product is
              digital and delivered immediately.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">Privacy</h2>
            <p>
              We do not permanently store uploaded or generated photos. For more
              details, please review our Privacy Policy.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">Contact</h2>
            <p>
              If you have questions about these Terms, contact us at:
            </p>
            <p className="mt-2 font-bold text-blue-700">
              usvisaphoto1@gmail.com
            </p>
          </div>
        </section>
      </div>
    </main>
    
  );
}
