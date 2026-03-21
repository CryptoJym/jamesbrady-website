import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "James Brady — AI Alchemist",
    template: "%s — James Brady",
  },
  description:
    "AI systems, protocols, and programs on a mathematical substrate. Tools that work.",
  metadataBase: new URL("https://jamesbrady.org"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "James Brady — AI Alchemist",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#0A0A0A] text-[#E8E4DD] font-sans">
        <Navigation />
        <main className="pt-16">{children}</main>
        <footer className="border-t border-[#1E1E1E] py-12 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <span>&copy; 2025 James Brady</span>
            <div className="flex gap-6">
              <a
                href="/feed.xml"
                className="hover:text-[#D4A853] transition-colors"
              >
                RSS
              </a>
              <a
                href="/llms.txt"
                className="hover:text-[#D4A853] transition-colors"
              >
                llms.txt
              </a>
              <a
                href="/api/catalog"
                className="hover:text-[#D4A853] transition-colors"
              >
                API
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
