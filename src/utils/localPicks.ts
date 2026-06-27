export type LocalPick = {
  id: string;
  wallet?: string;
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

function normalizeWallet(wallet?: string | null) {
  return wallet?.toLowerCase() ?? null;
}

function readAllLocalPicks(): LocalPick[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_PICKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalPick[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLocalPicks(walletAddress?: string | null): LocalPick[] {
  const wallet = normalizeWallet(walletAddress);
  return readAllLocalPicks()
    .filter((item) => !wallet || normalizeWallet(item.wallet) === wallet)
    .sort((a, b) => b.savedAt - a.savedAt);
}

export function saveLocalPick(entry: LocalPick, walletAddress?: string | null) {
  if (typeof window === "undefined") return;

  const wallet = normalizeWallet(walletAddress ?? entry.wallet);
  const storedEntry = wallet ? { ...entry, wallet } : entry;
  const existing = readAllLocalPicks().filter((item) => {
    const sameWallet = normalizeWallet(item.wallet) === wallet;
    return !(sameWallet && item.id === entry.id);
  });

  window.localStorage.setItem(
    LOCAL_PICKS_KEY,
    JSON.stringify([storedEntry, ...existing].slice(0, 50)),
  );
  window.dispatchEvent(new Event("mangooal:picks"));
}