export default function WhyUsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="mb-8 inline-block text-sm font-semibold text-blue-200 hover:underline">
          ← Back to Home
        </a>

        <div className="rounded-3xl bg-white p-10 text-slate-800 shadow-2xl">
          <h1 className="text-4xl font-extrabold text-blue-950">
            Why Choose USVisaPhoto?
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            USVisaPhoto is built for people who need a fast, secure, and professional
            U.S. visa or passport photo without visiting a studio.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-blue-950">25 Years of Photo Standards</h2>
              <p className="mt-3 text-slate-600">
                Built on professional photo studio experience, not just automatic cropping.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-blue-950">Embassy-Ready Format</h2>
              <p className="mt-3 text-slate-600">
                Designed for U.S. 2x2 inch visa and passport photo requirements.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-blue-950">Privacy First</h2>
              <p className="mt-3 text-slate-600">
                Your uploaded and generated photos are not permanently stored on our servers.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-blue-950">Secure Payment</h2>
              <p className="mt-3 text-slate-600">
                Payments are processed by trusted providers such as PayPal and Toss Payments.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-blue-950">Instant Download</h2>
              <p className="mt-3 text-slate-600">
                Create your photo online and download your final file immediately after payment.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-blue-950">Manual Review Available</h2>
              <p className="mt-3 text-slate-600">
                Need help? Contact us for manual review at usvisaphoto1@gmail.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}