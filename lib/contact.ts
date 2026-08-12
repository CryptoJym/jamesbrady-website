export const helpTypes = [
  // Added wave 3 with the /work-with-me path. A local-service owner arriving
  // from "Get my business found" was previously offered nothing that described
  // what they came for, and picked "AI strategy" or "Something else".
  "get_found",
  // Added wave 3b with /work-with-me/background-screening. Same reasoning as
  // get_found one line above: an employer arriving from "Screen your hires"
  // would otherwise have to file the enquiry under "Something else", and the
  // one fact that routes it — what they actually came for — is lost at the
  // first field.
  "background_screening",
  "ai_strategy",
  "production_build",
  "agent_architecture",
  "integration",
  "speaking_media",
  "partnership",
  "other",
] as const;

export const timelines = [
  "immediate",
  "one_month",
  "one_quarter",
  "exploring",
] as const;

export const budgetRanges = [
  "under_5k",
  "5k_15k",
  "15k_50k",
  "50k_plus",
  "not_applicable",
  "prefer_not_to_say",
] as const;

export type HelpType = (typeof helpTypes)[number];
export type Timeline = (typeof timelines)[number];
export type BudgetRange = (typeof budgetRanges)[number];

/**
 * The visible labels, here rather than in the form component.
 *
 * The offer pages print budget bands beside their calls to action, and the
 * form offers the same bands a click later. Two copies of "$15k – $50k" is a
 * pair that drifts, and the one that drifts is the one on the page nobody
 * edited. One list, two readers.
 */
export const HELP_LABEL: Record<HelpType, string> = {
  get_found: "Get found in search and AI answers",
  background_screening: "Background screening",
  ai_strategy: "AI strategy",
  production_build: "Production build",
  agent_architecture: "Agent architecture",
  integration: "Integration",
  speaking_media: "Speaking or media",
  partnership: "Partnership",
  other: "Something else",
};

export const TIMELINE_LABEL: Record<Timeline, string> = {
  immediate: "Immediately",
  one_month: "Within a month",
  one_quarter: "Within a quarter",
  exploring: "Still exploring",
};

export const BUDGET_LABEL: Record<BudgetRange, string> = {
  under_5k: "Under $5k",
  "5k_15k": "$5k – $15k",
  "15k_50k": "$15k – $50k",
  "50k_plus": "$50k+",
  not_applicable: "Not applicable",
  prefer_not_to_say: "Prefer not to say",
};

/** Query key the offer pages use to preselect an enquiry type on /contact. */
export const INQUIRY_PARAM = "inquiry";

/** A URL-supplied enquiry type, or undefined when it is absent or unknown. */
export function parseHelpType(raw: string | undefined): HelpType | undefined {
  return helpTypes.includes(raw as HelpType) ? (raw as HelpType) : undefined;
}

export type ContactLead = {
  name: string;
  email: string;
  company: string;
  helpType: HelpType;
  timeline: Timeline;
  budgetRange: BudgetRange;
  message: string;
};

export type ContactValidationResult =
  | { ok: true; spam: true }
  | { ok: true; spam: false; data: ContactLead }
  | { ok: false; fieldErrors: Record<string, string> };

function value(formData: FormData, field: string) {
  const raw = formData.get(field);
  return typeof raw === "string" ? raw.trim() : "";
}

/**
 * The Ask dock's reach-James card.
 *
 * Three fields and a consent tick, because the card appears mid-conversation
 * and the full qualification form belongs on /contact. It reuses this module's
 * honeypot, its email rule and its server action, so there is one lead path on
 * the site rather than a second one written in a hurry next to a chat window.
 *
 * The conversation is NOT part of this. Nothing from the chat is read, attached
 * or implied; the visitor writes what they want James to see. chatbot-spec
 * keeps an opt-in "include our conversation" tick for v2, and until that tick
 * exists there is nothing to opt into.
 */
export type AskLead = {
  name: string;
  email: string;
  context: string;
};

export type AskLeadValidationResult =
  | { ok: true; spam: true }
  | { ok: true; spam: false; data: AskLead }
  | { ok: false; fieldErrors: Record<string, string> };

export function validateAskLead(formData: FormData): AskLeadValidationResult {
  if (value(formData, "website")) {
    return { ok: true, spam: true };
  }

  const data = {
    name: value(formData, "name"),
    email: value(formData, "email").toLowerCase(),
    context: value(formData, "context"),
  };
  const fieldErrors: Record<string, string> = {};

  if (data.name.length < 2 || data.name.length > 100) {
    fieldErrors.name = "Enter your full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (data.context.length < 10 || data.context.length > 1500) {
    fieldErrors.context = "Say at least a sentence, and keep it under 1,500 characters.";
  }
  if (value(formData, "consent") !== "yes") {
    fieldErrors.consent = "Tick the box so James may reply to you.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return { ok: true, spam: false, data };
}

export function validateContactForm(
  formData: FormData,
): ContactValidationResult {
  if (value(formData, "website")) {
    return { ok: true, spam: true };
  }

  const data = {
    name: value(formData, "name"),
    email: value(formData, "email").toLowerCase(),
    company: value(formData, "company"),
    helpType: value(formData, "helpType"),
    timeline: value(formData, "timeline"),
    budgetRange: value(formData, "budgetRange"),
    message: value(formData, "message"),
  };
  const fieldErrors: Record<string, string> = {};

  if (data.name.length < 2 || data.name.length > 100) {
    fieldErrors.name = "Enter your full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (data.company.length > 120) {
    fieldErrors.company = "Keep the company name under 120 characters.";
  }
  if (!helpTypes.includes(data.helpType as ContactLead["helpType"])) {
    fieldErrors.helpType = "Select the kind of help you need.";
  }
  if (!timelines.includes(data.timeline as ContactLead["timeline"])) {
    fieldErrors.timeline = "Select a timeline.";
  }
  if (
    !budgetRanges.includes(data.budgetRange as ContactLead["budgetRange"])
  ) {
    fieldErrors.budgetRange = "Select a budget range.";
  }
  if (data.message.length < 20 || data.message.length > 3000) {
    fieldErrors.message =
      "Share at least 20 characters and keep the note under 3,000.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    spam: false,
    data: data as ContactLead,
  };
}
