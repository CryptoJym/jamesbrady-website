export const VISIT_STORAGE_KEY = "jb-this-visit";

export type VisitState = {
  doorId: string | null;
  opened: string[];
};

export function emptyVisit(): VisitState {
  return { doorId: null, opened: [] };
}

export function readVisit(): VisitState {
  if (typeof window === "undefined") return emptyVisit();
  try {
    const raw = window.sessionStorage.getItem(VISIT_STORAGE_KEY);
    if (!raw) return emptyVisit();
    const parsed = JSON.parse(raw) as VisitState;
    return {
      doorId: typeof parsed.doorId === "string" ? parsed.doorId : null,
      opened: Array.isArray(parsed.opened)
        ? parsed.opened.filter((x): x is string => typeof x === "string")
        : [],
    };
  } catch {
    return emptyVisit();
  }
}

export function writeVisit(next: VisitState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(next));
}

export function chooseVisitDoor(doorId: string) {
  const current = readVisit();
  writeVisit({ ...current, doorId });
}

export function recordVisitOpen(href: string) {
  const path = href.split("?")[0] ?? href;
  if (!path.startsWith("/")) return;
  const current = readVisit();
  if (current.opened.includes(path)) return;
  writeVisit({ ...current, opened: [...current.opened, path] });
}
