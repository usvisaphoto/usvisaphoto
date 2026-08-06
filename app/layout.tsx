import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Embassy-Ready U.S. Visa & Passport Photos | USVisaPhoto",

  description:
    "Create U.S. visa and passport photos online. Automatic background removal, correct 2x2 size, proper head alignment, instant download, built on 25 years of professional studio standards.",

  keywords: [
    "US visa photo",
    "US passport photo",
    "2x2 visa photo",
    "passport photo online",
    "visa photo maker",
    "embassy ready photo",
    "passport photo generator",
    "US visa photo online",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsEnabled = process.env.NODE_ENV === "production";

  return (
    <html lang="en-US" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950">
        <main className="flex-1">{children}</main>
        <Footer />
        {analyticsEnabled ? <Analytics /> : null}
      </body>
      {analyticsEnabled ? <GoogleAnalytics gaId="G-2PM4FCHM8F" /> : null}
    </html>
  );
}
