"use client";

import { useActionState } from "react";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import { submitContact, type ContactFormState } from "@/app/contact/actions";

const initialState: ContactFormState = {
  status: "idle",
  message: "",
};

const bookingUrl =
  "https://www.utlyze.com/booking?utm_source=jamesbrady.org&utm_medium=referral&utm_campaign=personal-site-form-success";

const labelClass = "evidence-label text-[#171A1B]";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm text-[#9F2415]">
      {message}
    </p>
  );
}

export function ContactForm({ source = "contact" }: { source?: "home" | "contact" }) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <div className="border-y border-[#171A1B] bg-white py-8" role="status" aria-live="polite">
        <CheckCircle size={31} weight="regular" className="text-[#B93620]" />
        <p className="evidence-label mt-7 text-[#B93620]">Inquiry received</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">The context is in James&apos;s hands.</h2>
        <p className="mt-4 max-w-[50ch] leading-relaxed text-[#5E6864]">{state.message}</p>
        <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="button-secondary mt-7">
          Book 20 minutes now
          <ArrowUpRight size={14} weight="bold" />
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="border-y border-[#171A1B] bg-white py-7 md:px-8 md:py-8">
      <input type="hidden" name="source" value={source} />

      <div className="flex items-start justify-between gap-5 border-b border-[#CDD3CF] pb-6">
        <div>
          <p className="evidence-label text-[#B93620]">Direct inquiry</p>
          <p className="mt-2 text-sm leading-relaxed text-[#5E6864]">Three required fields. No mailing list.</p>
        </div>
        <span className="evidence-label text-[#5E6864]">01 / Context</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${source}-name`}>
            Name <span className="text-[#B93620]">*</span>
          </label>
          <input
            className="field-control mt-2"
            id={`${source}-name`}
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={state.fieldErrors?.name ? `${source}-name-error` : undefined}
          />
          <FieldError id={`${source}-name-error`} message={state.fieldErrors?.name} />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${source}-email`}>
            Email <span className="text-[#B93620]">*</span>
          </label>
          <input
            className="field-control mt-2"
            id={`${source}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? `${source}-email-error` : undefined}
          />
          <FieldError id={`${source}-email-error`} message={state.fieldErrors?.email} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${source}-company`}>
            Company or project <span className="font-normal text-[#5E6864]">(optional)</span>
          </label>
          <input
            className="field-control mt-2"
            id={`${source}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={120}
            placeholder="Where the work lives"
            aria-invalid={Boolean(state.fieldErrors?.company)}
            aria-describedby={state.fieldErrors?.company ? `${source}-company-error` : undefined}
          />
          <FieldError id={`${source}-company-error`} message={state.fieldErrors?.company} />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${source}-helpType`}>
            Inquiry type <span className="font-normal text-[#5E6864]">(optional)</span>
          </label>
          <select
            className="field-control mt-2"
            id={`${source}-helpType`}
            name="helpType"
            defaultValue=""
            aria-invalid={Boolean(state.fieldErrors?.helpType)}
            aria-describedby={state.fieldErrors?.helpType ? `${source}-helpType-error` : undefined}
          >
            <option value="">Choose if useful</option>
            <option value="ai_strategy">AI strategy</option>
            <option value="production_build">Product or system build</option>
            <option value="agent_architecture">Agent architecture</option>
            <option value="integration">Systems integration</option>
            <option value="speaking_media">Speaking or media</option>
            <option value="partnership">Partnership</option>
            <option value="other">Something else</option>
          </select>
          <FieldError id={`${source}-helpType-error`} message={state.fieldErrors?.helpType} />
        </div>
      </div>

      <div className="mt-6">
        <label className={labelClass} htmlFor={`${source}-message`}>
          What are you trying to change? <span className="text-[#B93620]">*</span>
        </label>
        <textarea
          className="field-control mt-2 min-h-40 resize-y"
          id={`${source}-message`}
          name="message"
          minLength={20}
          maxLength={3000}
          placeholder="The problem, the constraints, and what a useful outcome looks like."
          required
          aria-invalid={Boolean(state.fieldErrors?.message)}
          aria-describedby={state.fieldErrors?.message ? `${source}-message-error` : `${source}-message-hint`}
        />
        <p id={`${source}-message-hint`} className="mt-2 text-xs leading-relaxed text-[#5E6864]">
          Useful context beats polished language.
        </p>
        <FieldError id={`${source}-message-error`} message={state.fieldErrors?.message} />
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${source}-website`}>Website</label>
        <input id={`${source}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-7 flex flex-col gap-5 border-t border-[#CDD3CF] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[32ch] text-xs leading-relaxed text-[#5E6864]">
          Sent through the Utlyze lead system. James replies from james@utlyze.com.
        </p>
        <button className="button-primary shrink-0 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send the context"}
          {!pending && <ArrowUpRight size={14} weight="bold" />}
        </button>
      </div>

      <div aria-live="polite">
        {state.status === "error" && (
          <p className="mt-5 border border-[#C94B3A] bg-[#FFF3F0] px-4 py-3 text-sm text-[#7F1D12]" role="alert">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
