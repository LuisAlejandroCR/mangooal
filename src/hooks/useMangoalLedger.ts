import { useState } from "react";
import { useWriteContract, useReadContract, useAccount, usePublicClient } from "wagmi";
import { keccak256, encodePacked, toHex, parseUnits } from "viem";
import { celo } from "viem/chains";
import { MANGOAL_LEDGER_ABI } from "../contracts/mangoalLedger.abi";
import { ERC20_ABI } from "../contracts/erc20.abi";
import type { StablecoinInfo } from "../config/stablecoins";
import { analytics } from "../lib/analytics";

export const MANGOAL_LEDGER_ADDRESS =
  "0xCF00CaE3610cA8C410948C240b930c9cE3C03d66" as `0x${string}`;

export const CONTRACT_LIVE = MANGOAL_LEDGER_ADDRESS !== "0x0000000000000000000000000000000000000000";

// Set VITE_DEPLOY_BLOCK in Vercel env after deploying MangooalLedger.
// Used by useOnChainStats to scope getLogs to the contract's lifetime.
export const MANGOAL_DEPLOY_BLOCK = BigInt(
  (import.meta.env.VITE_DEPLOY_BLOCK as string | undefined) ?? "0"
);

// Pass type constants (mirror MangoalLedger.sol)
export const PASS_TYPE = {
  DAILY: 1,
  WEEKLY: 2,
  CAMPAIGN: 3,
  SEASON: 4,
} as const;

// Token amounts in native units — mirrors operator-configured passPrices in the contract
export const PASS_AMOUNTS: Record<number, Record<string, bigint>> = {
  [PASS_TYPE.DAILY]:    { COPm: parseUnits("500", 18),   USDC: parseUnits("0.10", 6), USDT: parseUnits("0.10", 6), USDm: parseUnits("0.10", 18) },
  [PASS_TYPE.WEEKLY]:   { COPm: parseUnits("2500", 18),  USDC: parseUnits("0.50", 6), USDT: parseUnits("0.50", 6), USDm: parseUnits("0.50", 18) },
  [PASS_TYPE.CAMPAIGN]: { COPm: parseUnits("8000", 18),  USDC: parseUnits("1.50", 6), USDT: parseUnits("1.50", 6), USDm: parseUnits("1.50", 18) },
  [PASS_TYPE.SEASON]:   { COPm: parseUnits("40000", 18), USDC: parseUnits("7.00", 6), USDT: parseUnits("7.00", 6), USDm: parseUnits("7.00", 18) },
};

// localStorage keys for commit-reveal salt persistence
function saltKey(matchId: string, addr: string) {
  return `mangoal:salt:${matchId}:${addr.toLowerCase()}`;
}
function scoresKey(matchId: string, addr: string) {
  return `mangoal:scores:${matchId}:${addr.toLowerCase()}`;
}
function txHashKey(matchId: string, addr: string) {
  return `mangoal:txhash:${matchId}:${addr.toLowerCase()}`;
}
function coachPassLocalKey(addr: string) {
  return `mangoal:coach-pass:${addr.toLowerCase()}`;
}
function coachPassHistoryKey(addr: string) {
  return `mangoal:coach-pass-history:${addr.toLowerCase()}`;
}

// Retrieve commit tx hash stored at prediction time (for on-chain audit display)
export function getCommitTxHash(matchId: string, address: string): `0x${string}` | null {
  return localStorage.getItem(txHashKey(matchId, address)) as `0x${string}` | null;
}

// Retrieve locally stored reveal data (called by reveal flow)
export function getSaltForReveal(matchId: string, address: string) {
  const salt = localStorage.getItem(saltKey(matchId, address)) as `0x${string}` | null;
  const raw = localStorage.getItem(scoresKey(matchId, address));
  const scores: { homeScore: number; awayScore: number } | null = raw ? JSON.parse(raw) : null;
  return { salt, scores };
}

// ── commitPrediction ────────────────────────────────────────────────────────
// Computes predictionHash off-chain, stores salt locally, sends commitPrediction tx.
export function useCommitPrediction() {
  const { address } = useAccount();
  const { writeContractAsync, isPending, error } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  async function commit({
    campaignId,
    matchId,
    homeScore,
    awayScore,
  }: {
    campaignId: `0x${string}`;
    matchId: `0x${string}`;
    homeScore: number;
    awayScore: number;
  }) {
    if (!address) throw new Error("Wallet not connected");

    const saltBytes = new Uint8Array(32);
    crypto.getRandomValues(saltBytes);
    const salt = toHex(saltBytes) as `0x${string}`;

    // Mirrors: keccak256(abi.encodePacked(msg.sender, campaignId, matchId, homeScore, awayScore, salt))
    const predictionHash = keccak256(
      encodePacked(
        ["address", "bytes32", "bytes32", "uint8", "uint8", "bytes32"],
        [address, campaignId, matchId, homeScore, awayScore, salt]
      )
    );

    const hash = await writeContractAsync({
      chainId: celo.id,
      address: MANGOAL_LEDGER_ADDRESS,
      abi: MANGOAL_LEDGER_ABI,
      functionName: "commitPrediction",
      args: [campaignId, matchId, predictionHash],
      type: "legacy",
    });

    // Persist salt + scores locally so the reveal phase can reconstruct the hash
    localStorage.setItem(saltKey(matchId, address), salt);
    localStorage.setItem(scoresKey(matchId, address), JSON.stringify({ homeScore, awayScore }));

    // Persist tx hash locally so OnChainAudit can link to Celoscan from this device
    localStorage.setItem(txHashKey(matchId, address), hash);

    setTxHash(hash);
    analytics.predictionCommitted(campaignId, matchId);
    return { hash, predictionHash };
  }

  return { commit, txHash, isPending, error };
}

// ── hasActiveCoachPass ──────────────────────────────────────────────────────
export function useHasActiveCoachPass(walletAddress?: `0x${string}`) {
  // Fallback to zero address when undefined — query is disabled anyway,
  // but we need a valid args type to satisfy wagmi's strict generics.
  const { data, isLoading } = useReadContract({
    chainId: celo.id,
    address: MANGOAL_LEDGER_ADDRESS,
    abi: MANGOAL_LEDGER_ABI,
    functionName: "hasActiveCoachPass",
    args: [walletAddress ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!walletAddress && CONTRACT_LIVE },
  });
  const localExpiresAt = walletAddress
    ? Number(localStorage.getItem(coachPassLocalKey(walletAddress)) ?? "0")
    : 0;
  return { hasPass: Boolean(data) || localExpiresAt > Date.now(), isLoading };
}

export type CoachPassHistoryItem = {
  txHash: `0x${string}`;
  passType: number;
  tokenSymbol: string;
  purchasedAt: number;
};

export function getLocalCoachPassHistory(walletAddress?: string | null): CoachPassHistoryItem[] {
  if (!walletAddress) return [];
  const raw = localStorage.getItem(coachPassHistoryKey(walletAddress));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CoachPassHistoryItem[];
  } catch {
    return [];
  }
}

// ── purchaseCoachPass ───────────────────────────────────────────────────────
// Two-step: ERC-20 approve → ledger purchaseCoachPass.
// Waits for approval confirmation (Celo ~1 s blocks) before purchasing.
export type PurchaseStep = "idle" | "approving" | "purchasing" | "done" | "error";

export function usePurchaseCoachPass() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [step, setStep] = useState<PurchaseStep>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [purchaseError, setPurchaseError] = useState<Error | undefined>();

  async function purchase({ passType, token }: { passType: number; token: StablecoinInfo }) {
    if (!address || !publicClient) throw new Error("Wallet not connected");

    const amount = PASS_AMOUNTS[passType]?.[token.symbol];
    if (!amount) throw new Error(`No price configured for ${token.symbol} pass type ${passType}`);

    setPurchaseError(undefined);
    try {
      // Step 1: ERC-20 approve (spender = MangoalLedger)
      setStep("approving");
      const approveTx = await writeContractAsync({
        chainId: celo.id,
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [MANGOAL_LEDGER_ADDRESS, amount],
        type: "legacy",
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      // Step 2: purchaseCoachPass
      setStep("purchasing");
      const purchaseTx = await writeContractAsync({
        chainId: celo.id,
        address: MANGOAL_LEDGER_ADDRESS,
        abi: MANGOAL_LEDGER_ABI,
        functionName: "purchaseCoachPass",
        args: [passType, token.address as `0x${string}`, amount],
        type: "legacy",
      });
      await publicClient.waitForTransactionReceipt({ hash: purchaseTx });

      setTxHash(purchaseTx);
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(coachPassLocalKey(address), String(expiresAt));
      const history = getLocalCoachPassHistory(address);
      localStorage.setItem(
        coachPassHistoryKey(address),
        JSON.stringify([
          { txHash: purchaseTx, passType, tokenSymbol: token.symbol, purchasedAt: Date.now() },
          ...history,
        ].slice(0, 20))
      );
      setStep("done");
      analytics.coachPassPurchased(passType, token.symbol);
      return { txHash: purchaseTx };
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Transaction failed");
      setPurchaseError(e);
      setStep("error");
      throw e;
    }
  }

  function reset() {
    setStep("idle");
    setTxHash(undefined);
    setPurchaseError(undefined);
  }

  return {
    purchase,
    step,
    txHash,
    isPending: step === "approving" || step === "purchasing",
    error: purchaseError,
    reset,
  };
}

// ── revealPrediction ────────────────────────────────────────────────────────
// Called after lockedAt. Retrieves salt + scores from localStorage and reveals
// the committed prediction on-chain.
export function useRevealPrediction() {
  const { address } = useAccount();
  const { writeContractAsync, isPending, error } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  async function reveal({
    campaignId,
    matchId,
  }: {
    campaignId: `0x${string}`;
    matchId: `0x${string}`;
  }) {
    if (!address) throw new Error("Wallet not connected");

    const { salt, scores } = getSaltForReveal(matchId, address);
    if (!salt || !scores) {
      throw new Error("Reveal data not found — was the prediction committed on this device?");
    }

    const hash = await writeContractAsync({
      chainId: celo.id,
      address: MANGOAL_LEDGER_ADDRESS,
      abi: MANGOAL_LEDGER_ABI,
      functionName: "revealPrediction",
      args: [campaignId, matchId, scores.homeScore, scores.awayScore, salt],
      type: "legacy",
    });

    setTxHash(hash);
    analytics.predictionRevealed(campaignId, matchId);
    return { hash };
  }

  return { reveal, txHash, isPending, error };
}

// ── claimPromotionalReward ──────────────────────────────────────────────────
// Operator-signed claim (EIP-712). The signature + nonce are generated off-chain
// by the operator and delivered to eligible users via the deep link:
//   /claim?cid=0x...&token=0x...&amount=...&nonce=0&sig=0x...&label=...
export function useClaimReward() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  async function claim({
    campaignId,
    token,
    amount,
    nonce,
    operatorSignature,
  }: {
    campaignId: `0x${string}`;
    token: `0x${string}`;
    amount: bigint;
    nonce: bigint;
    operatorSignature: `0x${string}`;
  }) {
    const hash = await writeContractAsync({
      chainId: celo.id,
      address: MANGOAL_LEDGER_ADDRESS,
      abi: MANGOAL_LEDGER_ABI,
      functionName: "claimPromotionalReward",
      args: [campaignId, token, amount, nonce, operatorSignature],
      type: "legacy",
    });

    setTxHash(hash);
    analytics.rewardClaimed(campaignId, token);
    return { hash };
  }

  return { claim, txHash, isPending, error };
}
