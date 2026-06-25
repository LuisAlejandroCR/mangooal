import { useNavigate } from "react-router-dom";
import { parseUnits } from "viem";
import { CeloBadge } from "../components/CeloBadge";
import { useClaimReward } from "../hooks/useMangoalLedger";
import { STABLECOINS } from "../config/stablecoins";

// Demo reward data — replace with backend-fetched reward voucher after deployment
const DEMO_REWARD = {
  campaignLabel: "Copa América 2026",
  campaignId: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
  token: STABLECOINS.COPm,
  amount: parseUnits("500", 18), // 500 COPm
  displayAmount: "500 COPm",
  // Operator provides this signature to eligible users via push notification / deep link
  operatorSignature: "0x" as `0x${string}`,
};

export function RewardClaim() {
  const navigate = useNavigate();
  const { claim, txHash, isPending, error } = useClaimReward();

  async function handleClaim() {
    try {
      await claim({
        campaignId: DEMO_REWARD.campaignId,
        token: DEMO_REWARD.token.address,
        amount: DEMO_REWARD.amount,
        operatorSignature: DEMO_REWARD.operatorSignature,
      });
    } catch {
      // error surfaces through `error` state
    }
  }

  if (txHash) {
    return (
      <div className="screen">
        <div className="screen-body" style={{ paddingTop: 48, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🥭🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Reward claimed!</h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
            {DEMO_REWARD.displayAmount} sent to your wallet on Celo Mainnet.
          </p>
          <div className="card" style={{ marginBottom: 16, textAlign: "left" }}>
            <div className="wallet-bar" style={{ marginBottom: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="7" fill="#35D07F" />
                <circle cx="7" cy="7" r="3.5" fill="white" />
              </svg>
              Confirmed on Celo Mainnet
            </div>
            <div style={{ marginTop: 8, fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", wordBreak: "break-all" }}>
              {txHash}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            Back to picks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span style={{ fontWeight: 800, fontSize: 16 }}>🎁 Promotional reward</span>
        <CeloBadge variant="network" />
      </div>

      <div className="screen-body" style={{ paddingTop: 20 }}>
        {/* Hero */}
        <div
          style={{
            background: "linear-gradient(135deg, #176B3A 0%, #2E9E57 100%)",
            borderRadius: "var(--radius)",
            padding: "24px 18px",
            marginBottom: 16,
            color: "white",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>🥭</div>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            {DEMO_REWARD.campaignLabel}
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>
            {DEMO_REWARD.displayAmount}
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Promotional reward — operator-funded, not a prize pool
          </div>
        </div>

        {/* Compliance note */}
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
          <strong>This is a promotional reward, not a betting payout.</strong>
          <br />
          Funded by Mangooal. Not user-funded. Not a prize pool.
        </div>

        {/* Reward details */}
        <div className="section-title">Reward details</div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="audit-row">
            <span className="audit-label">Amount</span>
            <span className="audit-value" style={{ fontWeight: 800 }}>{DEMO_REWARD.displayAmount}</span>
          </div>
          <div className="audit-row">
            <span className="audit-label">Token</span>
            <span className="audit-value">{DEMO_REWARD.token.flagEmoji} {DEMO_REWARD.token.name}</span>
          </div>
          <div className="audit-row">
            <span className="audit-label">Campaign</span>
            <span className="audit-value">{DEMO_REWARD.campaignLabel}</span>
          </div>
          <div className="audit-row" style={{ borderBottom: "none" }}>
            <span className="audit-label">Network</span>
            <span className="audit-value">
              <CeloBadge variant="network" />
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#FFF0F0",
              border: "1px solid #FCA5A5",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              fontSize: 12,
              color: "#B91C1C",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            {error.message || "Transaction failed. Please try again."}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleClaim}
          disabled={isPending}
          style={{ marginBottom: 8 }}
        >
          {isPending ? "Claiming..." : `Claim ${DEMO_REWARD.displayAmount}`}
        </button>

        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Promotional rewards are distributed by Mangooal.
          <br />Not betting. No user-funded prize pools.
        </div>
      </div>
    </div>
  );
}
