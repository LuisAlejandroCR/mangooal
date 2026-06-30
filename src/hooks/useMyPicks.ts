import { useAccount, useReadContracts } from "wagmi";
import { MANGOAL_LEDGER_ABI } from "../contracts/mangoalLedger.abi";
import { MANGOAL_LEDGER_ADDRESS, CONTRACT_LIVE, getSaltForReveal } from "./useMangoalLedger";
import { CAMPAIGN_ID, COPA_MATCHES, type MatchConfig } from "../config/matches";

export type PickStatus = "none" | "committed" | "revealed" | "scored";

export type PickEntry = {
  match: MatchConfig;
  status: PickStatus;
  committedAt: number | null;
  revealedAt: number | null;
  homeScore: number | null;
  awayScore: number | null;
  points: number | null;
  canReveal: boolean;
  hasSalt: boolean;
};

type PredictionResult = {
  predictionHash: `0x${string}`;
  committedAt: bigint;
  revealedAt: bigint;
  homeScore: number;
  awayScore: number;
  revealed: boolean;
};

type PublicPickResult = {
  homeScore: number;
  awayScore: number;
  status: number;
  points: number;
  submittedAt: bigint;
  updatedAt: bigint;
  version: number;
  outcomeCode: number;
  scored: boolean;
};

const PICK_NONE = 0;
const PICK_SCORED = 3;
const PICK_VOID = 4;

function hasPortablePick(pick: PublicPickResult | null) {
  return Boolean(
    pick && pick.submittedAt > 0n && pick.status !== PICK_NONE && pick.status !== PICK_VOID,
  );
}

export function useMyPicks(): { picks: PickEntry[]; isLoading: boolean } {
  const { address: addr } = useAccount();

  const contracts = addr && CONTRACT_LIVE
    ? COPA_MATCHES.flatMap((match) => [
        {
          address: MANGOAL_LEDGER_ADDRESS,
          abi: MANGOAL_LEDGER_ABI,
          functionName: "getPick" as const,
          args: [addr, CAMPAIGN_ID, match.matchId] as const,
        },
        {
          address: MANGOAL_LEDGER_ADDRESS,
          abi: MANGOAL_LEDGER_ABI,
          functionName: "getPrediction" as const,
          args: [addr, CAMPAIGN_ID, match.matchId] as const,
        },
        {
          address: MANGOAL_LEDGER_ADDRESS,
          abi: MANGOAL_LEDGER_ABI,
          functionName: "points" as const,
          args: [addr, CAMPAIGN_ID, match.matchId] as const,
        },
      ])
    : [];

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: !!addr && CONTRACT_LIVE },
  });

  const now = Date.now();

  const picks: PickEntry[] = COPA_MATCHES.map((match, i) => {
    const pickResult = data?.[i * 3];
    const predResult = data?.[i * 3 + 1];
    const ptsResult = data?.[i * 3 + 2];

    const publicPick =
      pickResult?.status === "success"
        ? (pickResult.result as unknown as PublicPickResult)
        : null;

    if (hasPortablePick(publicPick) && publicPick) {
      return {
        match,
        status: publicPick.scored || publicPick.status === PICK_SCORED ? "scored" : "committed",
        committedAt: Number(publicPick.submittedAt) * 1_000,
        revealedAt: Number(publicPick.updatedAt) * 1_000,
        homeScore: publicPick.homeScore,
        awayScore: publicPick.awayScore,
        points: publicPick.points,
        canReveal: false,
        hasSalt: false,
      };
    }

    const pred =
      predResult?.status === "success"
        ? (predResult.result as unknown as PredictionResult)
        : null;

    const committed = pred ? pred.committedAt > 0n : false;
    const revealed = pred?.revealed ?? false;
    const pts = ptsResult?.status === "success" ? Number(ptsResult.result) : null;
    const { salt } = addr ? getSaltForReveal(match.matchId, addr) : { salt: null };
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
      revealedAt: revealed ? Number(pred!.revealedAt) * 1_000 : null,
      homeScore: revealed ? pred!.homeScore : null,
      awayScore: revealed ? pred!.awayScore : null,
      points: pts,
      canReveal: committed && !revealed && pastLocked,
      hasSalt: !!salt,
    };
  });

  return { picks, isLoading };
}
