import { useState, useEffect, useCallback } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { parseAbiItem } from "viem";
import {
  MANGOAL_LEDGER_ADDRESS,
  CONTRACT_LIVE,
  MANGOAL_DEPLOY_BLOCK,
} from "./useMangoalLedger";

export type RankEntry = {
  wallet: string;      // lowercase address
  totalPoints: number;
  rank: number;
  isMe: boolean;
};

const POINTS_EVENT = parseAbiItem(
  "event PointsRecorded(address indexed wallet, bytes32 indexed campaignId, bytes32 indexed matchId, uint32 pts)"
);

const CHUNK = 49_999n;
const TOP_N = 50;

export function useOnChainRanking(campaignId: `0x${string}`): {
  entries: RankEntry[];
  myEntry: RankEntry | null;
  isLoading: boolean;
} {
  const publicClient = usePublicClient();
  const { address: connectedAddr } = useAccount();

  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [myEntry, setMyEntry] = useState<RankEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!publicClient || !CONTRACT_LIVE) return;

    setIsLoading(true);
    try {
      const toBlock = await publicClient.getBlockNumber();
      const fromBlock =
        MANGOAL_DEPLOY_BLOCK > 0n
          ? MANGOAL_DEPLOY_BLOCK
          : toBlock > 50_000n
          ? toBlock - 50_000n
          : 0n;

      // Accumulate per-wallet total points across all chunks
      const totals = new Map<string, number>();

      for (let from = fromBlock; from <= toBlock; from += CHUNK + 1n) {
        const to = from + CHUNK > toBlock ? toBlock : from + CHUNK;
        const logs = await publicClient.getLogs({
          address: MANGOAL_LEDGER_ADDRESS,
          event: POINTS_EVENT,
          args: { campaignId },
          fromBlock: from,
          toBlock: to,
        });

        for (const l of logs) {
          const w = l.args.wallet?.toLowerCase();
          const pts = l.args.pts !== undefined ? Number(l.args.pts) : 0;
          if (w) totals.set(w, (totals.get(w) ?? 0) + pts);
        }
      }

      // Sort descending, assign rank (ties share rank)
      const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
      const me = connectedAddr?.toLowerCase();

      let rank = 1;
      const built: RankEntry[] = [];
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i][1] < sorted[i - 1][1]) rank = i + 1;
        built.push({
          wallet: sorted[i][0],
          totalPoints: sorted[i][1],
          rank,
          isMe: sorted[i][0] === me,
        });
      }

      setEntries(built.slice(0, TOP_N));

      // Connected wallet may be outside top 50
      const found = built.find((e) => e.isMe) ?? null;
      setMyEntry(found && found.rank > TOP_N ? found : null);
    } catch {
      // silently fail — stats unavailable is non-fatal
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, campaignId, connectedAddr]);

  useEffect(() => {
    void fetch();
    const id = setInterval(() => void fetch(), 120_000);
    return () => clearInterval(id);
  }, [fetch]);

  return { entries, myEntry, isLoading };
}
