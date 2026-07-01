import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export type TeamIntel = {
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  games: number;
  /** Weighted 0–1 form score, most-recent match weighted highest */
  formScore: number;
  source: "thesportsdb" | "football-data";
};

export type MatchIntel = {
  home: TeamIntel | null;
  away: TeamIntel | null;
  isLoading: boolean;
};

// ── Form scoring (most recent first, weights sum to 1.0) ──────────────────────

const FORM_WEIGHTS = [0.30, 0.25, 0.20, 0.15, 0.10];

function scoreOutcomes(outcomes: Array<"W" | "D" | "L">): number {
  let s = 0;
  for (let i = 0; i < Math.min(outcomes.length, 5); i++) {
    s += (outcomes[i] === "W" ? 1.0 : outcomes[i] === "D" ? 0.5 : 0.0) * (FORM_WEIGHTS[i] ?? 0.10);
  }
  return s; // 0–1
}

// ── Name normalisation ────────────────────────────────────────────────────────

const TSDB_NAMES: Record<string, string> = {
  "usa": "United States",
  "congo dr": "DR Congo",
  "bosnia-herz": "Bosnia and Herzegovina",
  "ivory coast": "Ivory Coast",
  "côte d'ivoire": "Ivory Coast",
};

const FD_NAMES: Record<string, string> = {
  "usa": "United States",
  "congo dr": "Congo DR",
  "bosnia-herz": "Bosnia and Herzegovina",
  "ivory coast": "Ivory Coast",
  "cape verde": "Cabo Verde",
};

const norm = (map: Record<string, string>, raw: string) =>
  map[raw.toLowerCase().trim()] ?? raw;

// ── Session-level cache (reset on page reload) ────────────────────────────────

const _cache = new Map<string, TeamIntel | null>();

// ── Primary: TheSportsDB (no API key, CORS-open) ──────────────────────────────

async function fetchTSDB(rawName: string, signal: AbortSignal): Promise<TeamIntel | null> {
  const name = norm(TSDB_NAMES, rawName);
  const key = `tsdb:${name}`;
  if (_cache.has(key)) return _cache.get(key) ?? null;

  const base = "https://www.thesportsdb.com/api/v1/json/3";

  // 1 — find team ID
  const sr = await fetch(`${base}/searchteams.php?t=${encodeURIComponent(name)}`, { signal });
  if (!sr.ok) { _cache.set(key, null); return null; }
  const { teams } = await sr.json() as {
    teams: Array<{ idTeam: string; strSport: string }> | null;
  };
  const team = teams?.find(t => t.strSport === "Soccer");
  if (!team) { _cache.set(key, null); return null; }

  // 2 — last 5 events
  const er = await fetch(`${base}/eventslast.php?id=${team.idTeam}`, { signal });
  if (!er.ok) { _cache.set(key, null); return null; }
  const { results } = await er.json() as {
    results: Array<{
      idHomeTeam: string; idAwayTeam: string;
      intHomeScore: string | null; intAwayScore: string | null; strSport: string;
    }> | null;
  };

  const events = (results ?? []).filter(
    r => r.strSport === "Soccer" && r.intHomeScore != null && r.intAwayScore != null
  );
  if (!events.length) { _cache.set(key, null); return null; }

  let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
  const outcomes: Array<"W" | "D" | "L"> = [];
  for (const ev of events) {
    const home = ev.idHomeTeam === team.idTeam;
    const scored   = home ? Number(ev.intHomeScore) : Number(ev.intAwayScore);
    const conceded = home ? Number(ev.intAwayScore) : Number(ev.intHomeScore);
    gf += scored; ga += conceded;
    if (scored > conceded)       { wins++;   outcomes.push("W"); }
    else if (scored === conceded) { draws++;  outcomes.push("D"); }
    else                          { losses++; outcomes.push("L"); }
  }

  const intel: TeamIntel = {
    wins, draws, losses,
    goalsFor: gf, goalsAgainst: ga,
    games: wins + draws + losses,
    formScore: scoreOutcomes(outcomes),
    source: "thesportsdb",
  };
  _cache.set(key, intel);
  return intel;
}

// ── Backup: football-data.org (requires VITE_FOOTBALL_DATA_KEY) ──────────────

async function fetchFD(rawName: string, apiKey: string, signal: AbortSignal): Promise<TeamIntel | null> {
  const name = norm(FD_NAMES, rawName);
  const key = `fd:${name}`;
  if (_cache.has(key)) return _cache.get(key) ?? null;

  const base = "https://api.football-data.org/v4";
  const headers = { "X-Auth-Token": apiKey };

  // 1 — search team
  const sr = await fetch(`${base}/teams?search=${encodeURIComponent(name)}&limit=5`, { headers, signal });
  if (!sr.ok) { _cache.set(key, null); return null; }
  const { teams } = await sr.json() as { teams: Array<{ id: number }> | null };
  if (!teams?.length) { _cache.set(key, null); return null; }
  const teamId = teams[0].id;

  // 2 — last 5 finished matches
  const mr = await fetch(
    `${base}/teams/${teamId}/matches?status=FINISHED&limit=5`,
    { headers, signal }
  );
  if (!mr.ok) { _cache.set(key, null); return null; }
  const { matches } = await mr.json() as {
    matches: Array<{
      homeTeam: { id: number }; awayTeam: { id: number };
      score: { fullTime: { home: number | null; away: number | null } };
    }> | null;
  };
  if (!matches?.length) { _cache.set(key, null); return null; }

  let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
  const outcomes: Array<"W" | "D" | "L"> = [];
  for (const m of matches) {
    const home = m.homeTeam.id === teamId;
    const scored   = (home ? m.score.fullTime.home  : m.score.fullTime.away)  ?? 0;
    const conceded = (home ? m.score.fullTime.away  : m.score.fullTime.home) ?? 0;
    gf += scored; ga += conceded;
    if (scored > conceded)       { wins++;   outcomes.push("W"); }
    else if (scored === conceded) { draws++;  outcomes.push("D"); }
    else                          { losses++; outcomes.push("L"); }
  }

  const intel: TeamIntel = {
    wins, draws, losses,
    goalsFor: gf, goalsAgainst: ga,
    games: wins + draws + losses,
    formScore: scoreOutcomes(outcomes),
    source: "football-data",
  };
  _cache.set(key, intel);
  return intel;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMatchIntel(homeName: string, awayName: string): MatchIntel {
  const [state, setState] = useState<MatchIntel>({ home: null, away: null, isLoading: false });
  const fdKey = (import.meta.env.VITE_FOOTBALL_DATA_KEY as string | undefined) ?? "";

  useEffect(() => {
    if (!homeName || !awayName) return;
    const ac = new AbortController();
    setState(s => ({ ...s, isLoading: true }));

    (async () => {
      // Primary: fetch both teams from TheSportsDB in parallel
      const [rawHome, rawAway] = await Promise.all([
        fetchTSDB(homeName, ac.signal).catch(() => null),
        fetchTSDB(awayName, ac.signal).catch(() => null),
      ]);

      let home = rawHome;
      let away = rawAway;

      // Backup: football-data.org for any team TSDB missed
      if (fdKey && (!home || !away)) {
        const [fdHome, fdAway] = await Promise.all([
          !home ? fetchFD(homeName, fdKey, ac.signal).catch(() => null) : Promise.resolve(null),
          !away ? fetchFD(awayName, fdKey, ac.signal).catch(() => null) : Promise.resolve(null),
        ]);
        if (fdHome) home = fdHome;
        if (fdAway) away = fdAway;
      }

      if (!ac.signal.aborted) setState({ home, away, isLoading: false });
    })();

    return () => ac.abort();
  }, [homeName, awayName, fdKey]);

  return state;
}
