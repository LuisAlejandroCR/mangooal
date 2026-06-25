import { keccak256, toHex } from "viem";

// Matches keccak256(toHex("copa-america-2026")) in the frontend and
// keccak256(abi.encodePacked("copa-america-2026")) in SetupAfterDeploy.s.sol —
// both hash the same UTF-8 bytes, so the IDs are consistent on-chain.
export const CAMPAIGN_ID = keccak256(toHex("copa-america-2026")) as `0x${string}`;

export type MatchConfig = {
  id: string;               // URL slug  e.g. "cop26-col-bra"
  matchId: `0x${string}`;   // keccak256(toHex(id)) — must match registerMatch() on-chain
  campaignId: `0x${string}`;
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  competition: string;
  kickoffAt: number;         // Unix ms  (new Date(kickoffAt) for display)
  lockedAt: number;          // Unix ms  — predictions lock before kickoff
};

// Operator: update these timestamps to the real Copa América 2026 schedule,
// then run RegisterMatches.s.sol before each match window opens.
export const COPA_MATCHES: MatchConfig[] = [
  {
    id: "cop26-col-bra",
    matchId: keccak256(toHex("cop26-col-bra")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Colombia",
    away: "Brazil",
    homeFlag: "🇨🇴",
    awayFlag: "🇧🇷",
    competition: "Copa América 2026",
    kickoffAt: 1_782_399_600_000,  // 2026-06-25 15:00 UTC — UPDATE to real schedule
    lockedAt:  1_782_397_800_000,  // 2026-06-25 14:30 UTC
  },
  {
    id: "cop26-arg-mex",
    matchId: keccak256(toHex("cop26-arg-mex")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Argentina",
    away: "Mexico",
    homeFlag: "🇦🇷",
    awayFlag: "🇲🇽",
    competition: "Copa América 2026",
    kickoffAt: 1_782_496_800_000,  // 2026-06-26 18:00 UTC — UPDATE
    lockedAt:  1_782_495_000_000,  // 2026-06-26 17:30 UTC
  },
  {
    id: "cop26-uru-usa",
    matchId: keccak256(toHex("cop26-uru-usa")) as `0x${string}`,
    campaignId: CAMPAIGN_ID,
    home: "Uruguay",
    away: "USA",
    homeFlag: "🇺🇾",
    awayFlag: "🇺🇸",
    competition: "Copa América 2026",
    kickoffAt: 1_782_594_000_000,  // 2026-06-27 21:00 UTC — UPDATE
    lockedAt:  1_782_592_200_000,  // 2026-06-27 20:30 UTC
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
