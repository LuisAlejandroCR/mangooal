import { useState } from "react";
import { CeloBadge } from "../components/CeloBadge";
import { FEATURED_TOKENS, MINIPAY_TX_TOKENS, type StablecoinInfo } from "../config/stablecoins";

type PassOption = {
  id: string;
  type: number;
  label: string;
  duration: string;
  price: Record<string, string>; // symbol → display price
};

const PASS_OPTIONS: PassOption[] = [
  {
    id: "daily",
    type: 1,
    label: "Daily Coach Pass",
    duration: "24 hours",
    price: { COPm: "500 COPm", USDC: "0.10 USDC", USDT: "0.10 USDT", USDm: "0.10 USDm" },
  },
  {
    id: "weekly",
    type: 2,
    label: "Weekly Coach Pass",
    duration: "7 days",
    price: { COPm: "2,500 COPm", USDC: "0.50 USDC", USDT: "0.50 USDT", USDm: "0.50 USDm" },
  },
  {
    id: "campaign",
    type: 3,
    label: "Campaign Coach Pass",
    duration: "Campaign period",
    price: { COPm: "8,000 COPm", USDC: "1.50 USDC", USDT: "1.50 USDT", USDm: "1.50 USDm" },
  },
  {
    id: "season",
    type: 4,
    label: "Season Coach Pass",
    duration: "6 months",
    price: { COPm: "40,000 COPm", USDC: "7.00 USDC", USDT: "7.00 USDT", USDm: "7.00 USDm" },
  },
];

const PERKS = [
  "Advanced match context from Mangoal Coach",
  "Deeper team recent-form analysis",
  "Head-to-head summaries",
  "Reminders before prediction lock",
  "Private leagues (create your own leaderboard)",
  "Custom profile themes & cosmetic badges",
  "Shareable prediction cards",
  "Historical performance dashboard",
];

export function CoachPass() {
  const [selectedPass, setSelectedPass] = useState<string>("weekly");
  const [selectedToken, setSelectedToken] = useState<StablecoinInfo>(FEATURED_TOKENS[0]); // COPm first

  const currentPass = PASS_OPTIONS.find((p) => p.id === selectedPass)!;

  // In MiniPay we restrict to core tokens for the actual tx
  const paymentTokens = FEATURED_TOKENS;

  function handleUnlock() {
    // TODO: useWriteContract → MangoalLedger.purchaseCoachPass(passType, token, amount)
    // Use selectedToken.address for the token parameter
    // For feeCurrency: selectedToken.feeCurrencyAddress (adapter for USDC/USDT, same for USDm/COPm)
    alert(`Unlocking ${currentPass.label} with ${selectedToken.symbol} on Celo Mainnet`);
  }

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-logo">🏅 Coach Pass</span>
        <CeloBadge variant="powered" />
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>
        {/* Hero */}
        <div
          style={{
            background: "linear-gradient(135deg, #F4B400 0%, #FFC83D 100%)",
            borderRadius: "var(--radius)",
            padding: "20px 18px",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>🥭🏅</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1F2937" }}>
            Mangoal Coach Pass
          </div>
          <div style={{ fontSize: 13, color: "#4B5563", marginTop: 4, lineHeight: 1.6 }}>
            Unlock deeper match insights. Predictions stay free for everyone.
          </div>
        </div>

        {/* Compliance banner */}
        <div
          style={{
            background: "#F0FDF4",
            border: "1px solid #86EFAC",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            fontSize: 12,
            color: "var(--green-dark)",
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          <strong>Coach Pass does not affect points, ranking, or promotional rewards.</strong>
          <br />
          It is optional and non-competitive. Predictions remain free for everyone.
        </div>

        {/* Perks */}
        <div className="section-title">What you unlock</div>
        <div className="card" style={{ marginBottom: 16 }}>
          {PERKS.map((perk, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "7px 0",
                borderBottom: i < PERKS.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span style={{ color: "var(--success)", fontWeight: 800, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 13 }}>{perk}</span>
            </div>
          ))}
        </div>

        {/* Pass options */}
        <div className="section-title">Choose your pass</div>
        {PASS_OPTIONS.map((pass) => (
          <div
            key={pass.id}
            className={`pass-card${selectedPass === pass.id ? " selected" : ""}`}
            onClick={() => setSelectedPass(pass.id)}
          >
            <div className="pass-card-header">
              <div>
                <div className="pass-type">{pass.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{pass.duration}</div>
              </div>
              <div className="pass-price">{pass.price[selectedToken.symbol]}</div>
            </div>
          </div>
        ))}

        {/* Token selector */}
        <div className="section-title">Pay with</div>
        <div className="token-pills">
          {paymentTokens.map((token) => (
            <button
              key={token.symbol}
              className={`token-pill${selectedToken.symbol === token.symbol ? " selected" : ""}`}
              onClick={() => setSelectedToken(token)}
            >
              <span>{token.flagEmoji}</span>
              {token.symbol}
            </button>
          ))}
        </div>

        {/* MiniPay note for non-core tokens */}
        {!selectedToken.miniPayCore && (
          <div
            style={{
              background: "#FFF9EC",
              border: "1px solid var(--yellow)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              fontSize: 12,
              color: "#7A5F00",
              marginTop: 8,
              lineHeight: 1.6,
            }}
          >
            <strong>{selectedToken.symbol}</strong> is available as a payment option on Celo Mainnet.
            If you're inside MiniPay, the network fee will be covered automatically via fee abstraction.
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 20, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 800 }}>
              {currentPass.price[selectedToken.symbol]}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <CeloBadge variant="network" />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Payment processed on Celo Mainnet
            </span>
          </div>

          <button className="btn btn-primary" onClick={handleUnlock}>
            Unlock Coach Pass · {currentPass.price[selectedToken.symbol]}
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.6 }}>
          Coach Pass gives you deeper match context. It does not affect points, rankings, or rewards.
          <br />Predictions remain free for everyone.
        </div>
      </div>
    </div>
  );
}
