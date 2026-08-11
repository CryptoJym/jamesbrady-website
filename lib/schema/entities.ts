// The entity graph. One canonical Person node, defined once.
//
// geo-seo-spec §2.1 ruling: the full Person node is emitted into every page's
// @graph from THIS builder, so it is byte-identical on every URL and any page
// crawls standalone. What is banned is a second, differently-shaped Person
// object — page-level nodes point at the @id, never at an inline literal.

import { SITE, absolute } from "@/lib/seo/site";

export const PERSON_ID = `${SITE.host}/#person`;
export const UTLYZE_ID = `${SITE.host}/#utlyze`;
export const NEW_REWARD_ID = `${SITE.host}/#new-reward`;
export const WEBSITE_ID = `${SITE.host}/#website`;
export const THEORY_GLOSSARY_ID = `${SITE.host}/#theory-glossary`;
export const WORK_GLOSSARY_ID = `${SITE.host}/#work-glossary`;

/**
 * Exact list, ordered, no additions without a ruling. The X and TikTok entries
 * are plain profile links only, permitted by the 2026-08-11 ruling. No h3ro
 * branding and no h3ro.ai domain appear anywhere else on this site.
 */
export const SAME_AS = [
  "https://github.com/CryptoJym",
  "https://www.linkedin.com/in/jamesbrady1/",
  "https://x.com/h3roai",
  "https://www.tiktok.com/@h3ro.ai",
  "https://bsky.app/profile/utlyzeit.bsky.social",
  "https://www.youtube.com/channel/UCA_9udyLWeGoJy12vc5TmfA",
] as const;

export const personNode = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "James Brady",
  url: absolute("/"),
  // Register rule: never "AI Alchemist".
  jobTitle: "Builder of AI systems",
  description: SITE.description,
  email: `mailto:${SITE.email}`,
  homeLocation: {
    "@type": "Place",
    name: "Lehi, UT",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lehi",
      addressRegion: "UT",
      addressCountry: "US",
    },
  },
  worksFor: [{ "@id": UTLYZE_ID }, { "@id": NEW_REWARD_ID }],
  sameAs: [...SAME_AS],
} as const;

export const utlyzeNode = {
  "@type": "Organization",
  "@id": UTLYZE_ID,
  name: "Utlyze",
  url: "https://utlyze.com",
  description: "The studio. Builds products and takes on custom software and systems work.",
} as const;

export const newRewardNode = {
  "@type": "Organization",
  "@id": NEW_REWARD_ID,
  name: "New Reward",
  url: "https://newreward.com",
  description:
    "The agency. Measures how findable a business is in search and inside AI assistants, then fixes it.",
} as const;

export const websiteNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: absolute("/"),
  name: SITE.name,
  description: SITE.descriptor,
  publisher: { "@id": PERSON_ID },
  inLanguage: "en-US",
} as const;

/** The identity nodes every page carries. */
export const identityNodes = [personNode, utlyzeNode, newRewardNode];

export const personRef = { "@id": PERSON_ID } as const;

export const ENTITY_NODE_ID: Record<string, string> = {
  "person:james": PERSON_ID,
  "org:utlyze": UTLYZE_ID,
  "org:new-reward": NEW_REWARD_ID,
};
