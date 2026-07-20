import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  return (
    <html
      lang="en-US"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}