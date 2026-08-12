import type { TheoryEntry } from "@/lib/content/types";

export const entry: TheoryEntry = {
  collection: "theories",
  slug: "question-answer-dynamics",
  name: "Question–Answer Dynamics",
  title: "Why should a useful-looking finding get more scrutiny, not less?",
  flagLabel: "In daily use",
  what: "What an answer does to the next question. The loop, measured: most of the value in a conversation lives in how the second question moved.",
  maturity: "developed",
  paused: false,
  claim:
    "Scrutiny should scale with how convenient a finding is, because a finding that flatters the plan attracts fewer hard questions than one that contradicts it.",
  abstract:
    "Question-Answer Dynamics runs a fixed battery of questions on every finding before that finding is acted on, and refuses to end research on satisfaction rather than on a written stop reason.",
  answerCapsule:
    "Question-Answer Dynamics is a rule for interrogating every finding before that finding is acted on, and the central claim is that scrutiny should scale with how convenient a finding is. A finding that contradicts the plan already attracts hard questions; a finding that flatters the plan does not, which is exactly why it slips through unchecked. The method fixes this by running a fixed battery of questions on every finding and by refusing to stop research on satisfaction.",
  summary:
    "A fixed battery of questions run on every research finding, because convenient findings are the ones that escape scrutiny.",
  datePublished: "2026-06-02",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:new-reward"],
  history: [
    { date: "2026-06-02", state: "sketched", note: "Two founding cases, both real engagements." },
    { date: "2026-08-11", state: "developed", note: "Written as an executable skill and running on live competitive-intelligence work." },
  ],
  proof: [
    {
      label: "The method as applied — the visibility platform case study",
      artifact: "/work/visibility-platform",
      method:
        "The two founding cases are real engagements, described by industry only. The engagement record is internal; the applied method is described in the linked case study.",
      capturedAt: "2026-08-11",
      redacted: true,
    },
  ],
  og: {
    image: "/og/theories.png",
    imageAlt: "James Brady — theory: Question-Answer Dynamics",
  },
  body: `Two failure modes started this.

## Failure mode one: gift acceptance

On one competitive-intelligence engagement, for a custom software and IT staffing firm, the research turned up something convenient: a rival's site appeared to be blocked from indexing. It was banked immediately as leverage. Nobody asked the boring questions.

When those questions were finally asked, the finding reversed. When did it start? Well before the rival's repositioning, so it was not strategy. Was it intentional? No, it was a hosting default nobody managed. Was it total? No, it was keyed to specific visitors, so real search crawlers passed through. Could it be undone? Yes, with one toggle.

The convenient reading said "exploit their wall". The interrogated reading said "fix your own foundation, and treat their wall as a temporary bonus that may vanish tomorrow". Two opposite plans from one fact.

## Failure mode two: the checklist stop

An audit finished its task list, declared completion, and was asked one more question: is there more to learn here? That question turned one instance into a class, and four more gaps came out. The task list had been a fine list. It was simply not a reason to stop.

## So the method has two halves

**The battery**, run on every finding. Is it real, and was it measured or inferred? When did it start, and which way is it moving? Why would a rational actor produce this state, on purpose, by accident, or through neglect? What else is on this same surface? How does it read from four other viewpoints? What would make this misleading? Where does it lead next? Unknown is a permitted answer. Skipping the question is not permitted.

**The scheduler.** Every interrogated finding ends with either a list of next questions or a written reason for stopping, and never with neither. All open next-questions from all findings go into one queue, ranked by value divided by cost. The top one gets pulled, the answer comes back, and it re-enters the battery. That queue is the research plan. It is not written on day one; it regrows from every answer.

## When research ends

Research ends when every finding has been interrogated, every remaining question has a written stop reason, no contradictions are left unresolved, and beliefs are strong enough for the use they are being put to. It does not end when the researcher feels done.

The asymmetry is what the battery is for. A finding that contradicts the plan gets challenged automatically, because someone has an interest in challenging it. A finding that flatters the plan has no natural opponent in the room. The battery is that opponent, applied evenly, so the level of scrutiny stops depending on whether anyone in the room wanted the answer.

There is a second-order effect worth naming. Once every finding ends in either questions or a written stop reason, the shape of the research changes. A plan written on day one is a guess about what will be worth knowing; a queue that regrows from every answer is a record of what turned out to be worth knowing. The two produce very different documents at the end, and only one of them can be audited afterwards by someone who was not there.

The battery also survives being applied to itself, which is the test I care about most. Ask of the method: is it real, or inferred? It is inferred: two cases is an origin story, not evidence. Which way is it moving? Toward more use, not more proof. What would make it misleading? A team that runs the battery as a form to fill in rather than as questions to answer would produce the paperwork of scrutiny with none of the substance, and the logs would look identical.

## Where this stands

Developed and in daily use. The method is written as an executable skill and runs on live competitive-intelligence work. Its two founding cases are real engagements, described here by industry only. The stop and continue decisions are logged so they can be scored over time, but that scoring has not been published. The claim on this page is that the method is in use, not that it has been proven to produce better research.

## Artifacts

- The skill definition, installed and running in the operating environment
- Related case study: [The visibility platform](/work/visibility-platform)

[JAMES: this method is currently an internal skill file. Do you want it published as a public repository, the way problem-solving-system is? If yes, it needs a client-safe pass first, because the working copy names two client engagements.]`,
};
