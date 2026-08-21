"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageNameplate } from "./instruments";
import type { VisitDoor } from "@/lib/content/visits";
import { readVisit, type VisitState } from "@/lib/visit/storage";

export function ThisVisit({ doors }: { doors: VisitDoor[] }) {
  const [visit, setVisit] = useState<VisitState>({ doorId: null, opened: [] });

  useEffect(() => {
    const sync = () => setVisit(readVisit());
    sync();
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const door = visit.doorId
    ? doors.find((d) => d.id === visit.doorId)
    : undefined;

  return (
    <section className="visit" aria-labelledby="visit-h">
      <div className="wrap">
        <h2 className="doorway__h" id="visit-h">
          This visit
        </h2>
        {door ? (
          <VisitPlate door={door} opened={visit.opened} />
        ) : (
          <p className="visit__idle">
            Pick a door. This plate lists the pages that door is made of, and
            names the ones you actually open.
          </p>
        )}
      </div>
    </section>
  );
}

function VisitPlate({ door, opened }: { door: VisitDoor; opened: string[] }) {
  const openedSet = new Set(opened);
  const named = door.pages.filter((p) => openedSet.has(p.href));
  const done = named.length === door.pages.length && door.pages.length > 0;

  return (
    <aside className="panel panel--strip" aria-label="This visit">
      <div className="panel__head">
        <span>{door.label}</span>
        <span className="visit__tally">
          {named.length} opened · {door.pages.length} listed
        </span>
      </div>
      <ul className="visit__list">
        {door.pages.map((page) => {
          const isOpen = openedSet.has(page.href);
          return (
            <li key={page.href}>
              <Link href={page.href}>{page.title}</Link>
              <span>{isOpen ? "opened" : "not opened"}</span>
            </li>
          );
        })}
      </ul>
      {done ? (
        <p className="visit__pay">
          <Link className="btn btn--primary" href={door.inquiryHref}>
            {door.ctaLabel}{" "}
            <span className="arw" aria-hidden="true">
              →
            </span>
          </Link>
        </p>
      ) : null}
      <PageNameplate
        source="this tab’s sessionStorage"
        method="Slugs of pages this tab opened, intersected with the typed inspect set"
      />
    </aside>
  );
}
