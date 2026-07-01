import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { MANGOAL_LEDGER_ADDRESS, CONTRACT_LIVE, MANGOAL_DEPLOY_BLOCK } from "./useMangoalLedger";

const PICK_SUBMITTED = parseAbiItem(
  "event PickSubmitted(address indexed wallet, bytes32 indexed campaignId, bytes32 indexed matchId, uint8 homeScore, uint8 awayScore, uint32 version, uint64 submittedAt)"
);

const PICK_UPDATED = parseAbiItem(
  "event PickUpdated(address indexed wallet, bytes32 indexed campaignId, bytes32 indexed matchId, uint8 homeScore, uint8 awayScore, uint32 version, uint64 updatedAt)"
);

const CHUNK = 49_999n;
// Fallback when VITE_DEPLOY_BLOCK is not set — deploy block confirmed July 2026.
const DEPLOY_FALLBACK = 70_545_072n;

export type CommunityDistribution = {
  home: number;  // % 0-100
  draw: number;
  away: number;
  total: number; // unique pickers
};

export function useCommunityPicks(
  campaignId: `0x${string}`,
  matchId: `0x${string}`,
  enabled: boolean
): { distribution: CommunityDistribution | null; isLoading: boolean } {
  const publicClient = usePublicClient();
  const [distribution, setDistribution] = useState<CommunityDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!publicClient || !CONTRACT_LIVE || !enabled) return;

    setIsLoading(true);
    try {
      const toBlock = await publicClient.getBlockNumber();
      const fromBlock = MANGOAL_DEPLOY_BLOCK > 0n ? MANGOAL_DEPLOY_BLOCK : DEPLOY_FALLBACK;

      // wallet → latest pick scores (PickUpdated overrides PickSubmitted for same wallet)
      const latestPick = new Map<string, { home: number; away: number }>();

      for (let from = fromBlock; from <= toBlock; from += CHUNK + 1n) {
        const to = from + CHUNK > toBlock ? toBlock : from + CHUNK;

        const [submitted, updated] = await Promise.all([
          publicClient.getLogs({
            address: MANGOAL_LEDGER_ADDRESS,
            event: PICK_SUBMITTED,
            args: { campaignId, matchId },
            fromBlock: from,
            toBlock: to,
          }),
          publicClient.getLogs({
            address: MANGOAL_LEDGER_ADDRESS,
            event: PICK_UPDATED,
            args: { campaignId, matchId },
            fromBlock: from,
            toBlock: to,
          }),
        ]);

        for (const log of [...submitted, ...updated]) {
          const w = log.args.wallet?.toLowerCase();
          if (w && log.args.homeScore != null && log.args.awayScore != null) {
            latestPick.set(w, { home: log.args.homeScore, away: log.args.awayScore });
          }
        }
      }

      const total = latestPick.size;
      if (total < 3) {
        setDistribution(null);
        return;
      }

      let homeWins = 0, draws = 0, awayWins = 0;
      for (const { home, away } of latestPick.values()) {
        if (home > away) homeWins++;
        else if (home === away) draws++;
        else awayWins++;
      }

      setDistribution({
        home: Math.round((homeWins / total) * 100),
        draw: Math.round((draws / total) * 100),
        away: Math.round((awayWins / total) * 100),
        total,
      });
    } catch {
      // silently fail — the bar is supplementary
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, campaignId, matchId, enabled]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { distribution, isLoading };
}
