import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Economics Grader Pro | Edexcel IAL Essay Feedback",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-background min-h-screen">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-brown-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brown-500 to-brown-700 flex items-center justify-center">
                  <span className="text-white font-serif font-bold text-lg">E</span>
                </div>
                <div>
                  <h1 className="font-serif text-xl font-semibold text-brown-800">
                    Economics Grader Pro
                  </h1>
                  <p className="text-xs text-brown-500">Edexcel IAL • AI-Powered Feedback</p>
                </div>
              </div>
              <nav className="flex items-center gap-2">
                <span className="text-sm text-brown-500 hidden sm:inline">
                  Powered by Claude AI
                </span>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-brown-200 bg-brown-50 py-6">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-brown-500">
              <p>
                Economics Grader Pro uses AI to provide feedback aligned with Edexcel marking
                standards.
              </p>
              <p className="mt-1">
                Always verify important information with your teacher or official mark schemes.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
