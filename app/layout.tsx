import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edexcel IAL Economics | AI Essay Grader & Planner",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
