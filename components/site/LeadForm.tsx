"use client";

import { useActionState } from "react";

import { submitContact, type ContactFormState } from "@/app/(site)/contact/actions";
import {
  budgetRanges,
  BUDGET_LABEL,
  helpTypes,
  HELP_LABEL,
  timelines,
  TIMELINE_LABEL,
  type HelpType,
} from "@/lib/contact";

const initialState: ContactFormState = { status: "idle", message: "" };

function Err({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="fgb-field__err" id={id}>
      {message}
    </p>
  );
}

/**
 * The lead form. The server action, the validator, the honeypot and the
 * gateway mapping are the EXISTING flow, reused unchanged — only the skin is
 * new (Fulgurite, app/fg-b.css). Failure surfaces visibly and always names the
 * email fallback; it must never fail silently.
 */
export function LeadForm({
  /**
   * Set from ?inquiry= on /contact, so an offer page's call to action arrives
   * with the right kind of enquiry already chosen. Resolved on the server and
   * passed down, which keeps the whole form in the server response.
   */
  preselectedHelpType,
}: {
  preselectedHelpType?: HelpType;
} = {}) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const err = state.fieldErrors ?? {};
  const described = (field: string) => (err[field] ? { "aria-invalid": true, "aria-describedby": `${field}-err` } : {});

  if (state.status === "success") {
    return (
      <div className="fgb-form" role="status">
        <p className="fgb-form__head">
          <span>Received</span>
          <span className="fgb-form__sent">sent</span>
        </p>
        <p className="fgb-form__msg">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="fgb-form" noValidate>
      <p className="fgb-form__head">
        <span>Project enquiry</span>
        <span>Company optional</span>
      </p>

      {state.status === "error" ? (
        <p className="fgb-form__err" role="alert">
          {state.message}
        </p>
      ) : null}

      {/* Honeypot — kept exactly as the existing flow expects it. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="fgb-field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" autoComplete="name" required {...described("name")} />
        <Err id="name-err" message={err.name} />
      </div>

      <div className="fgb-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required {...described("email")} />
        <Err id="email-err" message={err.email} />
      </div>

      <div className="fgb-field">
        <label htmlFor="company">Company (optional)</label>
        <input id="company" name="company" type="text" autoComplete="organization" {...described("company")} />
        <Err id="company-err" message={err.company} />
      </div>

      <div className="fgb-field">
        <label htmlFor="helpType">What kind of help</label>
        <select
          id="helpType"
          name="helpType"
          defaultValue={preselectedHelpType ?? ""}
          required
          {...described("helpType")}
        >
          <option value="" disabled>
            Choose one
          </option>
          {helpTypes.map((h) => (
            <option key={h} value={h}>
              {HELP_LABEL[h]}
            </option>
          ))}
        </select>
        <Err id="helpType-err" message={err.helpType} />
      </div>

      <div className="fgb-field fgb-field--half">
        <label htmlFor="timeline">Timeline</label>
        <select id="timeline" name="timeline" defaultValue="" required {...described("timeline")}>
          <option value="" disabled>
            Choose one
          </option>
          {timelines.map((t) => (
            <option key={t} value={t}>
              {TIMELINE_LABEL[t]}
            </option>
          ))}
        </select>
        <Err id="timeline-err" message={err.timeline} />
      </div>

      <div className="fgb-field fgb-field--half">
        <label htmlFor="budgetRange">Budget range</label>
        <select id="budgetRange" name="budgetRange" defaultValue="" required {...described("budgetRange")}>
          <option value="" disabled>
            Choose one
          </option>
          {budgetRanges.map((b) => (
            <option key={b} value={b}>
              {BUDGET_LABEL[b]}
            </option>
          ))}
        </select>
        <Err id="budgetRange-err" message={err.budgetRange} />
      </div>

      <div className="fgb-field">
        <label htmlFor="message">What needs to change, what makes it hard, what a useful outcome looks like</label>
        <textarea id="message" name="message" required minLength={20} maxLength={3000} {...described("message")} />
        <Err id="message-err" message={err.message} />
      </div>

      <button type="submit" className="fgb-send" disabled={pending}>
        {pending ? "Sending…" : "Send it"} <span aria-hidden="true">→</span>
      </button>

      <p className="fgb-form__note">
        If this form fails, it says so on screen and gives you the email address. It does not swallow the error.
      </p>
    </form>
  );
}
