"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { SITE } from "@/lib/seo/site";

export const DOCK_OPEN_EVENT = "dock:open";

/** Any affordance anywhere on the page can ask the dock to open. */
export function openDock() {
  window.dispatchEvent(new CustomEvent(DOCK_OPEN_EVENT));
}

// The conversation surface is loaded only when the route says there is one to
// load. A visitor on a deployment without the keys never downloads it.
const AskPanel = dynamic(() => import("./AskPanel").then((m) => m.AskPanel), {
  ssr: false,
});

/**
 * The Ask dock.
 *
 * Rests as a 48px icon-only pill and expands on hover, focus-visible or press.
 * The page reserves 96px at the footer (--dock-reserve) so it never covers
 * content at any breakpoint.
 *
 * TWO OPEN STATES, decided by the route and not by a build flag:
 *
 *   · The assistant is switched off (no XAI_API_KEY, or no rate-limit store).
 *     GET /api/ask answers 503 {"state":"not_configured"} and the dock behaves
 *     exactly as it did in wave 1: it says the assistant is not on yet, states
 *     what it will do when it is, and offers a mailto so the affordance is
 *     never a dead end. This is a disclosure, not a dialog: aria-expanded plus
 *     aria-controls, no focus trap, no modality.
 *
 *   · The assistant is switched on. The pill opens the Ask panel, which IS
 *     modal while it is open and carries role="dialog", a focus trap and
 *     focus return.
 *
 * The dock is a second door onto content that already exists at a URL. Never
 * the only door: every answer it gives is on a page, and the site is fully
 * usable with this switched off or with JavaScript off entirely.
 *
 * `configured` is read from the environment by the server layout at build. It
 * is a boolean about whether the rails exist, never a key and never a URL.
 */
export function Dock({ configured }: { configured: boolean }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    setOpen(true);
    btnRef.current?.focus();
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    btnRef.current?.focus();
  }, []);

  useEffect(() => {
    const onOpen = () => handleOpen();
    window.addEventListener(DOCK_OPEN_EVENT, onOpen);
    // The nav pill advertises ⌘K, so ⌘K has to do something. It opens the
    // dock, which either takes a question or states its terms — the same thing
    // every other ask affordance does. A shortcut printed on screen that does
    // nothing is the small end of the same dishonesty this site is built
    // against.
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleOpen();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(DOCK_OPEN_EVENT, onOpen);
      document.removeEventListener("keydown", onKey);
    };
  }, [handleOpen]);

  const chat = open && configured;

  useEffect(() => {
    if (!open || chat) return;
    // Terms mode only. The panel owns its own Escape handling and its own
    // focus trap; wiring a second handler here would close the dock out from
    // under a visitor who was cancelling something inside the form.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    // Tested against the ROOT, not the button: the terms text and its mailto
    // link are siblings of the hit target, and a click on the mail link must
    // not close the dock out from under the navigation.
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, chat, handleClose]);

  return (
    <>
      {/* STRUCTURE (independent review, P3): the dock used to be one <button>
          with an <a> nested inside it — invalid HTML, and browsers recover from
          it differently, so the mailto was not reliably reachable. The hit
          target is now a sibling stretched over the pill (the same pattern
          .card uses for its stretched link), so the whole pill is still one
          click, the mail link is a real link, and the keyboard path is
          unchanged: Tab reaches the button, Enter/Space toggles, Escape closes,
          ⌘K opens. */}
      <div ref={rootRef} className={open && !chat ? "dock is-open" : "dock"}>
        <button
          type="button"
          ref={btnRef}
          className="dock__hit"
          aria-expanded={open}
          aria-controls={chat ? "askp-title" : "dock-terms"}
          aria-haspopup={configured ? "dialog" : undefined}
          aria-label="Ask about my work"
          onClick={() => (open ? handleClose() : handleOpen())}
        />
        <span className="dock__ico">
          <span className="dot dot--live" aria-hidden="true" />
        </span>
        <span className="dock__txt">
          <span className="dock__t" aria-hidden="true">
            Ask about my work
          </span>
          <span className="dock__s" id="dock-terms">
            {open && !chat ? (
              <>
                The assistant is not switched on yet. When it is, it will be grounded only
                in what is published here, it will cite the page it answered from, and it
                will say when it does not know. Until then:{" "}
                <a
                  className="dock__mail"
                  href={`mailto:${SITE.email}?subject=Question%20about%20your%20work`}
                >
                  {SITE.email}
                </a>
              </>
            ) : (
              <>Grounded only in what&rsquo;s published here — it says when it doesn&rsquo;t know.</>
            )}
          </span>
        </span>
      </div>

      {chat ? <AskPanel onClose={handleClose} /> : null}
    </>
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
