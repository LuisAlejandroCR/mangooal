import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CeloBadge } from "../components/CeloBadge";
import { useOnChainStats } from "../hooks/useOnChainStats";
import { analytics } from "../lib/analytics";
import { MANGOAL_LEDGER_ADDRESS, CONTRACT_LIVE } from "../hooks/useMangoalLedger";

function useElapsed(since: number | null): string {
  const [label, setLabel] = useState("—");
  useEffect(() => {
    if (!since) return;
    const tick = () => {
      const s = Math.floor((Date.now() - since) / 1000);
      setLabel(s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`);
    };
    tick();
    const id = setInterval(tick, 5_000);
    return () => clearInterval(id);
  }, [since]);
  return label;
}

function StatCard({ label, value, isLoading }: { label: string; value: number; isLoading: boolean }) {
  return (
    <div
      className="card"
      style={{ textAlign: "center", padding: "16px 12px", flex: "1 1 calc(50% - 8px)", minWidth: 0 }}
    >
      <div style={{ fontSize: 28, fontWeight: 900, color: "var(--green)", lineHeight: 1.1 }}>
        {isLoading ? "…" : value.toLocaleString()}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginTop: 4, letterSpacing: "0.04em" }}>
        {label}
      </div>
    </div>
  );
}

const CELOSCAN_URL = `https://celoscan.io/address/${MANGOAL_LEDGER_ADDRESS}`;

export function Stats() {
  const navigate = useNavigate();
  const stats = useOnChainStats();
  const elapsed = useElapsed(stats.lastUpdated);

  useEffect(() => {
    analytics.statsViewed();
  }, []);

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
        <span style={{ fontWeight: 800, fontSize: 16 }}>📊 Stats</span>
        <CeloBadge variant="network" />
      </div>

      <div className="screen-body" style={{ paddingTop: 20 }}>

        {/* Not deployed notice */}
        {!CONTRACT_LIVE && (
          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FCD34D",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              fontSize: 13,
              color: "#92400E",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            <strong>Launching soon.</strong> On-chain stats will appear here after the contract is deployed to Celo Mainnet.
          </div>
        )}

        {/* Hero metric */}
        <div
          style={{
            background: "linear-gradient(135deg, #176B3A 0%, #2E9E57 100%)",
            borderRadius: "var(--radius)",
            padding: "24px 20px",
            marginBottom: 16,
            color: "white",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.75, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Unique players
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>
            {stats.isLoading ? "…" : stats.uniquePlayers.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
            Celo Mainnet · lifetime
          </div>
        </div>

        {/* Supporting stats grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          <StatCard label="Predictions submitted" value={stats.totalPredictions} isLoading={stats.isLoading} />
          <StatCard label="Coach Passes sold" value={stats.coachPassSold} isLoading={stats.isLoading} />
          <StatCard label="Rewards claimed" value={stats.rewardsClaimed} isLoading={stats.isLoading} />
        </div>

        {/* Error */}
        {stats.error && (
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
            {stats.error}
          </div>
        )}

        {/* Refresh + last updated */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {stats.lastUpdated ? `Updated ${elapsed}` : "Loading…"}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => stats.refresh()}
            disabled={stats.isLoading || !CONTRACT_LIVE}
          >
            {stats.isLoading ? "Loading…" : "↻ Refresh"}
          </button>
        </div>

        {/* Celoscan verification */}
        {CONTRACT_LIVE && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Verify on-chain
            </div>
            <a
              href={CELOSCAN_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--green)", textDecoration: "none", fontWeight: 600 }}
            >
              MangooalLedger contract on Celoscan ↗
            </a>
            <div style={{ marginTop: 6, fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", wordBreak: "break-all" }}>
              {MANGOAL_LEDGER_ADDRESS}
            </div>
          </div>
        )}

        {/* Analytics note */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            fontSize: 12,
            color: "var(--text-muted)",
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: "var(--text)" }}>About these stats</strong>
          <br />
          On-chain metrics above are read directly from Celo Mainnet and refresh every 2 minutes.
          Session metrics (DAU, MAU, D1/D7/D30 retention) are tracked via PostHog and available in the operator dashboard.
        </div>

        {/* Celo footer */}
        <div className="wallet-bar" style={{ marginTop: 16 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="7" fill="#35D07F" />
            <circle cx="7" cy="7" r="3.5" fill="white" />
          </svg>
          On-chain data · Celo Mainnet · Chain ID 42220
        </div>

      </div>
    </div>
  );
}
