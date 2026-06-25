import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { parseAbi } from "viem";
import { MANGOAL_LEDGER_ADDRESS, CONTRACT_LIVE, MANGOAL_DEPLOY_BLOCK } from "./useMangoalLedger";

const STATS_ABI = parseAbi([
  "event PredictionCommitted(address indexed wallet, bytes32 indexed campaignId, bytes32 indexed matchId, bytes32 predictionHash, uint64 committedAt)",
  "event CoachPassPurchased(address indexed wallet, uint8 passType, address token, uint256 amount, uint64 expiresAt)",
  "event RewardClaimed(address indexed wallet, bytes32 indexed campaignId, uint256 amount, address token)",
]);

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
      // fromBlock = contract deployment block; set VITE_DEPLOY_BLOCK in Vercel env after deploy.
      const fromBlock = MANGOAL_DEPLOY_BLOCK > 0n ? MANGOAL_DEPLOY_BLOCK : undefined;

      const [commitLogs, passLogs, rewardLogs] = await Promise.all([
        publicClient.getLogs({
          address: MANGOAL_LEDGER_ADDRESS,
          abi: STATS_ABI,
          eventName: "PredictionCommitted",
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: MANGOAL_LEDGER_ADDRESS,
          abi: STATS_ABI,
          eventName: "CoachPassPurchased",
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: MANGOAL_LEDGER_ADDRESS,
          abi: STATS_ABI,
          eventName: "RewardClaimed",
          fromBlock,
          toBlock: "latest",
        }),
      ]);

      const wallets = new Set(
        commitLogs
          .map((l) => l.args.wallet?.toLowerCase())
          .filter((w): w is string => w !== undefined)
      );

      setTotalPredictions(commitLogs.length);
      setUniquePlayers(wallets.size);
      setCoachPassSold(passLogs.length);
      setRewardsClaimed(rewardLogs.length);
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
