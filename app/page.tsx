"use client";
import GuaranteeSection from "@/components/GuaranteeSection";
import TrustIntroSection from "@/components/TrustIntroSection";
import HeroUploadSection from "@/components/HeroUploadSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import PremiumComparison from "@/components/PremiumComparison";
import HomeTrustSections from "@/components/HomeTrustSections";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white">
      <HeroUploadSection />

      <BeforeAfterSection />

      <TrustIntroSection />

      <PremiumComparison />

      <GuaranteeSection />

      <HomeTrustSections />
    </main>
  );
}
