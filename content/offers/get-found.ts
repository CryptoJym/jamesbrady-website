import type { OfferEntry } from "@/lib/content/types";

/*
 * NEW REWARD, AS ITS OWN SITE DESCRIBES IT.
 *
 * Checked against www.newreward.com on 2026-09-27, over plain HTTP, and rewritten to match. Every claim below comes
 * from one of these pages, each of which returned 200 that day:
 *
 *   /                      the free score, "Each month, you approve a clear plan, we build it, and we measure what
 *                          changed", and the monthly report
 *   /ai-visibility-score   a 0–100 readiness score in about two minutes, with the issues ranked; "no access required
 *                          for the public score"; the free audit turns it into a ranked gap list
 *   /framework             score, diagnose, fix, then show the improvements; "no one can honestly promise AI will
 *                          mention you"; the price is "A flat monthly rate — simple, sized to your market", with no figure
 *   /industries            eight buyer paths, which are this page's audience list
 *   /faq                   "Pricing is scoped through the right engagement path"; every account it sets up is created
 *                          with the client as the transferable owner
 *
 * What changed on that date: the "fixed rubric of 12 axes and 76 measures" is gone, because newreward.com no longer
 * describes its scoring that way (it describes the 0–100 score), and the audience list is New Reward's own published
 * industries rather than a list compiled here.
 *
 * NO PRICE. James, 2026-09-27: "We don't publicly post our client price... We don't have any public listing and we
 * won't." So this offer carries no figure, no band and no "from" anywhere, and its price statement says so.
 */
export const entry: OfferEntry = {
  collection: "offers",
  slug: "get-found",
  title: "Get found in Google and in AI answers",
  kicker: "For a business with customers to win",
  capsuleQuestion: "What does getting found in search and in AI answers actually mean?",
  answerCapsule:
    "Getting found means two things now: showing up in an ordinary Google search, and being named when a buyer asks an AI assistant. New Reward, the agency James Brady operates, scores how a business appears across Google and the major AI assistants, ranks the gaps, and then does the approved work month by month, with evidence of what changed. New Reward claims results only where the data supports them, and no client outcome figure is published on this site.",
  summary:
    "New Reward scores how findable a business is in Google and in AI answers, ranks the gaps, and does the approved work each month, with evidence of what changed.",
  datePublished: "2026-08-12",
  dateModified: "2026-09-27",
  entities: ["person:james", "org:new-reward"],
  deliveredBy: {
    name: "New Reward",
    url: "https://www.newreward.com",
    role: "the agency that scores how you appear in Google and AI answers, then does the work and shows what changed",
  },
  audience: [
    "Hospitality",
    "Contractors",
    "Medical and wellness",
    "Financial services",
    "Legal",
    "Dental",
    "Pest control",
    "Agencies",
  ],
  steps: [
    {
      label: "Score",
      detail:
        "A scan starts from the website address and returns a readiness score from 0 to 100 in about two minutes, with the issues ranked. It reads Google Search and the answers of the major AI assistants, and the public score needs no access to your accounts.",
    },
    {
      label: "Rank the gaps",
      detail: "The free audit turns the score into a ranked list of gaps for that one business.",
    },
    {
      label: "Do the work, month by month",
      detail: "Each month the client approves a plan, New Reward builds it, and what changed is measured.",
    },
    {
      label: "Show what changed",
      detail:
        "Each approved fix ships with evidence of what changed. Movement is claimed only where the source data supports it.",
    },
  ],
  deliverables: [
    {
      label: "A score and a plan",
      detail:
        "One number from 0 to 100 for how often AI named the business when buyers asked, and the moves in the order that would change the answers most.",
    },
    {
      label: "The work itself",
      detail:
        "Technical and on-page SEO, structured data, content built around real searches, reviews and reputation, distribution and lead response, as the approved plan calls for them.",
    },
    {
      label: "A monthly report",
      detail: "The work finished, what changed, and what comes next.",
    },
    {
      label: "Accounts in your name",
      detail:
        "Every profile, listing and account New Reward sets up is created with the client as the transferable owner.",
    },
  ],
  price: {
    statement:
      "New Reward does not publish a client price, and neither does this site. Its own site describes one flat monthly rate, sized to your market and the work it takes, and scopes it with each client.",
  },
  inquiryType: "get_found",
  ctaLabel: "Start a visibility enquiry",
  proof: [
    {
      label: "New Reward, the agency that does this work",
      url: "https://www.newreward.com/",
      method:
        "HTTP GET, returned 200. Its home page describes the free score, the monthly plan the client approves, and the monthly report.",
      capturedAt: "2026-09-27",
    },
    {
      label: "How the score works",
      url: "https://www.newreward.com/ai-visibility-score",
      method:
        "HTTP GET, returned 200. A 0–100 readiness score in about two minutes, the issues ranked, and no account access needed for the public score.",
      capturedAt: "2026-09-27",
    },
    {
      label: "How the work runs, and how it is priced",
      url: "https://www.newreward.com/framework",
      method:
        "HTTP GET, returned 200. Score, diagnose, fix, then show the improvements; one flat monthly rate sized to the market, with no figure published.",
      capturedAt: "2026-09-27",
    },
    {
      label: "The industries it works in",
      url: "https://www.newreward.com/industries",
      method: "HTTP GET, returned 200. Its buyer paths, from hospitality to agencies, are the list on this page.",
      capturedAt: "2026-09-27",
    },
    {
      label: "The platform behind the measurement, on this site",
      url: "https://www.jamesbrady.org/work/visibility-platform",
      method: "The case study on this site, built from the same typed content source as this page.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/default.png",
    imageAlt: "James Brady — getting a business found in Google and in AI answers, with New Reward",
  },
  body: `## The thing you have probably heard

Someone has told you that your customers are asking ChatGPT instead of Google, and that you need to "show up in the AI answers". That is half right, and the half that is missing is the part that costs money.

Ordinary search did not go away. What changed is that a buyer can now finish their research without ever seeing a list of blue links. An assistant answers them, and it answers from sources it trusts. If those sources have never heard of you, you are not in the answer, and you will never see the visit you did not get.

So the question is not "how do I rank" or "how do I get into ChatGPT". It is: when someone in your area asks for what you sell, in a search box or in an assistant, what comes back, and where did it come from?

## How it gets measured

From outside first. The scan starts from the website address, with no setup and no access to anyone's accounts. It reads what Google and the major AI assistants can find: the structured data and discovery files, the trust signals such as reviews and listings, and whether the assistants actually name the business on the questions buyers ask. The result is a score from 0 to 100, with the gaps ranked.

Where a business approves access to its own Search Console and analytics, those are read too. New Reward's own site draws the line plainly: nobody can honestly promise that an AI assistant will mention a business, so it claims movement only where the data shows it.

## What happens after the score

The free audit turns the score into a ranked list of gaps. If New Reward then does the work, each month the client approves a plan, New Reward builds it, and the monthly report shows what was finished, what changed and what comes next. Every profile, listing and account it sets up is created with the client as the owner.

## What this page does not claim

No outcome figure from a client engagement is published on this site. Client work here is anonymized by agreement, and a named result goes up only with written clearance, as a case study with its method and window stated, not as a number in a headline.

What can be checked today is New Reward's own site, and the free score, which anyone can run on their own business.`,
};
