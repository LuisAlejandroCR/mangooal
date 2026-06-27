import { useEffect, useState } from "react";
import { FEATURED_TOKENS } from "../config/stablecoins";
import { useTokenBalances } from "../hooks/useTokenBalances";
import { useMiniPay } from "../hooks/useMiniPay";

const SELECTED_TOKEN_KEY = "mangooal:selected-stablecoin";

function tokenTone(symbol: string) {
  if (symbol === "COPm") return "#FACC15";
  if (symbol === "USDC") return "#2775CA";
  if (symbol === "USDT") return "#26A17B";
  return "#35D07F";
}

function initialToken() {
  if (typeof window === "undefined") return "USDC";
  return window.localStorage.getItem(SELECTED_TOKEN_KEY) ?? "USDC";
}

export function StablecoinBalances() {
  const { isConnected, address } = useMiniPay();
  const { balances, isLoading } = useTokenBalances(address as `0x${string}` | undefined);
  const [selectedToken, setSelectedToken] = useState(initialToken);

  useEffect(() => {
    window.localStorage.setItem(SELECTED_TOKEN_KEY, selectedToken);
  }, [selectedToken]);

  return (
    <div className="stablecoin-panel" aria-label="Stablecoin balances">
      <div className="stablecoin-panel-head">
        <span>Stablecoins</span>
        <strong>{selectedToken} selected</strong>
      </div>

      <div className="balance-strip">
        {FEATURED_TOKENS.map((token) => (
          <button
            className={`balance-chip ${selectedToken === token.symbol ? "selected" : ""}`}
            key={token.symbol}
            onClick={() => setSelectedToken(token.symbol)}
            type="button"
          >
            <span className="token-dot" style={{ background: tokenTone(token.symbol) }} />
            <span className="balance-symbol">{token.symbol}</span>
            <span className="balance-value">
              {!isConnected ? "--" : isLoading ? "..." : balances[token.symbol] ?? "-"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
