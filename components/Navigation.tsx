"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#thesis", label: "Thesis" },
  { href: "/watch", label: "Watch" },
  { href: "/about", label: "About" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    const main = document.getElementById("main-content");
    const footer = document.getElementById("site-footer");
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 top-0 z-50 border-b border-[#CDD3CF] bg-[#F4F5F2]"
      >
        <div className="site-shell flex h-[72px] items-center justify-between gap-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-[18px] font-semibold tracking-[-0.025em] text-[#171A1B] transition-colors duration-150 hover:text-[#B93620]"
          >
            James Brady
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => {
              const active =
                (link.href === "/about" && pathname === "/about") ||
                (link.href === "/watch" && pathname === "/watch");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center border-b text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "border-[#D94A2E] text-[#171A1B]"
                      : "border-transparent text-[#5E6864] hover:text-[#B93620]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/contact" className="button-primary">
              Talk with James
              <span aria-hidden>↗</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#CDD3CF] text-[#171A1B] md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={21} /> : <List size={21} />}
          </button>
        </div>
      </nav>

      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 top-[72px] z-40 bg-[#F4F5F2] px-4 py-8 md:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <div className="mx-auto flex h-full max-w-xl flex-col">
          <div className="border-t border-[#CDD3CF]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[68px] items-center justify-between border-b border-[#CDD3CF] text-2xl font-semibold tracking-[-0.035em] text-[#171A1B]"
              >
                {link.label}
                <span className="text-[#B93620]" aria-hidden>
                  ↗
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="button-primary mt-8 w-full"
          >
            Talk with James
            <span aria-hidden>↗</span>
          </Link>
          <p className="mt-auto border-t border-[#CDD3CF] pt-5 text-sm leading-relaxed text-[#5E6864]">
            Founder and AI systems builder. Proof before claims.
          </p>
        </div>
      </nav>
    </>
  );
}
