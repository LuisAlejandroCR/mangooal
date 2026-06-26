/**
 * Vercel Edge Function — ESPN scoreboard proxy.
 *
 * Resolves CORS: ESPN's API has no CORS headers, so the frontend cannot call it
 * directly from the browser. This edge function proxies the request server-side.
 *
 * Usage:
 *   GET /api/scores?league=fifa.world&date=20260629
 *
 * Supported league slugs (ESPN):
 *   fifa.world        — FIFA World Cup 2026
 *   uefa.champions    — UEFA Champions League
 *   conmebol.america  — Copa América
 *   caf.nations       — Africa Cup of Nations
 *
 * If date is omitted, ESPN returns today's matches.
 * Cache: 60 s on the CDN, 30 s stale-while-revalidate.
 */
export const config = { runtime: "edge" };

const ALLOWED_LEAGUES = new Set([
  "fifa.world",
  "uefa.champions",
  "conmebol.america",
  "caf.nations",
  "uefa.euro",
  "concacaf.gold",
]);

export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league") ?? "fifa.world";
  const date = searchParams.get("date"); // YYYYMMDD

  if (!ALLOWED_LEAGUES.has(league)) {
    return new Response(JSON.stringify({ error: "unknown league" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const espnUrl = new URL(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`
  );
  if (date) espnUrl.searchParams.set("dates", date);

  try {
    const upstream = await fetch(espnUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Mangooal/1.0; +https://mangooal.vercel.app)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5_000),
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ events: [] }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=30",
        },
      });
    }

    const body = await upstream.text();
    return new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response(JSON.stringify({ events: [] }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=10",
      },
    });
  }
}
