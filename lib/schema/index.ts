// JSON-LD graph builders — geo-seo-spec §2.
//
// Every page emits exactly one <script type="application/ld+json"> containing
// {"@context":…, "@graph":[…]}. Serialization escapes "<" per the repo pattern.

import { absolute } from "@/lib/seo/site";
import type { LabEntry, LearnEntry, TheoryEntry, WorkEntry } from "@/lib/content/types";
import { MATURITY_LABEL } from "@/lib/content/types";
import {
  ENTITY_NODE_ID,
  identityNodes,
  personRef,
  THEORY_GLOSSARY_ID,
  WORK_GLOSSARY_ID,
  websiteNode,
} from "./entities";

type Node = Record<string, unknown>;

export function serializeGraph(nodes: Node[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(
    /</g,
    "\\u003c",
  );
}

/** Identity nodes ride on every page so any URL crawls standalone. */
function withIdentity(nodes: Node[]): Node[] {
  return [...identityNodes, ...nodes];
}

function publisherRef(entities: string[]): Node {
  const org = entities.find((e) => e.startsWith("org:"));
  return org ? { "@id": ENTITY_NODE_ID[org] } : personRef;
}

/**
 * `/` adds nothing beyond the identity nodes — WebSite rides on every page
 * now (P1-4), so emitting it again here would put two WebSite nodes with the
 * same @id in one graph.
 */
export function homeGraph(): Node[] {
  return withIdentity([]);
}

export function collectionGraph(input: {
  path: string;
  name: string;
  description: string;
  items: { path: string; name: string }[];
}): Node[] {
  return withIdentity([
    {
      "@type": "CollectionPage",
      "@id": `${absolute(input.path)}#page`,
      url: absolute(input.path),
      name: input.name,
      description: input.description,
      isPartOf: { "@id": websiteNode["@id"] },
      about: personRef,
    },
    {
      "@type": "ItemList",
      "@id": `${absolute(input.path)}#list`,
      itemListElement: input.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(item.path),
        name: item.name,
      })),
    },
  ]);
}

export function workGraph(entry: WorkEntry): Node[] {
  const url = absolute(`/work/${entry.slug}`);
  const isCode = entry.repo?.public === true;
  const node: Node = {
    "@type": isCode ? "SoftwareSourceCode" : "CreativeWork",
    "@id": `${url}#work`,
    url,
    name: entry.title,
    headline: entry.title,
    abstract: entry.answerCapsule,
    description: entry.summary,
    datePublished: entry.datePublished,
    dateModified: entry.dateModified,
    author: personRef,
    publisher: publisherRef(entry.entities),
    isPartOf: { "@id": websiteNode["@id"] },
    keywords: entry.stack.join(", "),
    citation: entry.proof.map((p) => ({
      "@type": "CreativeWork",
      name: p.label,
      ...(p.url ? { url: p.url } : {}),
      description: p.method,
      dateCreated: p.capturedAt,
    })),
  };
  if (isCode && entry.repo) {
    node.codeRepository = `https://github.com/${entry.repo.owner}/${entry.repo.name}`;
    node.programmingLanguage = entry.stack[0];
    if (entry.repo.license) node.license = entry.repo.license;
  }
  return withIdentity([
    node,
    {
      "@type": "DefinedTerm",
      "@id": `${url}#term`,
      name: entry.title,
      description: entry.answerCapsule,
      termCode: entry.slug,
      inDefinedTermSet: { "@id": WORK_GLOSSARY_ID },
    },
    {
      "@type": "DefinedTermSet",
      "@id": WORK_GLOSSARY_ID,
      name: "Work glossary",
    },
  ]);
}

export function theoryGraph(entry: TheoryEntry): Node[] {
  const url = absolute(`/theories/${entry.slug}`);
  const status = entry.paused
    ? `${MATURITY_LABEL[entry.maturity]}, paused`
    : MATURITY_LABEL[entry.maturity];
  return withIdentity([
    {
      // Article, never ScholarlyArticle.
      "@type": "Article",
      "@id": `${url}#article`,
      url,
      headline: entry.title,
      alternativeHeadline: entry.name,
      name: entry.name,
      abstract: entry.abstract,
      description: entry.summary,
      creativeWorkStatus: status,
      datePublished: entry.datePublished,
      dateModified: entry.dateModified,
      author: personRef,
      publisher: publisherRef(entry.entities),
      isPartOf: { "@id": websiteNode["@id"] },
      mentions: {
        "@type": "Claim",
        "@id": `${url}#claim`,
        text: entry.claim,
      },
      citation: entry.proof.map((p) => ({
        "@type": "CreativeWork",
        name: p.label,
        ...(p.url ? { url: p.url } : {}),
        description: p.method,
        dateCreated: p.capturedAt,
      })),
    },
    {
      "@type": "DefinedTerm",
      "@id": `${url}#term`,
      name: entry.name,
      description: entry.answerCapsule,
      termCode: entry.slug,
      inDefinedTermSet: { "@id": THEORY_GLOSSARY_ID },
    },
    {
      "@type": "DefinedTermSet",
      "@id": THEORY_GLOSSARY_ID,
      name: "Theory glossary",
    },
  ]);
}

export function labGraph(entries: LabEntry[]): Node[] {
  const url = absolute("/lab");
  return withIdentity([
    {
      "@type": "CollectionPage",
      "@id": `${url}#page`,
      url,
      name: "Lab",
      description: "Interactive artifacts, each with a written explanation page.",
      isPartOf: { "@id": websiteNode["@id"] },
      about: personRef,
    },
    // noindex artifacts are omitted from the graph entirely.
    ...entries
      .filter((e) => !e.noindex)
      .map((e) => ({
        "@type": ["CreativeWork", "WebApplication"],
        "@id": `${url}#${e.slug}`,
        name: e.title,
        abstract: e.answerCapsule,
        description: e.summary,
        dateModified: e.dateModified,
        author: personRef,
        applicationCategory: "DemoApplication",
      })),
  ]);
}

export function learnGraph(entries: LearnEntry[]): Node[] {
  return collectionGraph({
    path: "/learn",
    name: "Learn",
    description: "Three archived volumes, kept at their original URLs.",
    items: entries.map((e) => ({ path: e.volumeRoute, name: e.title })),
  });
}

export function aboutGraph(faq: { question: string; answer: string }[]): Node[] {
  const url = absolute("/about");
  return withIdentity([
    {
      "@type": "ProfilePage",
      "@id": `${url}#page`,
      url,
      name: "About James Brady",
      mainEntity: personRef,
      about: personRef,
      isPartOf: { "@id": websiteNode["@id"] },
    },
    {
      // FAQPage only where the route genuinely renders question-and-answer
      // blocks (§2.3). /about and /contact are the only two routes that do.
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ]);
}

export function contactGraph(faq: { question: string; answer: string }[]): Node[] {
  const url = absolute("/contact");
  return withIdentity([
    {
      "@type": "ContactPage",
      "@id": `${url}#page`,
      url,
      name: "Contact James Brady",
      mainEntity: personRef,
      isPartOf: { "@id": websiteNode["@id"] },
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ]);
}

export function nowGraph(updated: string): Node[] {
  const url = absolute("/now");
  return withIdentity([
    {
      "@type": "WebPage",
      "@id": `${url}#page`,
      url,
      name: "What I'm working on now",
      dateModified: updated,
      about: personRef,
      isPartOf: { "@id": websiteNode["@id"] },
    },
  ]);
}
