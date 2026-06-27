export const config = {
  runtime: "edge",
};

const ALLOWED_LEAGUES = new Set([
  "fifa.world",
  "uefa.champions",
  "conmebol.america",
  "caf.nations",
  "uefa.euro",
  "concacaf.gold",
]);

declare const process: {
  env: Record<string, string | undefined>;
};

const FOOTBALL_DATA_COMPETITIONS: Record<string, string> = {
  "fifa.world": "WC",
  "uefa.champions": "CL",
  "uefa.euro": "EC",
};

// ESPN's soccer scoreboard endpoint is fast and currently powers live UX, but it is not
// formally documented. Documented backup candidates:
// - football-data.org v4: Competition / Matches resources for fixtures and scores.
// - Sportmonks Football API 3.0: broad fixtures, livescores, and World Cup guides.
// Keep backups server-side because both require provider keys / rate-limit handling.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(
  body: unknown,
  status = 200,
  cacheControl = "public, s-maxage=30"
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      "Cache-Control": cacheControl,
    },
  });
}

function isValidEspnDate(date: string) {
  return /^\d{8}$/.test(date);
}

function toIsoDate(date: string | null) {
  if (!date || !isValidEspnDate(date)) return null;
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

async function fetchFootballDataFallback(league: string, date: string | null) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const competition = FOOTBALL_DATA_COMPETITIONS[league];
  const isoDate = toIsoDate(date);

  if (!apiKey || !competition || !isoDate) return null;

  const url = new URL(`https://api.football-data.org/v4/competitions/${competition}/matches`);
  url.searchParams.set("dateFrom", isoDate);
  url.searchParams.set("dateTo", isoDate);

  const response = await fetch(url.toString(), {
    headers: { "X-Auth-Token": apiKey },
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const matches = Array.isArray(data?.matches) ? data.matches : [];

  return {
    events: matches.map((match: any) => ({
      id: String(match.id),
      date: match.utcDate,
      competitions: [
        {
          venue: { fullName: "" },
          status: {
            type: {
              name: match.status === "FINISHED" ? "STATUS_FINAL" : "STATUS_SCHEDULED",
              state: match.status === "FINISHED" ? "post" : "pre",
              completed: match.status === "FINISHED",
              shortDetail: match.status === "FINISHED" ? "FT" : "",
            },
          },
          competitors: [
            {
              homeAway: "home",
              score: match.score?.fullTime?.home,
              team: { displayName: match.homeTeam?.name, logo: match.homeTeam?.crest },
            },
            {
              homeAway: "away",
              score: match.score?.fullTime?.away,
              team: { displayName: match.awayTeam?.name, logo: match.awayTeam?.crest },
            },
          ],
        },
      ],
    })),
  };
}

function getLocale(searchParams: URLSearchParams) {
  const lang = searchParams.get("lang") === "es" ? "es" : "en";

  return {
    lang,
    region: lang === "es" ? "co" : "us",
  };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  if (request.method !== "GET") {
    return jsonResponse({ error: "method not allowed" }, 405);
  }

  const { searchParams } = new URL(request.url);

  const league = searchParams.get("league") ?? "fifa.world";
  const date = searchParams.get("date") ?? searchParams.get("dates");
  const locale = getLocale(searchParams);

  if (!ALLOWED_LEAGUES.has(league)) {
    return jsonResponse({ error: "unknown league", events: [] }, 400);
  }

  if (date && !isValidEspnDate(date)) {
    return jsonResponse(
      { error: "invalid date. Use YYYYMMDD.", events: [] },
      400
    );
  }

  const espnUrl = new URL(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`
  );

  if (date) {
    espnUrl.searchParams.set("dates", date);
  }

  espnUrl.searchParams.set("limit", "300");
  espnUrl.searchParams.set("lang", locale.lang);
  espnUrl.searchParams.set("region", locale.region);

  try {
    const upstream = await fetch(espnUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Mangooal/1.0; +https://mangooal.vercel.app)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5_000),
    });

    if (!upstream.ok) {
      const fallback = await fetchFootballDataFallback(league, date);
      if (fallback) return jsonResponse(fallback, 200, "public, s-maxage=300, stale-while-revalidate=600");
      return jsonResponse(
        { events: [] },
        200,
        "public, s-maxage=15, stale-while-revalidate=15"
      );
    }

    const body = await upstream.text();
    const parsed = JSON.parse(body);

    if (!Array.isArray(parsed?.events) || parsed.events.length === 0) {
      const fallback = await fetchFootballDataFallback(league, date);
      if (fallback) return jsonResponse(fallback, 200, "public, s-maxage=300, stale-while-revalidate=600");
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch {
    const fallback = await fetchFootballDataFallback(league, date);
    if (fallback) return jsonResponse(fallback, 200, "public, s-maxage=300, stale-while-revalidate=600");
    return jsonResponse(
      { events: [] },
      200,
      "public, s-maxage=10, stale-while-revalidate=10"
    );
  }
}
