import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "PitchPilot — Personalized Soccer Training Plans",
  description: "Personalized soccer skill training plans built from real coaching experience.",
  openGraph: {
    title: "PitchPilot — Personalized Soccer Training Plans",
    description: "Personalized soccer skill training plans built from real coaching experience.",
    images: ["/brand/pitchpilot-logo-full.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PitchPilot — Personalized Soccer Training Plans",
    description: "Personalized soccer skill training plans built from real coaching experience.",
    images: ["/brand/pitchpilot-logo-full.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
