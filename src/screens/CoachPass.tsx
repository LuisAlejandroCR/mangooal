import { useState } from "react";
import { useAccount } from "wagmi";
import { CeloBadge } from "../components/CeloBadge";
import { FEATURED_TOKENS, type StablecoinInfo } from "../config/stablecoins";
import { usePurchaseCoachPass, PASS_AMOUNTS } from "../hooks/useMangoalLedger";
import { useTokenBalances } from "../hooks/useTokenBalances";

const ADD_CASH_URL = "https://link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT";

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
  "Advanced match context from Mangooal Coach",
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
  const { isConnected, address } = useAccount();
  const { purchase, step, txHash, isPending, error, reset } = usePurchaseCoachPass();
  const { rawBalances } = useTokenBalances(address as `0x${string}` | undefined);

  const currentPass = PASS_OPTIONS.find((p) => p.id === selectedPass)!;
  const requiredAmount = PASS_AMOUNTS[currentPass.type]?.[selectedToken.symbol] ?? 0n;
  const userBalance = rawBalances[selectedToken.symbol] ?? 0n;
  const isLowBalance = isConnected && userBalance < requiredAmount;

  async function handleUnlock() {
    if (!isConnected) {
      alert("Please open Mangooal inside MiniPay or connect a Celo wallet.");
      return;
    }
    try {
      await purchase({ passType: currentPass.type, token: selectedToken });
    } catch {
      // error captured in usePurchaseCoachPass
    }
  }

  if (step === "done" && txHash) {
    return <PassSuccessView txHash={txHash} onClose={reset} />;
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
            Mangooal Coach Pass
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
            onClick={() => { setSelectedPass(pass.id); reset(); }}
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
          {FEATURED_TOKENS.map((token) => (
            <button
              key={token.symbol}
              className={`token-pill${selectedToken.symbol === token.symbol ? " selected" : ""}`}
              onClick={() => { setSelectedToken(token); reset(); }}
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

        {/* Low-balance notice */}
        {isLowBalance && (
          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FCD34D",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              fontSize: 12,
              color: "#92400E",
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            <strong>Not enough {selectedToken.symbol}.</strong>
            {" "}
            <a
              href={ADD_CASH_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#B45309", textDecoration: "underline", fontWeight: 700 }}
            >
              Add funds in MiniPay
            </a>
          </div>
        )}

        {/* Error banner */}
        {step === "error" && error && (
          <div
            style={{
              background: "#FFF0F0",
              border: "1px solid #FCA5A5",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              fontSize: 12,
              color: "#B91C1C",
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            {error.message || "Transaction failed. Please try again."}
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

          <button
            className="btn btn-primary"
            onClick={handleUnlock}
            disabled={isPending || isLowBalance}
          >
            {step === "approving"
              ? "Approving spend..."
              : step === "purchasing"
              ? "Processing Coach Pass..."
              : `Unlock Coach Pass · ${currentPass.price[selectedToken.symbol]}`}
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

function PassSuccessView({ txHash, onClose }: { txHash: `0x${string}`; onClose: () => void }) {
  return (
    <div className="screen">
      <div className="screen-body" style={{ paddingTop: 48, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🥭🏅</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Coach Pass active!</h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
          Your Coach Pass is now live on Celo Mainnet.
          Deeper match insights are now unlocked.
        </p>

        <div className="card" style={{ marginBottom: 16, textAlign: "left" }}>
          <div className="wallet-bar" style={{ marginBottom: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="7" fill="#35D07F" />
              <circle cx="7" cy="7" r="3.5" fill="white" />
            </svg>
            Recorded on Celo Mainnet
          </div>
          <div style={{ marginTop: 8, fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", wordBreak: "break-all" }}>
            {txHash}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
            Coach Pass does not affect your points, ranking, or promotional reward eligibility.
          </div>
        </div>

        <button className="btn btn-secondary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
