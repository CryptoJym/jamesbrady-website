"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { chooseVisitDoor, recordVisitOpen } from "@/lib/visit/storage";

/**
 * Records this-tab opens of inspectable pages. Enhancement only.
 *
 * Both maps arrive as props from the server layout, derived from
 * VISIT_DOORS — the typed content source the plate itself renders. Nothing
 * here is restated by hand: an inspectable page added to VISIT_DOORS is
 * tracked on the next build with no second edit, so a page the plate lists
 * can never be one this tracker silently misses.
 */
export function VisitTracker({
  doorIdByHref,
  inspectHrefs,
}: {
  doorIdByHref: Record<string, string>;
  inspectHrefs: string[];
}) {
  const pathname = usePathname();
  useEffect(() => {
    const doorId = doorIdByHref[pathname];
    if (doorId) chooseVisitDoor(doorId);
    if (inspectHrefs.includes(pathname)) recordVisitOpen(pathname);
  }, [pathname, doorIdByHref, inspectHrefs]);
  return null;
}
