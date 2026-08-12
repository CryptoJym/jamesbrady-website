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

function Err({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="field__err">{message}</p>;
}

/**
 * The lead form. The server action, the validator, the honeypot and the
 * gateway mapping are the EXISTING flow, reused unchanged — only the skin is
 * new. Failure surfaces visibly and always names the email fallback; it must
 * never fail silently.
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

  if (state.status === "success") {
    return (
      <div className="panel" role="status">
        <div className="panel__head">
          <span>Received</span>
          <span className="tag-live">sent</span>
        </div>
        <div className="panel__body">{state.message}</div>
      </div>
    );
  }

  return (
    <form action={formAction} className="panel" noValidate>
      <div className="panel__head">
        <span>Project enquiry</span>
        <span>All fields required</span>
      </div>
      <div className="panel__body">
        {state.status === "error" ? (
          <p className="form-status form-status--err" role="alert">
            {state.message}
          </p>
        ) : null}

        {/* Honeypot — kept exactly as the existing flow expects it. */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" autoComplete="name" required />
          <Err message={state.fieldErrors?.name} />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <Err message={state.fieldErrors?.email} />
        </div>

        <div className="field">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" type="text" autoComplete="organization" />
          <Err message={state.fieldErrors?.company} />
        </div>

        <div className="field">
          <label htmlFor="helpType">What kind of help</label>
          <select
            id="helpType"
            name="helpType"
            defaultValue={preselectedHelpType ?? ""}
            required
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
          <Err message={state.fieldErrors?.helpType} />
        </div>

        <div className="field">
          <label htmlFor="timeline">Timeline</label>
          <select id="timeline" name="timeline" defaultValue="" required>
            <option value="" disabled>
              Choose one
            </option>
            {timelines.map((t) => (
              <option key={t} value={t}>
                {TIMELINE_LABEL[t]}
              </option>
            ))}
          </select>
          <Err message={state.fieldErrors?.timeline} />
        </div>

        <div className="field">
          <label htmlFor="budgetRange">Budget range</label>
          <select id="budgetRange" name="budgetRange" defaultValue="" required>
            <option value="" disabled>
              Choose one
            </option>
            {budgetRanges.map((b) => (
              <option key={b} value={b}>
                {BUDGET_LABEL[b]}
              </option>
            ))}
          </select>
          <Err message={state.fieldErrors?.budgetRange} />
        </div>

        <div className="field">
          <label htmlFor="message">
            What needs to change, what makes it hard, what a useful outcome looks like
          </label>
          <textarea id="message" name="message" required minLength={20} maxLength={3000} />
          <Err message={state.fieldErrors?.message} />
        </div>

        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "SENDING…" : "SEND IT"}{" "}
          <span className="arw" aria-hidden="true">→</span>
        </button>

        <p className="form-note">
          If this form fails, it says so on screen and gives you the email address. It
          does not swallow the error.
        </p>
      </div>
    </form>
  );
}
