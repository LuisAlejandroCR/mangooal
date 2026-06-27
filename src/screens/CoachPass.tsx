import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageToggle } from "../components/LanguageToggle";
import { FEATURED_TOKENS, type StablecoinInfo } from "../config/stablecoins";
import { PASS_AMOUNTS, usePurchaseCoachPass } from "../hooks/useMangoalLedger";
import { useMiniPay } from "../hooks/useMiniPay";
import { useTokenBalances } from "../hooks/useTokenBalances";

const ADD_CASH_URL = "https://link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT";

type PassOption = {
  id: string;
  type: number;
  label: string;
  duration: string;
  price: Record<string, string>;
};

const PASS_OPTIONS: PassOption[] = [
  { id: "daily", type: 1, label: "Daily", duration: "24 hours", price: { COPm: "500 COPm", USDC: "0.10 USDC", USDT: "0.10 USDT", USDm: "0.10 USDm" } },
  { id: "weekly", type: 2, label: "Weekly", duration: "7 days", price: { COPm: "2,500 COPm", USDC: "0.50 USDC", USDT: "0.50 USDT", USDm: "0.50 USDm" } },
  { id: "campaign", type: 3, label: "Campaign", duration: "Campaign period", price: { COPm: "8,000 COPm", USDC: "1.50 USDC", USDT: "1.50 USDT", USDm: "1.50 USDm" } },
  { id: "season", type: 4, label: "Season", duration: "6 months", price: { COPm: "40,000 COPm", USDC: "7.00 USDC", USDT: "7.00 USDT", USDm: "7.00 USDm" } },
];

const DEFAULT_MINIPAY_TOKEN =
  FEATURED_TOKENS.find((token) => token.symbol === "USDC") ??
  FEATURED_TOKENS.find((token) => token.symbol === "USDm") ??
  FEATURED_TOKENS.find((token) => token.miniPayCore) ??
  FEATURED_TOKENS[0];

function getPurchaseErrorMessage(error: Error) {
  const message = error.message.toLowerCase();
  if (message.includes("user rejected") || message.includes("rejected the request")) {
    return "Request cancelled. Nothing was charged.";
  }
  if (message.includes("chain")) {
    return "Switch your wallet to Celo and try again.";
  }
  return "Coach Pass transaction failed. Please try again.";
}

export function CoachPass() {
  const navigate = useNavigate();
  const [selectedPass, setSelectedPass] = useState("weekly");
  const [selectedToken, setSelectedToken] = useState<StablecoinInfo>(DEFAULT_MINIPAY_TOKEN);
  const { isMiniPay, isConnected, address } = useMiniPay();
  const { purchase, step, txHash, isPending, error, reset } = usePurchaseCoachPass();
  const { rawBalances } = useTokenBalances(address as `0x${string}` | undefined);

  const paymentTokens = useMemo(
    () => (isMiniPay ? FEATURED_TOKENS.filter((token) => token.miniPayCore) : FEATURED_TOKENS),
    [isMiniPay]
  );

  useEffect(() => {
    if (isMiniPay && !selectedToken.miniPayCore) {
      setSelectedToken(DEFAULT_MINIPAY_TOKEN);
      reset();
    }
  }, [isMiniPay, selectedToken.miniPayCore, reset]);

  const currentPass = PASS_OPTIONS.find((pass) => pass.id === selectedPass) ?? PASS_OPTIONS[1];
  const requiredAmount = PASS_AMOUNTS[currentPass.type]?.[selectedToken.symbol] ?? 0n;
  const userBalance = rawBalances[selectedToken.symbol] ?? 0n;
  const isLowBalance = isConnected && requiredAmount > 0n && userBalance < requiredAmount;

  async function handleUnlock() {
    if (!isConnected) {
      alert("Open Mangooal inside MiniPay or connect a Celo wallet.");
      return;
    }
    if (isMiniPay && !selectedToken.miniPayCore) {
      alert("MiniPay payments use USDC, USDT, or USDm.");
      return;
    }
    if (isLowBalance) {
      alert(`Not enough ${selectedToken.symbol}. Add funds and try again.`);
      return;
    }
    try {
      await purchase({ passType: currentPass.type, token: selectedToken });
    } catch {
      // Hook state renders the user-safe message.
    }
  }

  if (step === "done" && txHash) {
    return <PassSuccessView txHash={txHash} onClose={reset} />;
  }

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-logo">
          <span className="brand-ball">⚽</span> <span>Mangoo</span>al
        </span>
        <div className="topbar-actions">
          <button className="icon-button" onClick={() => navigate("/coach-pass/history")} type="button" aria-label="Coach Pass history">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v5h5" />
              <path d="M3.05 13A9 9 0 1 0 5 5.3L3 8" />
              <path d="M12 7v5l3 2" />
            </svg>
          </button>
          <LanguageToggle />
        </div>
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>
        <div className="coach-card compact-card">
          <div className="coach-label">Mangooal Coach</div>
          <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.05 }}>
            Deeper match context
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.55, marginTop: 10 }}>
            Recent form, head-to-head notes, and reminders. Picks stay free.
          </p>
        </div>

        <div className="mini-perks" style={{ marginBottom: 14 }}>
          {["Form", "Head-to-head", "Reminders"].map((perk) => (
            <div key={perk}>
              <span className="status-dot dot-green" />
              <span>{perk}</span>
            </div>
          ))}
        </div>

        <div className="section-title">Choose pass</div>
        {PASS_OPTIONS.map((pass) => {
          const active = selectedPass === pass.id;
          return (
            <button
              key={pass.id}
              type="button"
              onClick={() => {
                setSelectedPass(pass.id);
                reset();
              }}
              className={`pass-card ${active ? "selected" : ""}`}
              style={{ width: "100%", background: active ? "#FFF9EC" : "var(--card)", textAlign: "left" }}
            >
              <div className="pass-card-header">
                <div>
                  <div className="pass-type">{pass.label}</div>
                  <div className="pass-perks">{pass.duration}</div>
                </div>
                <div className="pass-price">{pass.price[selectedToken.symbol]}</div>
              </div>
            </button>
          );
        })}

        <div className="section-title">Pay with</div>
        <div className="token-pills">
          {paymentTokens.map((token) => (
            <button
              key={token.symbol}
              type="button"
              className={`token-pill ${selectedToken.symbol === token.symbol ? "selected" : ""}`}
              onClick={() => {
                setSelectedToken(token);
                reset();
              }}
            >
              <span className="token-dot" />
              <span>{token.symbol}</span>
            </button>
          ))}
        </div>

        {isLowBalance && (
          <div className="hint-card error">
            Not enough {selectedToken.symbol}.{" "}
            <a href={ADD_CASH_URL} target="_blank" rel="noreferrer">
              Add funds
            </a>
          </div>
        )}

        {step === "error" && error && <div className="hint-card error">{getPurchaseErrorMessage(error)}</div>}

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleUnlock}
          disabled={isPending || isLowBalance}
          style={{ opacity: isPending || isLowBalance ? 0.6 : 1 }}
        >
          {step === "approving"
            ? "Approving..."
            : step === "purchasing"
              ? "Processing..."
              : `Unlock - ${currentPass.price[selectedToken.symbol]}`}
        </button>
      </div>
    </div>
  );
}

function PassSuccessView({ txHash, onClose }: { txHash: `0x${string}`; onClose: () => void }) {
  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-logo">
          <span className="brand-ball">⚽</span> <span>Mangoo</span>al
        </span>
        <LanguageToggle />
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="success-mark">✓</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Coach Pass active</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 16 }}>
            Deeper match insights are unlocked.
          </p>
          <a className="btn btn-secondary" href={`https://celoscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
            View receipt
          </a>
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ marginTop: 10 }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
