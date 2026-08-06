"use client";

import Link from "next/link";
import { useMemo } from "react";
import { embassyValidationHtmlV3 } from "@/components/uploadBoxV2";
import { COUNTRY_PROFILES, countryCodes, otherCountryCodes, type CountryCode } from "@/lib/photo-country-config";

type Props = { selectedCountry: CountryCode; onCountryChange: (country: CountryCode) => void };

function CountryFlag({ country }: { country: (typeof countryCodes)[number] }) {
  const common = { className: "h-6 w-9 overflow-hidden rounded-[4px] shadow-sm ring-1 ring-black/10", viewBox: "0 0 36 24", role: "img", "aria-hidden": true } as const;

  if (country === "US") return <svg {...common}><rect width="36" height="24" fill="#fff"/><path stroke="#b22234" strokeWidth="2" d="M0 1h36M0 5h36M0 9h36M0 13h36M0 17h36M0 21h36"/><rect width="15" height="13" fill="#3c3b6e"/><g fill="#fff"><circle cx="3" cy="3" r=".7"/><circle cx="7" cy="3" r=".7"/><circle cx="11" cy="3" r=".7"/><circle cx="5" cy="6.5" r=".7"/><circle cx="9" cy="6.5" r=".7"/><circle cx="3" cy="10" r=".7"/><circle cx="7" cy="10" r=".7"/><circle cx="11" cy="10" r=".7"/></g></svg>;
  if (country === "KR") return <svg {...common}><rect width="36" height="24" fill="#fff"/><path fill="#cd2e3a" d="M12 12a6 6 0 0 1 12 0c-3-2.7-6 2.7-9 0a3 3 0 0 0-3 0Z"/><path fill="#0047a0" d="M24 12a6 6 0 0 1-12 0c3 2.7 6-2.7 9 0a3 3 0 0 0 3 0Z"/><g stroke="#111" strokeWidth="1"><path d="m5 5 5-3m-4 5 5-3M26 20l5-3m-6 1 5-3M5 17l5 3m-4-5 5 3M26 4l5 3m-6-1 5 3"/></g></svg>;
  if (country === "JP") return <svg {...common}><rect width="36" height="24" fill="#fff"/><circle cx="18" cy="12" r="6.5" fill="#bc002d"/></svg>;
  if (country === "CN") return <svg {...common}><rect width="36" height="24" fill="#de2910"/><path fill="#ffde00" d="m7 3 1.2 2.5 2.8.4-2 2 .5 2.8L7 9.4l-2.5 1.3L5 7.9l-2-2 2.8-.4Z"/></svg>;
  if (country === "CA") return <svg {...common}><rect width="36" height="24" fill="#fff"/><path fill="#d80621" d="M0 0h8v24H0zm28 0h8v24h-8zM18 4l1.5 4 3-1.2-1 3.2 3 1.5-3.5 2 1.2 3.7-3.2-.7v3.5h-2v-3.5l-3.2.7 1.2-3.7-3.5-2 3-1.5-1-3.2 3 1.2Z"/></svg>;
  if (country === "IN") return <svg {...common}><path fill="#ff9933" d="M0 0h36v8H0z"/><path fill="#fff" d="M0 8h36v8H0z"/><path fill="#138808" d="M0 16h36v8H0z"/><circle cx="18" cy="12" r="3" fill="none" stroke="#000080" strokeWidth=".8"/><circle cx="18" cy="12" r=".7" fill="#000080"/></svg>;
  if (country === "VN") return <svg {...common}><rect width="36" height="24" fill="#da251d"/><path fill="#ff0" d="m18 4 1.8 5.3h5.6L21 12.6l1.7 5.3-4.7-3.3-4.7 3.3 1.7-5.3-4.4-3.3h5.6Z"/></svg>;
  return <svg {...common}><rect width="36" height="24" fill="#0f766e"/><circle cx="18" cy="12" r="7" fill="none" stroke="#fff" strokeWidth="1.3"/><path d="M11 12h14M18 5c4 4 4 10 0 14M18 5c-4 4-4 10 0 14" fill="none" stroke="#fff" strokeWidth="1.1"/></svg>;
}

export default function HeroUploadSection({ selectedCountry, onCountryChange }: Props) {
  const profile = COUNTRY_PROFILES[selectedCountry];
  const iframeHtml = useMemo(() => embassyValidationHtmlV3.replace("<head>", `<head><script>window.EMBASSY_PHOTO_PROFILE=${JSON.stringify(profile).replace(/</g, "\\u003c")};<\/script>`), [profile]);
  return (
    <section className="mx-auto flex max-w-[112rem] flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="USVisaPhoto home">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-lg" aria-hidden="true">{profile.flag}</span>
          <span className="text-xl font-black tracking-tight">{profile.country} Photo</span>
        </Link>
        <span className="hidden rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-xs font-bold text-emerald-100 sm:inline-flex">Secure preview · Pay after validation</span>
      </header>

      <div className="grid items-start gap-12 pb-8 lg:grid-cols-[minmax(24rem,.8fr)_minmax(42rem,1.2fr)] xl:gap-16">
        <div className="pt-3 lg:sticky lg:top-8">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-bold text-blue-100 backdrop-blur">Professional standards · 25 years of studio experience</div>
          <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-.04em] sm:text-6xl xl:text-7xl">{profile.heading}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">{profile.description}</p>

          <a href="#upload-card" className="mt-8 flex min-h-14 max-w-xl items-center justify-center rounded-2xl bg-cyan-300 px-8 text-lg font-black text-blue-950 shadow-[0_18px_45px_rgba(34,211,238,.25)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">Validate your photo</a>
          <p className="mt-3 text-sm text-blue-200">Preview before checkout · Basic photo from <strong className="text-white">$4.99</strong></p>

          <div className="mt-8 grid max-w-xl grid-cols-4 gap-2 sm:gap-3" aria-label="Supported photo destinations">
            {countryCodes.map((country) => (
              <button type="button" key={country} aria-label={`${COUNTRY_PROFILES[country].country} photo`} aria-pressed={country === selectedCountry || (country === "Other" && otherCountryCodes.includes(selectedCountry as (typeof otherCountryCodes)[number]))} onClick={() => onCountryChange(country)} className={`flex min-h-[66px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-xs font-black transition hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-[76px] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm ${country === selectedCountry || (country === "Other" && otherCountryCodes.includes(selectedCountry as (typeof otherCountryCodes)[number])) ? "border-white bg-white text-slate-950 shadow-lg" : "border-white/20 bg-white/[.07] text-white"}`}><CountryFlag country={country} /><span>{country}</span></button>
            ))}
          </div>
          {(selectedCountry === "Other" || otherCountryCodes.includes(selectedCountry as (typeof otherCountryCodes)[number])) && (
            <div className="mt-3 grid max-w-xl grid-cols-2 gap-2 rounded-2xl border border-white/20 bg-black/15 p-3 sm:grid-cols-3" aria-label="Other passport destinations">
              {otherCountryCodes.map((country) => (
                <button type="button" key={country} aria-pressed={country === selectedCountry} onClick={() => onCountryChange(country)} className={`rounded-xl border px-3 py-3 text-left text-xs font-bold transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white ${country === selectedCountry ? "border-white bg-white text-slate-950" : "border-white/20 bg-white/[.08] text-white"}`}><span className="mr-2 text-base" aria-hidden="true">{COUNTRY_PROFILES[country].flag}</span>{COUNTRY_PROFILES[country].country}<span className="mt-1 block text-[10px] opacity-75">{COUNTRY_PROFILES[country].sizeLabel}</span></button>
              ))}
            </div>
          )}
        </div>

        <div id="upload-card" className="mx-auto w-full max-w-[48rem] scroll-mt-4">
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-xl sm:p-5">
            <div className="rounded-[1.5rem] bg-white p-3 text-slate-900 sm:p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div><h2 className="text-sm font-black" style={{ color: profile.ink }}>{profile.country} Photo Validation</h2><p className="mt-1 text-xs text-slate-500">Upload → Detect → Review → Create</p></div>
                <div className="flex flex-col items-end gap-1"><span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: profile.accentSoft, color: profile.ink }}>{profile.flag} {profile.shortSize}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">From $4.99</span></div>
              </div>
              <iframe key={selectedCountry} title={`${profile.country} photo validator`} srcDoc={iframeHtml} className="min-h-[1180px] w-full rounded-2xl border-0 sm:min-h-[1320px]" sandbox="allow-scripts allow-same-origin allow-forms allow-downloads" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
