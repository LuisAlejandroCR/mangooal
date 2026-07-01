import { keccak256, toHex } from "viem";

// Matches keccak256(toHex("fifa-world-cup-2026")) in the frontend and
// keccak256(abi.encodePacked("fifa-world-cup-2026")) in SetupAfterDeploy.s.sol —
// both hash the same UTF-8 bytes, so the IDs are consistent on-chain.
export const CAMPAIGN_ID = keccak256(toHex("fifa-world-cup-2026")) as `0x${string}`;
export const CAMPAIGN_DISPLAY_NAME = "FIFA World Cup 2026";

export type MatchConfig = {
  id: string;               // URL slug  e.g. "wc26-r32-01"
  matchId: `0x${string}`;   // keccak256(toHex(id)) — must match registerMatch() on-chain
  campaignId: `0x${string}`;
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  competition: string;
  kickoffAt: number;         // Unix ms  (new Date(kickoffAt) for display)
  lockedAt: number;          // Unix ms  — predictions lock 30 min before kickoff
};

// Kickoff times confirmed via ESPN API (June 25, 2026).
// Teams marked "TBD": fill in from ESPN on June 28 after all groups resolve, then
// redeploy the frontend. No contract re-registration needed — matchIds use neutral slugs.
//
// ESPN command to get final bracket:
//   for d in 20260629 20260630 20260701 20260702 20260703; do
//     echo "=== $d ===" && \
//     curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=$d" \
//       | python3 -c "import json,sys; d=json.load(sys.stdin); \
//         [print(e['date'], \
//           e['competitions'][0]['competitors'][0]['team']['shortDisplayName'], 'vs', \
//           e['competitions'][0]['competitors'][1]['team']['shortDisplayName']) \
//         for e in d.get('events',[])]" 2>/dev/null
//   done
export const COPA_MATCHES: MatchConfig[] = [
  // ── Round of 32 — June 29, 2026 ─────────────────────────────────────────
  {
    id: "wc26-r32-01",
    matchId: keccak256(toHex("wc26-r32-01")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Brazil",
    away: "Japan",
    homeFlag: "🇧🇷",
    awayFlag: "🇯🇵",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_782_752_400_000,  // 2026-06-29 17:00 UTC — NRG Stadium, Houston TX
    lockedAt:  1_782_750_600_000,  // 2026-06-29 16:30 UTC
  },
  {
    id: "wc26-r32-02",
    matchId: keccak256(toHex("wc26-r32-02")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Germany",
    away: "Paraguay",
    homeFlag: "🇩🇪",
    awayFlag: "🇵🇾",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_782_765_000_000,  // 2026-06-29 20:30 UTC — Gillette Stadium, Foxborough MA
    lockedAt:  1_782_763_200_000,  // 2026-06-29 20:00 UTC
  },
  {
    id: "wc26-r32-03",
    matchId: keccak256(toHex("wc26-r32-03")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Netherlands",
    away: "Morocco",
    homeFlag: "🇳🇱",
    awayFlag: "🇲🇦",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_782_781_200_000,  // 2026-06-30 01:00 UTC — Estadio BBVA, Guadalupe MX
    lockedAt:  1_782_779_400_000,  // 2026-06-30 00:30 UTC
  },
  // ── Round of 32 — June 30, 2026 ─────────────────────────────────────────
  {
    id: "wc26-r32-04",
    matchId: keccak256(toHex("wc26-r32-04")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Ivory Coast",
    away: "Norway",
    homeFlag: "🇨🇮",
    awayFlag: "🇳🇴",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_782_838_800_000,  // 2026-06-30 17:00 UTC — AT&T Stadium, Arlington TX
    lockedAt:  1_782_837_000_000,  // 2026-06-30 16:30 UTC
  },
  {
    id: "wc26-r32-05",
    matchId: keccak256(toHex("wc26-r32-05")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "France",
    away: "Sweden",
    homeFlag: "🇫🇷",
    awayFlag: "🇸🇪",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_782_853_200_000,  // 2026-06-30 21:00 UTC — MetLife Stadium, East Rutherford NJ
    lockedAt:  1_782_851_400_000,  // 2026-06-30 20:30 UTC
  },
  {
    id: "wc26-r32-06",
    matchId: keccak256(toHex("wc26-r32-06")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Ecuador",
    away: "Mexico",
    homeFlag: "🇪🇨",
    awayFlag: "🇲🇽",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_782_867_600_000,  // 2026-07-01 01:00 UTC — Estadio BBVA, Guadalupe MX
    lockedAt:  1_782_865_800_000,  // 2026-07-01 00:30 UTC
  },
  // ── Round of 32 — July 1, 2026 ──────────────────────────────────────────
  {
    id: "wc26-r32-07",
    matchId: keccak256(toHex("wc26-r32-07")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "England",
    away: "Congo DR",
    homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    awayFlag: "🇨🇩",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_782_921_600_000,  // 2026-07-01 16:00 UTC — Mercedes-Benz Stadium, Atlanta GA
    lockedAt:  1_782_919_800_000,  // 2026-07-01 15:30 UTC
  },
  {
    id: "wc26-r32-08",
    matchId: keccak256(toHex("wc26-r32-08")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Belgium",
    away: "Senegal",
    homeFlag: "🇧🇪",
    awayFlag: "🇸🇳",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_782_936_000_000,  // 2026-07-01 20:00 UTC — Lumen Field, Seattle WA
    lockedAt:  1_782_934_200_000,  // 2026-07-01 19:30 UTC
  },
  // ── Round of 32 — July 2, 2026 ──────────────────────────────────────────
  {
    id: "wc26-r32-09",
    matchId: keccak256(toHex("wc26-r32-09")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Spain",
    away: "Austria",
    homeFlag: "🇪🇸",
    awayFlag: "🇦🇹",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_783_018_800_000,  // 2026-07-02 19:00 UTC — SoFi Stadium, Inglewood CA
    lockedAt:  1_783_017_000_000,  // 2026-07-02 18:30 UTC
  },
  {
    id: "wc26-r32-10",
    matchId: keccak256(toHex("wc26-r32-10")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Portugal",
    away: "Croatia",
    homeFlag: "🇵🇹",
    awayFlag: "🇭🇷",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_783_033_200_000,  // 2026-07-02 23:00 UTC — BMO Field, Toronto CA
    lockedAt:  1_783_031_400_000,  // 2026-07-02 22:30 UTC
  },
  // ── Round of 32 — July 3, 2026 ──────────────────────────────────────────
  {
    id: "wc26-r32-11",
    matchId: keccak256(toHex("wc26-r32-11")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Switzerland",
    away: "Algeria",
    homeFlag: "🇨🇭",
    awayFlag: "🇩🇿",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_783_047_600_000,  // 2026-07-03 03:00 UTC — BC Place, Vancouver CA
    lockedAt:  1_783_045_800_000,  // 2026-07-03 02:30 UTC
  },
  // ── Round of 32 — July 2, 2026 (early morning UTC) ─────────────────────────
  {
    id: "wc26-r32-12",
    matchId: keccak256(toHex("wc26-r32-12")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "USA",
    away: "Bosnia-Herz",
    homeFlag: "🇺🇸",
    awayFlag: "🇧🇦",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_782_950_400_000,  // 2026-07-02 00:00 UTC — SoFi Stadium, Inglewood CA
    lockedAt:  1_782_948_600_000,  // 2026-07-01 23:30 UTC
  },
  // ── Round of 32 — July 3, 2026 ──────────────────────────────────────────
  {
    id: "wc26-r32-13",
    matchId: keccak256(toHex("wc26-r32-13")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Australia",
    away: "Egypt",
    homeFlag: "🇦🇺",
    awayFlag: "🇪🇬",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_783_101_600_000,  // 2026-07-03 18:00 UTC — Lincoln Financial Field, Philadelphia PA
    lockedAt:  1_783_099_800_000,  // 2026-07-03 17:30 UTC
  },
  {
    id: "wc26-r32-14",
    matchId: keccak256(toHex("wc26-r32-14")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Argentina",
    away: "Cape Verde",
    homeFlag: "🇦🇷",
    awayFlag: "🇨🇻",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_783_116_000_000,  // 2026-07-03 22:00 UTC — Levi's Stadium, Santa Clara CA
    lockedAt:  1_783_114_200_000,  // 2026-07-03 21:30 UTC
  },
  // ── Round of 32 — July 4, 2026 (early morning UTC) ─────────────────────────
  {
    id: "wc26-r32-15",
    matchId: keccak256(toHex("wc26-r32-15")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Colombia",
    away: "Ghana",
    homeFlag: "🇨🇴",
    awayFlag: "🇬🇭",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_783_128_600_000,  // 2026-07-04 01:30 UTC — Estadio Akron, Guadalajara MX
    lockedAt:  1_783_126_800_000,  // 2026-07-04 01:00 UTC
  },
  // ── Round of 32 — July 4, 2026 ──────────────────────────────────────────
  {
    id: "wc26-r32-16",
    matchId: keccak256(toHex("wc26-r32-16")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Canada",
    away: "Morocco",
    homeFlag: "🇨🇦",
    awayFlag: "🇲🇦",
    competition: "FIFA World Cup 2026",
    kickoffAt: 1_783_184_400_000,  // 2026-07-04 17:00 UTC
    lockedAt:  1_783_182_600_000,  // 2026-07-04 16:30 UTC
  },
];

export function getMatchById(id: string): MatchConfig | undefined {
  return COPA_MATCHES.find((m) => m.id === id);
}

export function matchStatus(
  match: Pick<MatchConfig, "kickoffAt" | "lockedAt">
): "open" | "locked" | "live" | "finished" {
  const now = Date.now();
  if (now < match.lockedAt) return "open";
  if (now < match.kickoffAt) return "locked";
  if (now < match.kickoffAt + 2 * 3_600_000) return "live"; // 2-hour estimate
  return "finished";
}
