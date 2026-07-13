"use client";

import { useActionState } from "react";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import {
  submitContact,
  type ContactFormState,
} from "@/app/contact/actions";

const initialState: ContactFormState = {
  status: "idle",
  message: "",
};

const bookingUrl =
  "https://www.utlyze.com/booking?utm_source=jamesbrady.org&utm_medium=referral&utm_campaign=personal-site-form-success";

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#292929] bg-[#0A0A0A] px-4 py-3.5 text-[15px] text-[#E8E4DD] placeholder:text-neutral-700 transition-premium hover:border-[#3A3A3A] focus:border-[#D4A853]/60 focus:outline-none";
const labelClass = "text-sm font-medium text-neutral-300";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-xs text-red-300">{message}</p>;
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div
        className="rounded-[28px] border border-[#D4A853]/25 bg-[#11100D] p-8 md:p-10"
        role="status"
      >
        <CheckCircle size={34} weight="light" className="text-[#D4A853]" />
        <h2 className="mt-7 text-2xl font-semibold tracking-tight text-[#E8E4DD]">
          Transmission received.
        </h2>
        <p className="mt-3 max-w-[46ch] leading-relaxed text-neutral-400">
          {state.message}
        </p>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-7 inline-flex items-center gap-3 rounded-full border border-[#D4A853]/25 px-5 py-3 text-sm font-medium text-[#E8E4DD] transition-premium hover:border-[#D4A853]/45 hover:bg-[#D4A853]/[0.05]"
        >
          Book 20 minutes now
          <ArrowUpRight
            size={14}
            weight="bold"
            className="text-[#D4A853] transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-[28px] border border-[#1E1E1E] bg-[#101010] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-9"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Name <span className="text-[#D4A853]">*</span>
          </label>
          <input
            className={fieldClass}
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          <FieldError message={state.fieldErrors?.name} />
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            Email <span className="text-[#D4A853]">*</span>
          </label>
          <input
            className={fieldClass}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          <FieldError message={state.fieldErrors?.email} />
        </div>
      </div>

      <div className="mt-6">
        <label className={labelClass} htmlFor="company">
          Company or project
        </label>
        <input
          className={fieldClass}
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          maxLength={120}
          placeholder="Where this work will live"
          aria-invalid={Boolean(state.fieldErrors?.company)}
        />
        <FieldError message={state.fieldErrors?.company} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="helpType">
            What do you need? <span className="text-[#D4A853]">*</span>
          </label>
          <select
            className={fieldClass}
            id="helpType"
            name="helpType"
            defaultValue=""
            required
            aria-invalid={Boolean(state.fieldErrors?.helpType)}
          >
            <option value="" disabled>
              Select a focus
            </option>
            <option value="ai_strategy">AI strategy</option>
            <option value="production_build">Production build</option>
            <option value="agent_architecture">Agent architecture</option>
            <option value="integration">Systems integration</option>
            <option value="speaking_media">Speaking or media</option>
            <option value="partnership">Partnership</option>
            <option value="other">Something else</option>
          </select>
          <FieldError message={state.fieldErrors?.helpType} />
        </div>

        <div>
          <label className={labelClass} htmlFor="timeline">
            Timeline <span className="text-[#D4A853]">*</span>
          </label>
          <select
            className={fieldClass}
            id="timeline"
            name="timeline"
            defaultValue=""
            required
            aria-invalid={Boolean(state.fieldErrors?.timeline)}
          >
            <option value="" disabled>
              Select a timeframe
            </option>
            <option value="immediate">Ready now</option>
            <option value="one_month">Within a month</option>
            <option value="one_quarter">This quarter</option>
            <option value="exploring">Exploring</option>
          </select>
          <FieldError message={state.fieldErrors?.timeline} />
        </div>
      </div>

      <div className="mt-6">
        <label className={labelClass} htmlFor="budgetRange">
          Budget range <span className="text-[#D4A853]">*</span>
        </label>
        <select
          className={fieldClass}
          id="budgetRange"
          name="budgetRange"
          defaultValue=""
          required
          aria-invalid={Boolean(state.fieldErrors?.budgetRange)}
        >
          <option value="" disabled>
            Select a range
          </option>
          <option value="under_5k">Under $5,000</option>
          <option value="5k_15k">$5,000–$15,000</option>
          <option value="15k_50k">$15,000–$50,000</option>
          <option value="50k_plus">$50,000+</option>
          <option value="not_applicable">Not applicable</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        <FieldError message={state.fieldErrors?.budgetRange} />
      </div>

      <div className="mt-6">
        <label className={labelClass} htmlFor="message">
          What are you trying to change? <span className="text-[#D4A853]">*</span>
        </label>
        <textarea
          className={`${fieldClass} min-h-40 resize-y`}
          id="message"
          name="message"
          minLength={20}
          maxLength={3000}
          placeholder="The problem, the constraints, and what a useful outcome looks like."
          required
          aria-invalid={Boolean(state.fieldErrors?.message)}
        />
        <FieldError message={state.fieldErrors?.message} />
      </div>

      <div
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-7 flex flex-col gap-4 border-t border-[#1E1E1E] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-neutral-600">
          No list. No funnel. Just a direct project conversation.
        </p>
        <button
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#D4A853] px-6 py-3.5 text-sm font-semibold text-[#0A0A0A] transition-premium hover:bg-[#E5C87A] disabled:cursor-wait disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          {pending ? "Sending…" : "Send inquiry"}
          {!pending && (
            <ArrowUpRight
              size={15}
              weight="bold"
              className="transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          )}
        </button>
      </div>

      {state.status === "error" && (
        <p
          className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
