"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { submitAskLead, type ContactFormState } from "@/app/(site)/contact/actions";
import { describeBlock, type BlockView } from "@/lib/ask/blocks";
import { renderMarkdown } from "@/lib/content/markdown";
import { SITE } from "@/lib/seo/site";

/**
 * The Ask panel: the conversation surface. It mounts only when the server
 * layout said the rails exist, and it is loaded on demand, so a deployment
 * without the keys never downloads it and the dock keeps its wave-1 terms text.
 *
 * The model's reply arrives as blocks, not as a paragraph, and each block type
 * has its own component. A block type this build does not recognise renders as
 * text (lib/ask/blocks.ts), so a v2 model talking to a v1 renderer degrades
 * instead of showing an empty bubble.
 *
 * Markdown goes through the SAME renderer the case-study and theory pages use.
 * That renderer escapes the text before it parses anything and refuses to build
 * an anchor for a scheme outside http, https, mailto and site-relative links,
 * which is exactly the property needed for text a language model wrote.
 * verify-ask --offline feeds it script tags, event-handler attributes and
 * javascript: links and asserts none of them survive.
 */

type Turn =
  | { role: "user"; content: string }
  | { role: "assistant"; blocks: unknown[] };

const LOG_LIMIT = 24;

/** Opaque session token. Matches the server's `^[a-z0-9]{16,64}$` shape. */
function sessionToken(): string {
  const KEY = "ask.session";
  try {
    const held = window.sessionStorage.getItem(KEY);
    if (held && /^[a-z0-9]{16,64}$/.test(held)) return held;
  } catch {
    // Private mode, or storage switched off. A per-tab token is still fine.
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 32);
  try {
    window.sessionStorage.setItem(KEY, token);
  } catch {
    /* nothing to do; the token lives for this mount */
  }
  return token;
}

/* ------------------------------------------------------------- block views */

function Markdown({ source }: { source: string }) {
  return (
    <div
      className="askm"
      // Escaped and scheme-filtered by lib/content/markdown.ts before it gets here.
      dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }}
    />
  );
}

function BlockView({ view }: { view: BlockView }) {
  switch (view.kind) {
    case "text":
      return view.markdown ? <Markdown source={view.markdown} /> : null;

    case "sources":
      return view.pages.length ? (
        <div className="asksrc">
          <span className="asksrc__lab">Answered from</span>
          <ul>
            {view.pages.map((page) => (
              <li key={page.url}>
                <a href={page.url}>{page.title}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null;

    case "ref":
      return (
        <a className="askchip" href={view.href}>
          <span className="askchip__k">{view.family === "work" ? "Work" : "Theory"}</span>
          <span className="askchip__b">{view.blurb}</span>
        </a>
      );

    case "reach":
      return <ReachCard reason={view.reason} />;

    case "decline":
      return (
        <p className="askdec">
          {view.message}
        </p>
      );
  }
}

/* ---------------------------------------------------------- the lead card */

const leadInitial: ContactFormState = { status: "idle", message: "" };

function ReachCard({ reason }: { reason: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitAskLead, leadInitial);

  if (state.status === "success") {
    return (
      <div className="askcard" role="status">
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <div className="askcard">
      {reason ? <p className="askcard__why">{reason}</p> : null}
      {!open ? (
        <button
          type="button"
          className="btn btn--ghost askcard__open"
          onClick={() => setOpen(true)}
        >
          SEND JAMES A NOTE <span className="arw" aria-hidden="true">&rarr;</span>
        </button>
      ) : (
        <form action={formAction} noValidate>
          {state.status === "error" ? (
            <p className="form-status form-status--err" role="alert">
              {state.message}
            </p>
          ) : null}

          {/* Honeypot. Same field name the existing lead path already expects. */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
            <label htmlFor="ask-website">Website</label>
            <input id="ask-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="field">
            <label htmlFor="ask-name">Name</label>
            <input id="ask-name" name="name" type="text" autoComplete="name" required />
            {state.fieldErrors?.name ? <p className="field__err">{state.fieldErrors.name}</p> : null}
          </div>

          <div className="field">
            <label htmlFor="ask-email">Email</label>
            <input id="ask-email" name="email" type="email" autoComplete="email" required />
            {state.fieldErrors?.email ? (
              <p className="field__err">{state.fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="ask-context">What you would like to talk about</label>
            <textarea id="ask-context" name="context" required minLength={10} maxLength={1500} />
            {state.fieldErrors?.context ? (
              <p className="field__err">{state.fieldErrors.context}</p>
            ) : null}
          </div>

          <div className="askconsent">
            <input id="ask-consent" name="consent" type="checkbox" value="yes" required />
            <label htmlFor="ask-consent">
              James may email me back at this address about this note.
            </label>
          </div>
          {state.fieldErrors?.consent ? (
            <p className="field__err">{state.fieldErrors.consent}</p>
          ) : null}

          <button type="submit" className="btn btn--primary" disabled={pending}>
            {pending ? "SENDING…" : "SEND IT"}{" "}
            <span className="arw" aria-hidden="true">&rarr;</span>
          </button>

          <p className="form-note">
            Only these three fields are sent. This conversation is not attached to your
            note, and none of it is stored.
          </p>
        </form>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- the panel */

export function AskPanel({ onClose }: { onClose: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [trouble, setTrouble] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // The log scrolls to the newest turn. `behavior: auto` because a smooth
  // scroll here is motion nobody asked for, and the reduced-motion rule would
  // have to unpick it anyway.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [turns, pending]);

  /**
   * Focus trap. This panel IS modal while it is open, which is why it carries
   * role="dialog" and aria-modal, unlike the terms disclosure the dock shows
   * when the assistant is switched off. Tab cycles inside; Escape leaves and
   * hands focus back to the pill.
   */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea,input:not([type="hidden"]),select,[tabindex]:not([tabindex="-1"])',
      );
      const list = Array.from(focusable).filter((el) => el.offsetParent !== null);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const send = useCallback(
    async (question: string) => {
      const asked = question.trim();
      if (!asked || pending) return;

      const asking: Turn = { role: "user", content: asked };
      const history: Turn[] = [...turns, asking].slice(-LOG_LIMIT);
      setTurns(history);
      setDraft("");
      setPending(true);
      setTrouble(null);

      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "content-type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            sessionId: sessionToken(),
            messages: history.map((turn) =>
              turn.role === "user"
                ? { role: "user", content: turn.content }
                : { role: "assistant", content: JSON.stringify({ blocks: turn.blocks }) },
            ),
          }),
        });
        const body = (await response.json().catch(() => null)) as
          | { blocks?: unknown[] }
          | null;

        if (body && Array.isArray(body.blocks) && body.blocks.length > 0) {
          setTurns((current) => [...current, { role: "assistant", blocks: body.blocks! }]);
        } else {
          setTrouble(
            `The assistant did not answer that time. Email ${SITE.email} and James will pick it up.`,
          );
        }
      } catch {
        setTrouble(
          `The assistant could not be reached. Email ${SITE.email} and James will pick it up.`,
        );
      } finally {
        setPending(false);
        inputRef.current?.focus();
      }
    },
    [pending, turns],
  );

  return (
    <div
      className="askp"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="askp-title"
      aria-describedby="askp-terms"
    >
      <div className="askp__head">
        <span id="askp-title">Ask about my work</span>
        <button type="button" className="askp__x" onClick={onClose}>
          Close <kbd>Esc</kbd>
        </button>
      </div>

      <div className="askp__log" ref={logRef} role="log" aria-live="polite" aria-busy={pending}>
        {turns.length === 0 ? (
          <p className="askp__hint">
            Ask about a project, a theory, or how any of it was checked. Answers come only
            from the pages on this site, and each one names the page it came from.
          </p>
        ) : null}

        {turns.map((turn, index) =>
          turn.role === "user" ? (
            <p className="askq" key={`q${index}`}>
              <span className="askq__k">You</span>
              {turn.content}
            </p>
          ) : (
            <div className="aska" key={`a${index}`}>
              {turn.blocks.map((block, b) => (
                <BlockView key={b} view={describeBlock(block)} />
              ))}
            </div>
          ),
        )}

        {pending ? (
          <p className="askp__wait">
            <span className="dot dot--live" aria-hidden="true" /> Reading the pages…
          </p>
        ) : null}

        {trouble ? (
          <p className="askdec" role="alert">
            {trouble}
          </p>
        ) : null}
      </div>

      <form
        className="askp__form"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <label className="askp__lab" htmlFor="askp-input">
          Your question
        </label>
        <textarea
          id="askp-input"
          ref={inputRef}
          className="askp__in"
          value={draft}
          rows={2}
          maxLength={2000}
          placeholder="What does the visibility platform measure?"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send(draft);
            }
          }}
        />
        <button type="submit" className="btn btn--primary askp__go" disabled={pending || !draft.trim()}>
          {pending ? "ASKING…" : "ASK"}
        </button>
      </form>

      <p className="askp__terms" id="askp-terms">
        Grounded only in what is published here. It cites the page it answered from, and it
        says when it does not know. Nothing you type is stored.
      </p>
    </div>
  );
}
