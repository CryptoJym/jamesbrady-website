import type { TheoryEntry } from "@/lib/content/types";

import { entry as universalQuestionGeometry } from "./universal-question-geometry";
import { entry as questionAnswerDynamics } from "./question-answer-dynamics";
import { entry as architectLoop } from "./architect-loop";
import { entry as latentEmotions } from "./latent-emotions";
import { entry as thePaper } from "./the-paper";
import { entry as movementEconomy } from "./movement-economy";
import { entry as functionFirstOrchestration } from "./function-first-orchestration";

/**
 * Editorial order for /theories and the home teaser. Discovery surfaces filter
 * this list by maturity (>= sketched) — the filter is derived, never a second
 * hand-maintained list.
 */
export const theories: TheoryEntry[] = [
  universalQuestionGeometry,
  questionAnswerDynamics,
  architectLoop,
  latentEmotions,
  thePaper,
  movementEconomy,
  functionFirstOrchestration,
];
