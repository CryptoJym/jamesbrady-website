"use server";

import { validateContactForm } from "@/lib/contact";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};

const REQUEST_TIMEOUT_MS = 5_000;
const DEFAULT_LEAD_INGEST_URL =
  "https://api.utlyze.ai/api/trpc/leads.create?batch=1";

const engagementTypeMap = {
  ai_strategy: "not_sure",
  production_build: "build_sprint",
  agent_architecture: "systems_integration",
  integration: "systems_integration",
  speaking_media: "not_sure",
  partnership: "venture_build",
  other: "not_sure",
} as const;

const timelineMap = {
  immediate: "asap",
  one_month: "2_4_weeks",
  one_quarter: "1_3_months",
  exploring: "flexible",
} as const;

export async function submitContact(
  previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  void previousState;
  const validation = validateContactForm(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: validation.fieldErrors,
    };
  }

  if (validation.spam) {
    return {
      status: "success",
      message: "Thanks. Your note is on its way.",
    };
  }

  const ingestUrl =
    process.env.LEAD_INGEST_URL?.trim() || DEFAULT_LEAD_INGEST_URL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const lead = validation.data;
    const response = await fetch(ingestUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        0: {
          json: {
            name: lead.name,
            email: lead.email,
            company: lead.company,
            role: `JamesBrady.org / ${lead.helpType}`,
            message: lead.message,
            engagementType: engagementTypeMap[lead.helpType],
            timeline: timelineMap[lead.timeline],
            budgetRange:
              lead.budgetRange === "not_applicable"
                ? "prefer_not_to_say"
                : lead.budgetRange,
            source: "jamesbrady.org/contact",
          },
        },
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Lead gateway returned ${response.status}.`);
    }

    return {
      status: "success",
      message:
        "Thanks. James has your note and will follow up from james@utlyze.com.",
    };
  } catch (error) {
    console.error("[contact] Failed to deliver inquiry:", error);
    return {
      status: "error",
      message:
        "The contact line is temporarily unavailable. Email james@utlyze.com instead.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
