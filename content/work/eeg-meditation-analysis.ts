import type { WorkEntry } from "@/lib/content/types";

export const entry: WorkEntry = {
  collection: "work",
  slug: "eeg-meditation-analysis",
  title: "EEG meditation toolkit",
  kicker: "Signals, not vibes",
  categories: ["open-source", "experiments"],
  answerCapsule:
    "The EEG meditation toolkit is Python tooling that turns a raw consumer-headset recording into a readable account of a meditation session. Filtering removes artifacts, power is measured in each brainwave band, and a depth score from 0 to 100 rolls up with one of four labels: alert, light, moderate or deep. A synthetic data generator ships with it, so the whole pipeline runs without a headset and without handing over a personal recording.",
  summary:
    "Python tooling that filters an EEG recording, measures band power, and scores meditation depth — runnable without hardware.",
  datePublished: "2026-08-11",
  dateModified: "2026-08-11",
  entities: ["person:james"],
  stack: ["Python 3.8+", "NumPy", "SciPy", "Matplotlib"],
  timeframe: { start: "2025-09", end: "2025-11" },
  anonymized: false,
  footUnit: "Python · 3 stars",
  repo: {
    owner: "CryptoJym",
    name: "eeg-meditation-analysis",
    public: true,
    stars: 3,
    license: "MIT",
    snapshotAt: "2026-08-11",
    lastPush: "2025-11-11",
  },
  deltas: [],
  proofMetric: {
    value: 3,
    pad: true,
    unit: "stars from outside this project",
    method:
      "Read from the GitHub API on 2026-08-11. Every outside star counted anywhere on this site is on this one repo.",
    source: "github.com/CryptoJym",
    lastActive: "2025-11-11",
    goLabel: "View on GitHub",
    goHref: "https://github.com/CryptoJym/eeg-meditation-analysis",
    state: "dormant",
  },
  proof: [
    {
      label: "Repository — CryptoJym/eeg-meditation-analysis",
      url: "https://github.com/CryptoJym/eeg-meditation-analysis",
      method: "GitHub API read, public repo. MIT licensed. Python. 3 stars. Last push 2025-11-11.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Runnable end to end without hardware",
      url: "https://github.com/CryptoJym/eeg-meditation-analysis",
      method:
        "Read from the repo: `python generate_sample_eeg.py` then `python eeg_analysis.py` runs the whole pipeline on synthetic data.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/work.png",
    imageAlt: "James Brady — case study: an EEG meditation analysis toolkit",
  },
  body: `## The problem

People who meditate have almost no way to tell whether a session went deep or shallow, other than how it felt. Consumer EEG headsets record the signal, but the raw signal is noise to a human eye. The gap is not the sensor. It is the analysis in between.

## What I built

A Python toolkit that takes an EEG recording and reports what happened during a meditation session. It filters the signal, removes artifacts, measures power in each brainwave band, and scores meditation depth from 0 to 100. It can also walk a whole session in sliding windows, so you can see where attention drifted and where it settled.

It ships a synthetic data generator, so anyone can run the whole pipeline without owning a headset or handing over their own recordings.

## How it works in plain words

Brain activity gets sorted into frequency bands. Delta is the slowest, from 0.5 to 4 cycles per second. Theta runs from 4 to 8. Alpha, Beta, and Gamma go up from there. Deep meditative states show more of the slow bands and less of the fast ones.

The toolkit measures how much power sits in each band, then computes ratios between them. A higher Delta to Theta ratio points to deeper states. The Theta to Alpha ratio tracks the move from alert to meditative. It also reports spectral entropy, which is a measure of how disordered the signal is, and the dominant frequency.

Those numbers roll into one score and one of four labels: alert, light, moderate, or deep. It draws the whole thing as a multi-panel chart with a spectrogram, the power spectrum, and the band distribution.

## Honest limits

This is a signal-processing toolkit, not a clinical instrument and not a validated study. The four state labels are thresholds chosen from published band conventions, not outcomes measured against a control group. No accuracy claim is made here.

Status: dormant. The last commit was 2025-11-11, about nine months before this page was drafted.

[JAMES: label this "archived" or "dormant, open to revival"? Also: was this run on your own recordings from a specific headset, or on synthetic data only? If real recordings exist, name the device.]

## Stack

Python 3.8 or newer. NumPy and SciPy for filtering and power spectral density. Matplotlib for the multi-panel plots.`,
};
