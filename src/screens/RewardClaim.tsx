import { useNavigate, useSearchParams } from "react-router-dom";
import { formatUnits } from "viem";
import { CeloBadge } from "../components/CeloBadge";
import { useClaimReward } from "../hooks/useMangoalLedger";
import { STABLECOINS } from "../config/stablecoins";
import { parseContractError } from "../utils/parseContractError";

/**
 * Reward deep-link format (operator sends via notification):
 *   /claim?cid=<bytes32-campaignId>&token=<tokenAddress>&amount=<rawBigInt>&nonce=<uint256>&sig=<operatorSig>&label=Copa+Am%C3%A9rica+2026
 *
 * Operator signature: EIP-712 digest over
 *   Claim(address wallet, bytes32 campaignId, address token, uint256 amount, uint256 nonce)
 * bound to MangooalLedger's DOMAIN_SEPARATOR (chainId=42220, address(this)).
 */
export function RewardClaim() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { claim, txHash, isPending, error } = useClaimReward();

  const cid       = searchParams.get("cid") as `0x${string}` | null;
  const tokenAddr = searchParams.get("token") as `0x${string}` | null;
  const rawAmount = searchParams.get("amount");
  const rawNonce  = searchParams.get("nonce");
  const sig       = searchParams.get("sig") as `0x${string}` | null;
  const label     = searchParams.get("label") ?? "FIFA World Cup 2026";

  const amount = rawAmount ? BigInt(rawAmount) : null;
  const nonce  = rawNonce != null ? BigInt(rawNonce) : null;
  const tokenInfo = tokenAddr
    ? Object.values(STABLECOINS).find(
        (s) => s.address.toLowerCase() === tokenAddr.toLowerCase()
      )
    : null;
  const displayAmount =
    amount && tokenInfo
      ? `${formatUnits(amount, tokenInfo.decimals)} ${tokenInfo.symbol}`
      : null;

  const isValid = !!cid && !!tokenAddr && !!amount && nonce != null && !!sig;

  async function handleClaim() {
    if (!isValid) return;
    try {
      await claim({
        campaignId: cid!,
        token: tokenAddr!,
        amount: amount!,
        nonce: nonce!,
        operatorSignature: sig!,
      });
    } catch {
      // error surfaces through `error` state
    }
  }

  // Invalid / incomplete deep link
  if (!isValid) {
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
        <div className="screen-body" style={{ paddingTop: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>
            Invalid reward link
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.7,
              maxWidth: 280,
              margin: "0 auto 24px",
            }}
          >
            This link is incomplete or has expired. Reward links are sent by Mangooal
            via notification to eligible users only.
          </div>
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            Back to picks
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (txHash) {
    return (
      <div className="screen">
        <div className="screen-body" style={{ paddingTop: 48, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🥭🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Reward claimed!</h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            {displayAmount ?? "Reward"} sent to your wallet on Celo.
          </p>
          <div className="card" style={{ marginBottom: 16, textAlign: "left" }}>
            <div className="wallet-bar" style={{ marginBottom: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="7" fill="#35D07F" />
                <circle cx="7" cy="7" r="3.5" fill="white" />
              </svg>
              Confirmed on Celo
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                fontFamily: "monospace",
                color: "var(--text-muted)",
                wordBreak: "break-all",
              }}
            >
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

  // Claim form
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
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              opacity: 0.7,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>
            {displayAmount ?? "Reward"}
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
            <span className="audit-value" style={{ fontWeight: 800 }}>
              {displayAmount ?? "—"}
            </span>
          </div>
          <div className="audit-row">
            <span className="audit-label">Token</span>
            <span className="audit-value">
              {tokenInfo
                ? `${tokenInfo.flagEmoji} ${tokenInfo.name}`
                : tokenAddr?.slice(0, 10) + "…"}
            </span>
          </div>
          <div className="audit-row">
            <span className="audit-label">Campaign</span>
            <span className="audit-value">{label}</span>
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
            {parseContractError(error, "Claim failed. Please try again.")}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleClaim}
          disabled={isPending}
          style={{ marginBottom: 8 }}
        >
          {isPending ? "Claiming…" : `Claim ${displayAmount ?? "reward"}`}
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          Promotional rewards are distributed by Mangooal.
          <br />
          Not betting. No user-funded prize pools.
        </div>
      </div>
    </div>
  );
}
