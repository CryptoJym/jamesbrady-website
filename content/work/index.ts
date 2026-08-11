import type { WorkEntry } from "@/lib/content/types";

import { entry as ofone } from "./ofone";
import { entry as plimsoll } from "./plimsoll";
import { entry as visibilityPlatform } from "./visibility-platform";
import { entry as eegMeditationAnalysis } from "./eeg-meditation-analysis";
import { entry as seopr1 } from "./seopr1";
import { entry as aiReadinessAssessment } from "./ai-readiness-assessment";
import { entry as ofOneFamily } from "./of-one-family";

/**
 * Display order for /work and the home card grid. The order is editorial;
 * every count over this list is derived, never typed.
 */
export const work: WorkEntry[] = [
  ofone,
  plimsoll,
  visibilityPlatform,
  eegMeditationAnalysis,
  seopr1,
  aiReadinessAssessment,
  ofOneFamily,
];
