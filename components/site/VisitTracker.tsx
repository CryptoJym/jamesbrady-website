"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { chooseVisitDoor, recordVisitOpen } from "@/lib/visit/storage";

const DOOR_HREFS: Record<string, string> = {
  "/work-with-me/get-found": "get-found",
  "/work-with-me/build-a-system": "build-a-system",
  "/work-with-me/background-screening": "background-screening",
  "/work": "read-the-code",
};

const INSPECT_HREFS = new Set([
  "/work-with-me/get-found",
  "/work-with-me/build-a-system",
  "/work-with-me/background-screening",
  "/work",
  "/work/visibility-platform",
  "/work/ofone",
  "/work/plimsoll",
  "/work/eeg-meditation-analysis",
  "/work/seopr1",
  "/work/ai-readiness-assessment",
  "/work/of-one-family",
]);

/** Records this-tab opens of inspectable pages. Enhancement only. */
export function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const doorId = DOOR_HREFS[pathname];
    if (doorId) chooseVisitDoor(doorId);
    if (INSPECT_HREFS.has(pathname)) recordVisitOpen(pathname);
  }, [pathname]);
  return null;
}
