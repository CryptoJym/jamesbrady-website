import { offers, work } from "./index";

export type VisitPage = {
  href: string;
  title: string;
};

export type VisitDoor = {
  id: string;
  label: string;
  who: string;
  detail: string;
  href: string;
  inquiryHref: string;
  ctaLabel: string;
  pages: VisitPage[];
};

function workPage(slug: string): VisitPage {
  const entry = work.find((w) => w.slug === slug);
  if (!entry) throw new Error(`visit set missing work slug ${slug}`);
  return { href: `/work/${entry.slug}`, title: entry.title };
}

function offerDoor(
  slug: string,
  extra: VisitPage[],
  who: string,
): Pick<
  VisitDoor,
  "href" | "inquiryHref" | "ctaLabel" | "who" | "detail" | "pages"
> {
  const entry = offers.find((o) => o.slug === slug);
  if (!entry) throw new Error(`visit set missing offer slug ${slug}`);
  return {
    href: `/work-with-me/${entry.slug}`,
    inquiryHref: `/contact?inquiry=${entry.inquiryType}`,
    ctaLabel: entry.ctaLabel,
    who,
    detail: `${entry.summary} Delivered by ${entry.deliveredBy.name}.`,
    pages: [{ href: `/work-with-me/${entry.slug}`, title: entry.title }, ...extra],
  };
}

const getFound = offerDoor(
  "get-found",
  [workPage("visibility-platform")],
  "For an owner whose customers cannot find them",
);
const build = offerDoor(
  "build-a-system",
  [workPage("ofone"), workPage("plimsoll")],
  "For a founder or an operator with a build to run",
);
const screen = offerDoor(
  "background-screening",
  [],
  "For an employer about to trust a stranger",
);

const publicWork = work.filter((w) => w.repo?.public).map((w) => ({
  href: `/work/${w.slug}`,
  title: w.title,
}));

export const VISIT_DOORS: VisitDoor[] = [
  {
    id: "get-found",
    label: "Get my business found",
    ...getFound,
  },
  {
    id: "build-a-system",
    label: "Build me a system",
    ...build,
  },
  {
    id: "background-screening",
    label: "Screen your hires",
    ...screen,
  },
  {
    id: "read-the-code",
    label: "Read the code",
    who: "For a builder who would rather check than be told",
    href: "/work",
    inquiryHref: "/work",
    ctaLabel: "Open the work shelf",
    detail: `${work.length} systems, ${publicWork.length} of them in public repositories you can open from the card.`,
    pages: [{ href: "/work", title: "Work index" }, ...publicWork],
  },
];

export function visitDoorById(id: string) {
  return VISIT_DOORS.find((d) => d.id === id);
}

export function visitDoorByHref(href: string) {
  return VISIT_DOORS.find((d) => d.href === href);
}

export const VISIT_HREF_SET = new Set(
  VISIT_DOORS.flatMap((d) => d.pages.map((p) => p.href)),
);
