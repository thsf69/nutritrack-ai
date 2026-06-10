import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "NutriTrack AI — Smart Nutrition & Calorie Tracker",
  description:
    "Track your meals, get AI-powered nutrition advice, plan healthy meals, and achieve your fitness goals with NutriTrack AI. Free nutrition tracker with personalized insights.",
  keywords: "nutrition tracker, calorie counter, meal planner, AI diet coach, healthy eating, fitness app",
  authors: [{ name: "NutriTrack AI" }],
  openGraph: {
    title: "NutriTrack AI — Smart Nutrition & Calorie Tracker",
    description: "AI-powered nutrition tracking to help you eat better and live healthier.",
    type: "website",
    url: "https://nutritrack-ai.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriTrack AI",
    description: "AI-powered nutrition tracking app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // REPLACE ca-pub-XXXXXXXXXXXXXXXX below with your real AdSense Publisher ID
  // Get it from: https://adsense.google.com after approval
  const ADSENSE_PUBLISHER_ID = "ca-pub-XXXXXXXXXXXXXXXX";
  const isAdSenseReady = !ADSENSE_PUBLISHER_ID.includes("XXXX");

  return (
    <html lang="en">
      <head>
        {/* Google AdSense — activates automatically once you replace the Publisher ID */}
        {isAdSenseReady && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
