import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cursor Usage & Work Activity Report — Sanjay Kumar",
  description: "Transparent breakdown of Cursor usage correlated with work output",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        {/* Background pattern — fixed behind all content */}
        <div className="bg-pattern" aria-hidden="true">
          <div className="bg-glow-pulse" />
          <div className="bg-glow-pulse" />
          <div className="bg-glow-pulse" />
          <div className="bg-curves">
            <svg viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0 300 Q360 150 720 350 Q1080 550 1440 250" stroke="rgba(168,85,247,0.07)" strokeWidth="1.5" fill="none" />
              <path d="M0 500 Q400 300 800 500 Q1200 700 1440 400" stroke="rgba(124,58,237,0.05)" strokeWidth="1" fill="none" />
              <path d="M0 700 Q300 550 600 650 Q900 750 1200 500 Q1350 400 1440 450" stroke="rgba(139,92,246,0.06)" strokeWidth="1" fill="none" />
              <path d="M0 150 Q200 250 500 100 Q800 -50 1100 200 Q1300 350 1440 150" stroke="rgba(192,132,252,0.04)" strokeWidth="1.5" fill="none" />
              <path d="M0 850 Q360 750 720 800 Q1080 850 1440 700" stroke="rgba(109,40,217,0.05)" strokeWidth="1" fill="none" />
            </svg>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
