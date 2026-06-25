import { useAccount, useReadContracts } from "wagmi";
import { MANGOAL_LEDGER_ABI } from "../contracts/mangoalLedger.abi";
import { MANGOAL_LEDGER_ADDRESS, CONTRACT_LIVE, getSaltForReveal } from "./useMangoalLedger";
import { CAMPAIGN_ID, COPA_MATCHES, type MatchConfig } from "../config/matches";

export type PickStatus = "none" | "committed" | "revealed" | "scored";

export type PickEntry = {
  match: MatchConfig;
  status: PickStatus;
  committedAt: number | null;   // Unix ms
  revealedAt: number | null;    // Unix ms
  homeScore: number | null;     // only set after reveal
  awayScore: number | null;
  points: number | null;        // set after oracle records points
  canReveal: boolean;           // committed + past lockedAt + not yet revealed
  hasSalt: boolean;             // salt exists in localStorage (can reveal from this device)
};

type PredictionResult = {
  predictionHash: `0x${string}`;
  committedAt: bigint;
  revealedAt: bigint;
  homeScore: number;
  awayScore: number;
  revealed: boolean;
};

export function useMyPicks(): { picks: PickEntry[]; isLoading: boolean } {
  const { address: addr } = useAccount();

  // addr && CONTRACT_LIVE narrows addr to `0x${string}` in the truthy branch
  const contracts = addr && CONTRACT_LIVE
    ? COPA_MATCHES.flatMap((m) => [
        {
          address: MANGOAL_LEDGER_ADDRESS,
          abi: MANGOAL_LEDGER_ABI,
          functionName: "getPrediction" as const,
          args: [addr, CAMPAIGN_ID, m.matchId] as const,
        },
        {
          address: MANGOAL_LEDGER_ADDRESS,
          abi: MANGOAL_LEDGER_ABI,
          functionName: "points" as const,
          args: [addr, CAMPAIGN_ID, m.matchId] as const,
        },
      ])
    : [];

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: !!addr && CONTRACT_LIVE },
  });

  const now = Date.now();

  const picks: PickEntry[] = COPA_MATCHES.map((match, i) => {
    const predResult = data?.[i * 2];
    const ptsResult  = data?.[i * 2 + 1];

    const pred =
      predResult?.status === "success"
        ? (predResult.result as unknown as PredictionResult)
        : null;

    const committed = pred ? pred.committedAt > 0n : false;
    const revealed  = pred?.revealed ?? false;
    const pts = ptsResult?.status === "success" ? Number(ptsResult.result) : null;

    const { salt } = addr
      ? getSaltForReveal(match.matchId, addr)
      : { salt: null };

    const pastLocked = now >= match.lockedAt;

    let status: PickStatus = "none";
    if (committed) {
      if (revealed) {
        status = pts !== null && pts > 0 ? "scored" : "revealed";
      } else {
        status = "committed";
      }
    }

    return {
      match,
      status,
      committedAt: committed ? Number(pred!.committedAt) * 1_000 : null,
      revealedAt:  revealed  ? Number(pred!.revealedAt)  * 1_000 : null,
      homeScore:   revealed  ? pred!.homeScore           : null,
      awayScore:   revealed  ? pred!.awayScore           : null,
      points:      pts,
      canReveal:   committed && !revealed && pastLocked,
      hasSalt:     !!salt,
    };
  });

  return { picks, isLoading };
}
