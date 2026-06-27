export default function PrivacyPage() {
    
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
          Privacy Policy
        </h1>

        <p className="mb-10 text-lg text-slate-600">
          Last updated: July 2026
        </p>

        <section className="space-y-8">

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Your Privacy Matters
            </h2>

            <p>
              At USVisaPhoto, protecting your privacy is one of our highest
              priorities. Your uploaded photos are processed only to create
              your visa or passport photo and are not permanently stored.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Information We Collect
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Uploaded photo</li>
              <li>Selected country</li>
              <li>Payment confirmation</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Information We Do NOT Store
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Your uploaded photo is not permanently stored.</li>
              <li>Your generated visa photo is not permanently stored.</li>
              <li>We never store your credit card information.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Payment Security
            </h2>

            <p>
              Payments are securely processed through trusted payment providers
              such as PayPal and Toss Payments. We never receive or store your
              payment card details.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              AI Training
            </h2>

            <p>
              Your uploaded photos are never used to train AI models and are
              never sold or shared with third parties.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Contact
            </h2>

            <p>
              Questions about this Privacy Policy?
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