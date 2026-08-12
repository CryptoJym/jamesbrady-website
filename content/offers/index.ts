import type { OfferEntry } from "@/lib/content/types";

import { entry as getFound } from "./get-found";
import { entry as buildASystem } from "./build-a-system";
import { entry as backgroundScreening } from "./background-screening";

/**
 * Order is the order a visitor meets them, on the homepage door row and on the
 * /work-with-me hub. Getting found comes first because it is the door the
 * larger audience arrives at, not because it is the larger engagement.
 *
 * Background screening joins last, added 2026-08-12 under the owner ruling
 * that names Vuplicity. It sits after the two engagements James delivers
 * himself because the delivering company is a different one, and a reader
 * meeting it first would read the whole page as a referral list.
 */
export const offers: OfferEntry[] = [getFound, buildASystem, backgroundScreening];
