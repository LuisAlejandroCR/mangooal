import { useEffect, useState } from "react";
import { FEATURED_TOKENS } from "../config/stablecoins";
import { useTokenBalances } from "../hooks/useTokenBalances";
import { useMiniPay } from "../hooks/useMiniPay";
import { useLanguage } from "../i18n";

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
  const { isMiniPay, isConnected, address } = useMiniPay();
  const { language } = useLanguage();
  const { balances, isLoading } = useTokenBalances(address as `0x${string}` | undefined);
  const [selectedToken, setSelectedToken] = useState(initialToken);
  const availableTokens = isMiniPay ? FEATURED_TOKENS.filter((item) => item.miniPayCore) : FEATURED_TOKENS;
  const token = availableTokens.find((item) => item.symbol === selectedToken) ?? availableTokens[0] ?? FEATURED_TOKENS[1];
  const value = !isConnected ? "--" : isLoading ? "..." : balances[token.symbol] ?? "-";

  useEffect(() => {
    if (token.symbol !== selectedToken) {
      setSelectedToken(token.symbol);
      return;
    }
    window.localStorage.setItem(SELECTED_TOKEN_KEY, selectedToken);
  }, [selectedToken, token.symbol]);

  return (
    <label className="stablecoin-select-card" aria-label="Selected stablecoin">
      <span className="select-card-label">Stablecoin</span>
      <span className="selected-stablecoin-line">
        <span className="token-dot" style={{ background: tokenTone(token.symbol) }} />
        <strong>{token.symbol}</strong>
        <small>{value} · {language === "es" ? "Cambiar" : "Change"}</small>
      </span>
      <select
        value={selectedToken}
        onChange={(event) => setSelectedToken(event.target.value)}
      >
        {availableTokens.map((item) => (
          <option key={item.symbol} value={item.symbol}>
            {item.symbol}
          </option>
        ))}
      </select>
    </label>
  );
}
