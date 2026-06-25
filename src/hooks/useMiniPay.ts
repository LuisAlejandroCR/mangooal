import { useEffect, useState } from "react";
import { useConnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";

/**
 * Detects MiniPay environment and auto-connects on mount.
 *
 * Rules (celopedia-skill / minipay-guide.md):
 *   - window.ethereum.isMiniPay === true → inside MiniPay WebView
 *   - Auto-connect via injected connector, no connect button shown
 *   - No personal_sign / eth_signTypedData
 *   - Legacy tx only — do NOT set maxFeePerGas / maxPriorityFeePerGas
 *   - feeCurrency for gas: USDm address (same as token) or USDC/USDT adapters
 *   - Only USDT / USDC / USDm are user-facing tokens in MiniPay
 *   - Never display CELO or raw 0x addresses as primary identifiers
 */
export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const detected =
      typeof window !== "undefined" &&
      window.ethereum !== undefined &&
      (window.ethereum as { isMiniPay?: boolean }).isMiniPay === true;

    setIsMiniPay(detected);

    if (detected && !isConnected) {
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [connect, isConnected]);

  return { isMiniPay, address, isConnected };
}
