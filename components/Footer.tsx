import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07152d] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-14 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-2">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-extrabold text-blue-900">
                US
              </div>

              <div>

                <h2 className="text-2xl font-extrabold">
                  USVisaPhoto
                </h2>

                <p className="text-blue-200 text-sm">
                  Embassy-Ready U.S. Visa & Passport Photos
                </p>

              </div>

            </div>

            <p className="mt-8 max-w-lg text-slate-300 leading-7">
              Create professional U.S. visa and passport photos online.
              Built on 25 years of professional photo standards with
              secure processing and instant digital delivery.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <div className="rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-300">
                ✓ Privacy First
              </div>

              <div className="rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-300">
                ✓ Secure Payment
              </div>

              <div className="rounded-full bg-purple-500/20 px-4 py-2 text-sm text-purple-300">
                ✓ 25 Years Experience
              </div>

            </div>

          </div>

          {/* Company */}

          <div>

            <h3 className="mb-5 font-bold uppercase tracking-wider text-slate-400">
              Company
            </h3>

            <ul className="space-y-4 text-blue-100">

              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link href="/refund" className="hover:text-white transition">
                  Refund Policy
                </Link>
              </li>

              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            
              <li>
               <Link href="/why-us" className="hover:text-white transition">
                  Why Choose Us
              </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>

              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>

          </div>

          {/* Support */}

          <div>

            <h3 className="mb-5 font-bold uppercase tracking-wider text-slate-400">
              Support
            </h3>

            <div className="space-y-5 text-sm">

              <div>

                <div className="font-semibold">
                  Email
                </div>

                <a
                  href="mailto:usvisaphoto1@gmail.com"
                  className="text-blue-300 hover:text-white"
                >
                  usvisaphoto1@gmail.com
                </a>

              </div>

              <div>

                <div className="font-semibold">
                  Manual Review
                </div>

                <p className="text-slate-300">
                  Usually within 24 hours
                </p>

              </div>

              <div>

                <div className="font-semibold">
                  Photo Storage
                </div>

                <p className="text-green-300">
                  Never Permanently Stored
                </p>

              </div>

            </div>

          </div>

        </div>

        <div className="mt-14 border-t border-white/10 pt-8">

          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">

            <p className="text-sm text-slate-400">
              © 2026 USVisaPhoto. All rights reserved.
            </p>

            <p className="text-sm text-slate-500">
              Operated by <span className="font-semibold text-white">PhotoWinner</span>
            </p>

          </div>

        </div>

      </div>
    </footer>
  );
}
