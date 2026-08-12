import type { OfferEntry } from "@/lib/content/types";

export const entry: OfferEntry = {
  collection: "offers",
  slug: "get-found",
  title: "Get found in Google and in AI answers",
  kicker: "For a business with customers to win",
  capsuleQuestion: "What does getting found in search and in AI answers actually mean?",
  answerCapsule:
    "Getting found means two things now: ranking in an ordinary Google search, and being the source an AI assistant answers from. New Reward, the agency James Brady operates, measures both from outside a business, scores what it finds against a fixed rubric of 12 axes and 76 measures, and reports which gaps are worth closing first. Missing evidence is written down as missing. No outcome figure from a client engagement is published on this site yet.",
  summary:
    "Measuring how findable a business is in Google and in AI answers, scoring it against a fixed rubric, and fixing what the score exposes.",
  datePublished: "2026-08-12",
  dateModified: "2026-08-12",
  entities: ["person:james", "org:new-reward"],
  deliveredBy: {
    name: "New Reward",
    url: "https://newreward.com",
    role: "the agency that runs the measurement and the work that follows it",
  },
  audience: [
    "Medical and health services",
    "HVAC",
    "Roofing",
    "Concrete",
    "Gutters",
    "Financial and commercial lending",
    "Custom software and IT staffing",
    "Pet breeding",
    "Background screening",
    "Promotional products",
    "Call-center software",
  ],
  steps: [
    {
      label: "Measure from outside",
      detail:
        "A first run uses only what any member of the public can see, so nothing waits on account access. Where a connection already exists, Search Console and analytics are read directly.",
    },
    {
      label: "Score against a fixed rubric",
      detail:
        "The same 12 axes and 76 measures every time. A fixed rubric is what makes this month comparable to last month, and one business comparable to a competitor.",
    },
    {
      label: "Report the decision, not the dashboard",
      detail:
        "The report leads with the comparison and what it means for the business. The checklist and the formula sit under the score. The technical evidence goes in an appendix.",
    },
    {
      label: "Close the gaps that are worth closing",
      detail:
        "The findings come back as work, in the order that pays. A finding nobody acts on was a cost, not a result.",
    },
  ],
  deliverables: [
    {
      label: "A report an owner can act on without a translator",
      detail:
        "Plain language, the business conclusion first, and a visible checklist under every score.",
    },
    {
      label: "The evidence under every finding",
      detail:
        "Each finding carries its source, the date it was collected, and the vantage point it was seen from, because the same page can look different to different visitors.",
    },
    {
      label: "A fix list in priority order",
      detail: "What to do first, what it should change, and how the change will be checked.",
    },
    {
      label: "A repeatable baseline",
      detail:
        "The same rubric run again later, so movement is measured rather than asserted.",
    },
  ],
  budgetBands: ["5k_15k", "15k_50k", "50k_plus"],
  inquiryType: "get_found",
  ctaLabel: "Start a visibility enquiry",
  proof: [
    {
      label: "New Reward, the agency that delivers this work",
      url: "https://newreward.com",
      method: "HTTP GET, returned 200.",
      capturedAt: "2026-08-11",
    },
    {
      label: "The published scoring method, in full",
      url: "https://h3ro-dev.github.io/new-reward-seo-skills-os/",
      method:
        "HTTP GET, returned 200. The underlying repository is private; the method site is public.",
      capturedAt: "2026-08-11",
    },
    {
      label: "The platform that runs the measurement, described in full",
      url: "https://www.jamesbrady.org/work/visibility-platform",
      method: "The case study on this site, built from the same typed content source as this page.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/work-with-me.png",
    imageAlt: "James Brady — getting a business found in search and in AI answers",
  },
  body: `## The thing you have probably heard

Someone has told you that your customers are asking ChatGPT instead of Google, and that you need to "show up in the AI answers". That is half right, and the half that is missing is the part that costs money.

Ordinary search did not go away. What changed is that a buyer can now finish their research without ever seeing a list of blue links. An assistant answers them, and it answers from sources it trusts. If those sources have never heard of you, you are not in the answer, and you will never see the visit you did not get.

So the question is not "how do I rank" or "how do I get into ChatGPT". It is: when someone in your area asks for what you sell, in a search box or in an assistant, what comes back, and where did it come from?

## How it gets measured

From outside first. A run collects what any member of the public can see, which means the first measurement does not wait on logins, agency handovers, or anyone finding a password. Where you already have Search Console and analytics connected, those get read too.

Everything found is scored against a fixed rubric: 12 axes, with 76 measures underneath them. The axes do not change between runs, and that is the point. A rubric that moves cannot tell you whether you improved.

Where the evidence is not there, the report says the evidence is not there. It never scores a gap as a zero. A zero and an unknown are different facts, and a report that blurs them will send you to fix the wrong thing.

## What you get

A report that leads with the comparison and the business conclusion, so you can act on it without reading the technical part. Under the score sits a plain checklist and the formula, so you can check the number rather than trust it. The technical evidence goes in an appendix for whoever maintains your site.

Then the findings come back as work, in the order that pays. Measurement that nobody acts on is a bill.

## What this page does not claim

No outcome figure from a client engagement is published on this site yet. Client work here is anonymized by agreement, and a named result only goes up when a client gives written clearance. When one does, it will appear as a case study with the method and the window stated, not as a number in a headline.

What can be checked today is the platform itself, the published scoring method, and the agency front. All three are linked from this page.`,
};
