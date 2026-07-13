import type { Metadata } from "next";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "James Brady — Founder & AI Systems Builder",
    template: "%s — James Brady",
  },
  description:
    "James Brady builds the operating layer between AI capability and accountable work: products, agents, workflows, and proof systems.",
  metadataBase: new URL("https://www.jamesbrady.org"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "James Brady",
    title: "James Brady — Founder & AI Systems Builder",
    description:
      "Building the operating layer between AI capability and accountable work.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "James Brady — Founder & AI Systems Builder",
    description:
      "Building the operating layer between AI capability and accountable work.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

const footerLinks = [
  { label: "Work", href: "/#work" },
  { label: "Thesis", href: "/#thesis" },
  { label: "Watch", href: "/watch" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="bg-[#F4F5F2] font-sans text-[#171A1B] antialiased">
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[60] rounded-[6px] bg-[#171A1B] px-4 py-3 text-sm font-semibold text-white focus:not-sr-only"
        >
          Skip to content
        </a>
        <Navigation />
        <main id="main-content" className="pt-[72px]">
          {children}
        </main>

        <footer id="site-footer" className="border-t border-[#CDD3CF] bg-[#F4F5F2]">
          <div className="site-shell py-12 md:py-16">
            <div className="grid gap-12 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="text-2xl font-semibold tracking-[-0.04em]">
                  James Brady
                </p>
                <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-[#5E6864]">
                  Founder and AI systems builder. Turning capability into
                  products, workflows, and proof that carry real work.
                </p>
                <Link href="/contact" className="text-link mt-6 inline-flex items-center gap-2 text-sm">
                  Start a conversation
                  <ArrowUpRight size={13} weight="bold" />
                </Link>
              </div>

              <div className="md:col-span-3 md:col-start-8">
                <p className="evidence-label text-[#5E6864]">Navigate</p>
                <div className="mt-4 flex flex-col items-start gap-2">
                  {footerLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-link py-1 text-sm">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="evidence-label text-[#5E6864]">Open surfaces</p>
                <div className="mt-4 flex flex-col items-start gap-2">
                  <a href="/feed.xml" className="text-link py-1 text-sm">
                    RSS
                  </a>
                  <a href="/llms.txt" className="text-link py-1 text-sm">
                    llms.txt
                  </a>
                  <a href="/api/catalog" className="text-link py-1 text-sm">
                    API
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-3 border-t border-[#CDD3CF] pt-6 text-xs text-[#5E6864] sm:flex-row sm:items-center sm:justify-between">
              <span>&copy; {new Date().getFullYear()} James Brady.</span>
              <span className="font-mono">Proof before claims.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
