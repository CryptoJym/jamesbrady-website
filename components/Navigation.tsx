'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List, X } from '@phosphor-icons/react';

const links = [
  { href: '/#work', label: 'Work' },
  { href: '/#library', label: 'Library' },
  { href: '/watch', label: 'Watch' },
  { href: '/about', label: 'About' },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-[900px] transition-all duration-600 ease-out-expo ${
          scrolled
            ? 'bg-[#0A0A0A]/90 backdrop-blur-xl border border-[#1E1E1E] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-[#0A0A0A]/60 backdrop-blur-md border border-[#1E1E1E]/50'
        } rounded-full px-5 py-2.5`}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 text-[#D4A853] font-semibold tracking-tight text-[15px] hover:opacity-80 transition-opacity duration-300"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#D4A853]/25 bg-[#D4A853]/[0.06] text-[11px]">
              JB
            </span>
            <span className="hidden text-[13px] font-medium text-[#E8E4DD] lg:inline">
              James Brady
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`relative text-[13px] tracking-wide px-3 py-1.5 rounded-full transition-all duration-500 ease-out-expo ${
                  pathname === l.href
                    ? 'text-[#D4A853] bg-[#D4A853]/8'
                    : 'text-neutral-400 hover:text-[#E8E4DD] hover:bg-white/[0.03]'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className={`ml-1 rounded-full px-4 py-2 text-[12px] font-semibold tracking-wide transition-premium ${
                pathname === '/contact'
                  ? 'bg-[#E5C87A] text-[#0A0A0A]'
                  : 'bg-[#D4A853] text-[#0A0A0A] hover:bg-[#E5C87A]'
              }`}
            >
              Work with James
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((current) => !current)}
            className="md:hidden text-neutral-400 hover:text-[#E8E4DD] transition-colors duration-300 p-1"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? (
              <X size={18} weight="light" />
            ) : (
              <List size={18} weight="light" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        id="mobile-navigation"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-2xl transition-all duration-500 ease-out-expo md:hidden ${
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col justify-center min-h-[100dvh] px-8">
          <div className="space-y-1">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block text-3xl font-medium tracking-tight py-3 transition-all duration-500 ease-out-expo ${
                  open
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                } ${
                  pathname === l.href
                    ? 'text-[#D4A853]'
                    : 'text-neutral-300 hover:text-[#D4A853]'
                }`}
                style={{
                  transitionDelay: open ? `${150 + i * 75}ms` : '0ms',
                }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className={`mt-6 flex items-center justify-between rounded-full bg-[#D4A853] px-6 py-4 text-lg font-semibold text-[#0A0A0A] transition-all duration-500 ease-out-expo ${
                open
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: open ? `${150 + links.length * 75}ms` : '0ms' }}
            >
              Work with James
              <span aria-hidden>↗</span>
            </Link>
          </div>
          <div className="mt-12 pt-8 border-t border-[#1E1E1E]">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-sm text-neutral-500 hover:text-[#D4A853] transition-colors duration-300"
            >
              James Brady
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
