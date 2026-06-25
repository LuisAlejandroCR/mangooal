import { useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { FEATURED_TOKENS } from "../config/stablecoins";
import { ERC20_ABI } from "../contracts/erc20.abi";

// Reads live on-chain balanceOf for every FEATURED_TOKEN (COPm, USDC, USDT, USDm).
// Returns formatted display strings keyed by token symbol.
export function useTokenBalances(walletAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContracts({
    contracts: walletAddress
      ? FEATURED_TOKENS.map((t) => ({
          address: t.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "balanceOf" as const,
          args: [walletAddress] as const,
        }))
      : [],
    query: { enabled: !!walletAddress, refetchInterval: 12_000 },
  });

  const balances: Record<string, string> = {};

  if (data) {
    FEATURED_TOKENS.forEach((token, i) => {
      const result = data[i];
      if (result?.status === "success" && typeof result.result === "bigint") {
        const num = parseFloat(formatUnits(result.result, token.decimals));
        balances[token.symbol] = num.toLocaleString("en", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        });
      } else {
        balances[token.symbol] = "—";
      }
    });
  }

  return { balances, isLoading, refetch };
}
