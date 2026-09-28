import type { OfferEntry } from "@/lib/content/types";

import { entry as getFound } from "./get-found";
import { entry as buildASystem } from "./build-a-system";
import { entry as backgroundScreening } from "./background-screening";

/**
 * Order is the order a visitor meets them: on the /work-with-me hub, in
 * llms.txt, in the JSON-LD list and in the Ask pack.
 *
 * Building with Utlyze comes first since 2026-09-27, the order the home page's
 * door names them in: Utlyze, then New Reward, then Vuplicity.
 *
 * Background screening stays last, as it has been since it was added on
 * 2026-08-12: it is delivered by a different company from the two he operates,
 * and a reader meeting it first would read the whole page as a referral list.
 */
export const offers: OfferEntry[] = [buildASystem, getFound, backgroundScreening];
