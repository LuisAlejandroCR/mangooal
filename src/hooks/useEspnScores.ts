import { useState, useEffect } from "react";

export type EspnStatus = "scheduled" | "in_progress" | "final" | "postponed";

export type EspnMatch = {
  id: string;
  date: string;
  home: string;
  homeAbbr: string;
  away: string;
  awayAbbr: string;
  homeScore: number | null;
  awayScore: number | null;
  status: EspnStatus;
  clock: string;    // "45'", "HT", "FT", "19:00" etc.
  homeRecord: string | null;  // "4-1-1" (W-D-L)
  awayRecord: string | null;
};

function parseStatus(comp: any): EspnStatus {
  const name = comp?.status?.type?.name ?? "";
  if (name === "STATUS_FINAL") return "final";
  if (name === "STATUS_IN_PROGRESS" || name === "STATUS_HALFTIME") return "in_progress";
  if (name === "STATUS_POSTPONED" || name === "STATUS_CANCELED") return "postponed";
  return "scheduled";
}

function parseClock(comp: any): string {
  const type = comp?.status?.type?.name ?? "";
  if (type === "STATUS_HALFTIME") return "HT";
  if (type === "STATUS_FINAL") return "FT";
  const clock = comp?.status?.displayClock;
  if (clock && clock !== "0:00") return clock;
  return comp?.status?.type?.shortDetail ?? "";
}

function parseRecord(competitor: any): string | null {
  const records: any[] = competitor?.records ?? [];
  const overall = records.find((r: any) => r.type === "total" || r.type === "overall");
  return overall?.summary ?? null;
}

function normalizeEvents(events: any[]): EspnMatch[] {
  return events.map((event: any) => {
    const comp = event.competitions?.[0];
    const competitors: any[] = comp?.competitors ?? [];
    const home = competitors.find((c: any) => c.homeAway === "home") ?? competitors[0];
    const away = competitors.find((c: any) => c.homeAway === "away") ?? competitors[1];
    return {
      id: event.id,
      date: event.date,
      home: home?.team?.displayName ?? "?",
      homeAbbr: home?.team?.abbreviation ?? "?",
      away: away?.team?.displayName ?? "?",
      awayAbbr: away?.team?.abbreviation ?? "?",
      homeScore: home?.score != null ? Number(home.score) : null,
      awayScore: away?.score != null ? Number(away.score) : null,
      status: parseStatus(comp),
      clock: parseClock(comp),
      homeRecord: parseRecord(home),
      awayRecord: parseRecord(away),
    };
  });
}

export function useEspnScores(
  league: string,
  date?: string
): { matches: EspnMatch[]; isLoading: boolean } {
  const [matches, setMatches] = useState<EspnMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams({ league });
    if (date) params.set("date", date);

    fetch(`/api/scores?${params}`)
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((data) => {
        if (!cancelled) setMatches(normalizeEvents(data.events ?? []));
      })
      .catch(() => { if (!cancelled) setMatches([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [league, date]);

  return { matches, isLoading };
}

/** Find the ESPN entry matching two team name fragments (case-insensitive). */
export function findMatch(matches: EspnMatch[], homeHint: string, awayHint: string): EspnMatch | null {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const nh = normalize(homeHint.split(" ")[0]);
  const na = normalize(awayHint.split(" ")[0]);
  return (
    matches.find((m) => {
      const mh = normalize(m.home);
      const ma = normalize(m.away);
      return (mh.startsWith(nh) || mh.includes(nh)) && (ma.startsWith(na) || ma.includes(na));
    }) ?? null
  );
}
