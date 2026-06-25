import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { MANGOAL_LEDGER_ADDRESS, CONTRACT_LIVE, MANGOAL_DEPLOY_BLOCK } from "./useMangoalLedger";

// viem getLogs requires a single typed `event:` ABI item, not abi+eventName
const COMMITTED_EVENT = parseAbiItem(
  "event PredictionCommitted(address indexed wallet, bytes32 indexed campaignId, bytes32 indexed matchId, bytes32 predictionHash, uint64 committedAt)"
);
const PASS_EVENT = parseAbiItem(
  "event CoachPassPurchased(address indexed wallet, uint8 passType, address token, uint256 amount, uint64 expiresAt)"
);
const REWARD_EVENT = parseAbiItem(
  "event RewardClaimed(address indexed wallet, bytes32 indexed campaignId, uint256 amount, address token)"
);

export type OnChainStats = {
  totalPredictions: number;
  uniquePlayers: number;
  coachPassSold: number;
  rewardsClaimed: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
};

export function useOnChainStats(): OnChainStats {
  const publicClient = usePublicClient();
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [uniquePlayers, setUniquePlayers] = useState(0);
  const [coachPassSold, setCoachPassSold] = useState(0);
  const [rewardsClaimed, setRewardsClaimed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchStats = useCallback(async () => {
    if (!publicClient || !CONTRACT_LIVE) return;

    setIsLoading(true);
    setError(null);

    try {
      const toBlock = await publicClient.getBlockNumber();
      // If deploy block not set, default to last 50K blocks (contract was just deployed).
      const fromBlock =
        MANGOAL_DEPLOY_BLOCK > 0n
          ? MANGOAL_DEPLOY_BLOCK
          : toBlock > 50_000n
          ? toBlock - 50_000n
          : 0n;

      // Celo public RPC rejects getLogs ranges > ~50K blocks (error -32011).
      // Chunk the range so stats always work regardless of contract age.
      const CHUNK = 49_999n;
      let commitCount = 0;
      const wallets = new Set<string>();
      let passCount = 0;
      let rewardCount = 0;

      for (let from = fromBlock; from <= toBlock; from += CHUNK + 1n) {
        const to = from + CHUNK > toBlock ? toBlock : from + CHUNK;

        const [commits, passes, rewards] = await Promise.all([
          publicClient.getLogs({
            address: MANGOAL_LEDGER_ADDRESS,
            event: COMMITTED_EVENT,
            fromBlock: from,
            toBlock: to,
          }),
          publicClient.getLogs({
            address: MANGOAL_LEDGER_ADDRESS,
            event: PASS_EVENT,
            fromBlock: from,
            toBlock: to,
          }),
          publicClient.getLogs({
            address: MANGOAL_LEDGER_ADDRESS,
            event: REWARD_EVENT,
            fromBlock: from,
            toBlock: to,
          }),
        ]);

        commitCount += commits.length;
        for (const l of commits) {
          const w = l.args.wallet?.toLowerCase();
          if (w) wallets.add(w);
        }
        passCount += passes.length;
        rewardCount += rewards.length;
      }

      setTotalPredictions(commitCount);
      setUniquePlayers(wallets.size);
      setCoachPassSold(passCount);
      setRewardsClaimed(rewardCount);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stats unavailable");
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    void fetchStats();
    const id = setInterval(() => void fetchStats(), 120_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  return {
    totalPredictions,
    uniquePlayers,
    coachPassSold,
    rewardsClaimed,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchStats,
  };
}
