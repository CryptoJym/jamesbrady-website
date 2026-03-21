'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List, X } from '@phosphor-icons/react';

const links = [
  { href: '/primer', label: 'Primer' },
  { href: '/manuscript', label: 'Manuscript' },
  { href: '/workshop', label: 'Workshop' },
  { href: '/about', label: 'About' },
  { href: '/links', label: 'Links' },
  { href: '/watch', label: 'Watch' },
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-[720px] transition-all duration-600 ease-out-expo ${
          scrolled
            ? 'bg-[#0A0A0A]/90 backdrop-blur-xl border border-[#1E1E1E] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-[#0A0A0A]/60 backdrop-blur-md border border-[#1E1E1E]/50'
        } rounded-full px-5 py-2.5`}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-[#D4A853] font-semibold tracking-tight text-[15px] hover:opacity-80 transition-opacity duration-300"
          >
            JB
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`relative text-[13px] tracking-wide px-3.5 py-1.5 rounded-full transition-all duration-500 ease-out-expo ${
                  pathname === l.href
                    ? 'text-[#D4A853] bg-[#D4A853]/8'
                    : 'text-neutral-400 hover:text-[#E8E4DD] hover:bg-white/[0.03]'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-neutral-400 hover:text-[#E8E4DD] transition-colors duration-300 p-1"
            aria-label="Toggle menu"
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
