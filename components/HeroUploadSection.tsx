import Link from "next/link";
import { uploadBoxHtmlV2 } from "@/components/uploadBoxV2";

export default function HeroUploadSection() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col px-8 pt-6 pb-4">
      <header className="mb-6 flex items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-extrabold text-blue-950">
            US
          </div>
          <div className="text-xl font-extrabold">USVisaPhoto</div>
        </Link>

       </header>

      <div className="grid items-center gap-14 pt-2 pb-6 lg:grid-cols-2">
        <div>
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm">
            Professional Standards · 25 Years Experience
          </div>

          <h1 className="mt-7 text-5xl font-extrabold leading-tight md:text-6xl">
            Embassy-Ready
            <br />
            U.S. Visa &
            <br />
            Passport
            <br />
            Photos
          </h1>

          <p className="mt-8 max-w-2xl text-xl leading-9 text-blue-100">
            Upload, remove background, auto-size crown-to-chin to 2.8cm,
            and download a 600×600 US visa photo.
          </p>

          <a
            id="upload"
            href="#upload-card"
            className="mt-8 flex max-w-xl items-center justify-center rounded-2xl bg-white px-8 py-5 text-lg font-extrabold text-blue-950 shadow-xl"
          >
            Upload Your Photo
          </a>

          <p className="mt-3 text-sm text-blue-200">
            Starting at <span className="font-bold text-white">$4.99</span> · Pay only after you preview your photo
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-4 gap-3">
            {["US", "KR", "JP", "CN", "CA", "IN", "VN", "Other"].map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-2xl border px-6 py-4 text-sm font-extrabold ${
                  item === "US"
                    ? "bg-white text-blue-950"
                    : "border-white/20 bg-white/10 text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div id="upload-card" className="mx-auto w-full max-w-sm">
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl">
            <div className="rounded-[1.5rem] bg-white p-4 text-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-blue-950">
                    Embassy-Ready Photo Creator
                  </div>
                  <div className="text-xs text-slate-500">
                    Upload · Auto Detect · Create Photo · Download
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900">
                    US 2x2
                  </div>
                  <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                    From $4.99
                  </div>
                </div>
              </div>

              <iframe
                title="Upload Preview"
                srcDoc={uploadBoxHtmlV2}
                className="min-h-[820px] w-full rounded-2xl border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
