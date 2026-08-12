import type { OfferEntry } from "@/lib/content/types";

import { entry as getFound } from "./get-found";
import { entry as buildASystem } from "./build-a-system";

/**
 * Order is the order a visitor meets them, on the homepage door row and on the
 * /work-with-me hub. Getting found comes first because it is the door the
 * larger audience arrives at, not because it is the larger engagement.
 */
export const offers: OfferEntry[] = [getFound, buildASystem];
