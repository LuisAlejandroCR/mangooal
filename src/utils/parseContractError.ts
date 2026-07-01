/**
 * Converts a raw viem/wagmi contract error into a short, user-facing message.
 *
 * Viem errors look like:
 *   "The contract function "fn" reverted with the following reason: {reason}
 *    Contract Call: address: 0x... Docs: https://viem.sh/... Details: ... Version: viem@x.y.z"
 *
 * We extract the revert reason when present, then map known patterns to plain language.
 */
export function parseContractError(error: Error | null | undefined, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;

  const msg = error.message;

  // User cancelled the wallet popup
  if (/user rejected|rejected the request|user denied|cancelled/i.test(msg)) {
    return "Cancelled — nothing was submitted.";
  }

  // Not enough CELO / stablecoin for gas
  if (/insufficient|not enough|balance/i.test(msg)) {
    return "Not enough funds to cover the network fee.";
  }

  // Try to extract the on-chain revert reason between "reason:" and "Contract Call:"
  const reasonMatch = msg.match(/reason:\s*(.+?)\s*(?:Contract Call:|$)/i);
  const reason = reasonMatch?.[1]?.trim();

  if (reason) {
    // Map known contract error strings to plain language
    if (/already revealed/i.test(reason)) return "This pick has already been revealed.";
    if (/already committed/i.test(reason)) return "This pick has already been submitted.";
    if (/prediction window closed|window closed|locked/i.test(reason)) return "The prediction window for this match is closed.";
    if (/match not found|match does not exist/i.test(reason)) return "Match not found on-chain.";
    if (/invalid signature|bad signature/i.test(reason)) return "Reward signature is invalid. Contact support.";
    if (/already claimed/i.test(reason)) return "Reward already claimed.";

    // Return the raw reason only if it's short and readable (no hex, no URLs)
    if (reason.length < 80 && !/0x[0-9a-f]{4,}/i.test(reason)) {
      return reason.charAt(0).toUpperCase() + reason.slice(1) + ".";
    }
  }

  return fallback;
}
