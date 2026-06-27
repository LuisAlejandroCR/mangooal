export type LocalPick = {
  id: string;
  competition: string;
  home: string;
  away: string;
  homeMark?: string | null;
  awayMark?: string | null;
  homeScore: number;
  awayScore: number;
  kickoffAt: number;
  lockedAt: number;
  savedAt: number;
  txHash?: `0x${string}`;
  source: "preview" | "celo";
};

const LOCAL_PICKS_KEY = "mangooal:local-picks";

export function getLocalPicks(): LocalPick[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_PICKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalPick[];
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => b.savedAt - a.savedAt)
      : [];
  } catch {
    return [];
  }
}

export function saveLocalPick(entry: LocalPick) {
  if (typeof window === "undefined") return;

  const existing = getLocalPicks().filter((item) => item.id !== entry.id);
  window.localStorage.setItem(
    LOCAL_PICKS_KEY,
    JSON.stringify([entry, ...existing].slice(0, 50)),
  );
}
