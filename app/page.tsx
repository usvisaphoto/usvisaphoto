"use client";
import GuaranteeSection from "@/components/GuaranteeSection";
import TrustIntroSection from "@/components/TrustIntroSection";
import HeroUploadSection from "@/components/HeroUploadSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import PremiumComparison from "@/components/PremiumComparison";
import HomeTrustSections from "@/components/HomeTrustSections";
import { COUNTRY_PROFILES, type CountryCode } from "@/lib/photo-country-config";
import { useState } from "react";

export default function HomePage() {
  const [country, setCountry] = useState<CountryCode>("US");
  const profile = COUNTRY_PROFILES[country];
  return (
    <main className="min-h-screen text-white transition-[background] duration-500" style={{ background: profile.background }}>
      <HeroUploadSection selectedCountry={country} onCountryChange={setCountry} />

      <BeforeAfterSection />

      <TrustIntroSection />

      <PremiumComparison />

      <GuaranteeSection />

      <HomeTrustSections />
    </main>
  );
}
