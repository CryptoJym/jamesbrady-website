"use client";

// On a phone the header keeps only "Work with him" (app/fg.css hides the other links under 720 px), which left a
// visitor there no way from the header to the work, his words, the theories or now; "In his words" was not in the
// footer either. This is the same four links behind a Menu button, only on a phone. It is a <details>, so it opens
// without script; with script it closes when a link is followed, on Escape, and when the page changes.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function PhoneMenu({ items }: { items: readonly { href: string; label: string }[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const path = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
        ref.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <details className="fg-menu" ref={ref}>
      <summary className="fg-menu__btn">Menu</summary>
      <nav className="fg-menu__panel" aria-label="Menu">
        {items.map((n) => (
          <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined} onClick={() => ref.current && (ref.current.open = false)}>
            {n.label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
