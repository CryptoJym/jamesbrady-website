export const helpTypes = [
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

export type ContactLead = {
  name: string;
  email: string;
  company: string;
  helpType: (typeof helpTypes)[number];
  timeline: (typeof timelines)[number];
  budgetRange: (typeof budgetRanges)[number];
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
