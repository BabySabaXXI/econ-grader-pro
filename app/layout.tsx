import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "../public/fonts/Inter-Variable.woff2",
      weight: "100 900",
    },
  ],
  variable: "--font-inter",
});

const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/Satoshi-Light.woff2",
      weight: "300",
    },
    {
      path: "../public/fonts/Satoshi-Regular.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/Satoshi-Medium.woff2",
      weight: "500",
    },
    {
      path: "../public/fonts/Satoshi-Bold.woff2",
      weight: "700",
    },
  ],
  variable: "--font-satoshi",
});

const interDisplay = localFont({
  src: [
    {
      path: "../public/fonts/InterDisplay-Medium.woff2",
      weight: "500",
    },
  ],
  variable: "--font-inter-display",
});

export const metadata: Metadata = {
  title: "EconGrader Pro | AI Essay Grader & Planner",
  description:
    "AI-powered Edexcel IAL Economics essay grading with detailed Assessment Objective breakdowns and essay planning assistance.",
  keywords: [
    "economics",
    "A-level",
    "Edexcel",
    "IAL",
    "essay grading",
    "AI tutor",
    "exam preparation",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${satoshi.variable} ${inter.variable} ${interDisplay.variable} font-satoshi text-body2 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
