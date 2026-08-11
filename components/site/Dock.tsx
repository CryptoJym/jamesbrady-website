"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SITE } from "@/lib/seo/site";

export const DOCK_OPEN_EVENT = "dock:open";

/** Any affordance anywhere on the page can ask the dock to open. */
export function openDock() {
  window.dispatchEvent(new CustomEvent(DOCK_OPEN_EVENT));
}

/**
 * The Ask dock.
 *
 * Rests as a 48px icon-only pill and expands on hover, focus-visible or press,
 * stating its terms before anyone talks to it. The page reserves 96px at the
 * footer (--dock-reserve) so it never covers content at any breakpoint.
 *
 * Wave 1 ships NO chat backend. The expanded state is honest about that: it
 * says what the assistant will and will not do once it exists, and offers a
 * mailto so the affordance is never a dead end. The dock is a second door onto
 * content that already exists at a URL — never the only door.
 */
export function Dock() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    setOpen(true);
    ref.current?.focus();
  }, []);

  useEffect(() => {
    const onOpen = () => handleOpen();
    window.addEventListener(DOCK_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(DOCK_OPEN_EVENT, onOpen);
  }, [handleOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <button
      type="button"
      ref={ref}
      className={open ? "dock is-open" : "dock"}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label="Ask about my work"
      aria-describedby="dock-terms"
      onClick={() => (open ? setOpen(false) : handleOpen())}
    >
      <span className="dock__ico">
        <span className="dot dot--live" aria-hidden="true" />
      </span>
      <span className="dock__txt">
        <span className="dock__t" aria-hidden="true">
          Ask about my work
        </span>
        <span className="dock__s" id="dock-terms">
          {open ? (
            <>
              The assistant is not switched on yet. When it is, it will be grounded only
              in what is published here, it will cite the page it answered from, and it
              will say when it does not know. Until then:{" "}
              <a
                className="dock__mail"
                href={`mailto:${SITE.email}?subject=Question%20about%20your%20work`}
                onClick={(e) => e.stopPropagation()}
              >
                {SITE.email}
              </a>
            </>
          ) : (
            <>Grounded only in what&rsquo;s published here — it says when it doesn&rsquo;t know.</>
          )}
        </span>
      </span>
    </button>
  );
}

/** The nav pill and the hero CTA both point at the dock, never at a #ask anchor. */
export function DockTrigger({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        openDock();
      }}
    >
      {children}
    </button>
  );
}
