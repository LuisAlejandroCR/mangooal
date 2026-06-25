import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { keccak256, toHex } from "viem";
import { useAccount } from "wagmi";
import { CeloBadge } from "../components/CeloBadge";
import { useCommitPrediction } from "../hooks/useMangoalLedger";

// Demo campaign ID — replace with backend-provided value after MangooalLedger deployment
const DEMO_CAMPAIGN_ID = keccak256(toHex("copa-america-2026"));

export function PredictionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { commit, txHash, isPending, error } = useCommitPrediction();
  const { isConnected } = useAccount();

  // Derive bytes32 matchId from URL param — real matchId comes from backend in production
  const matchId = keccak256(toHex(id ?? "match-demo"));

  const match = {
    home: "Colombia",
    away: "Brazil",
    homeFlag: "🇨🇴",
    awayFlag: "🇧🇷",
    competition: "Copa América 2026",
    kickoff: new Date(Date.now() + 3 * 3600000),
    id,
  };

  async function handleSubmit() {
    if (!home || !away) return;
    try {
      await commit({
        campaignId: DEMO_CAMPAIGN_ID,
        matchId,
        homeScore: Number(home),
        awayScore: Number(away),
      });
      setSubmitted(true);
    } catch {
      // error surfaces through the `error` state from useCommitPrediction
    }
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
        <span className="topbar-logo" style={{ fontSize: 17 }}>{match.competition}</span>
        <CeloBadge variant="network" />
      </div>

      <div className="screen-body" style={{ paddingTop: 20 }}>
        {submitted ? (
          <SubmittedView
            match={match}
            home={Number(home)}
            away={Number(away)}
            txHash={txHash}
            onAudit={() => navigate(`/audit/${id}`)}
          />
        ) : (
          <>
            {/* Teams */}
            <div className="card" style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 12 }}>
                {match.competition} · {match.kickoff.toLocaleDateString("en", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="match-teams">
                <div className="team-name">
                  <div style={{ fontSize: 36 }}>{match.homeFlag}</div>
                  {match.home}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-muted)" }}>vs</div>
                <div className="team-name">
                  <div style={{ fontSize: 36 }}>{match.awayFlag}</div>
                  {match.away}
                </div>
              </div>
            </div>

            {/* Coach Insight teaser */}
            <div
              className="coach-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/coach/${id}`)}
            >
              <div className="coach-label">🏅 Mangoal Coach insight</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>
                Data-based pick · Recent-form analysis
              </div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                Tap to see Coach's suggested score and match context →
              </div>
              <div className="coach-disclaimer">
                Insight only, not a guarantee. Coach Pass unlocks deeper analysis.
              </div>
            </div>

            {/* Score input */}
            <div className="section-title">Your forecast</div>
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{match.homeFlag}</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{match.home}</span>
              </div>

              <div className="score-input-row">
                <input
                  type="number"
                  min={0}
                  max={20}
                  className="score-input"
                  value={home}
                  onChange={(e) => setHome(e.target.value)}
                  placeholder="0"
                />
                <span className="score-vs">–</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  className="score-input"
                  value={away}
                  onChange={(e) => setAway(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 20 }}>{match.awayFlag}</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{match.away}</span>
              </div>

              {/* Error banner */}
              {error && (
                <div
                  style={{
                    background: "#FFF0F0",
                    border: "1px solid #FCA5A5",
                    borderRadius: 8,
                    padding: "10px 12px",
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
                onClick={handleSubmit}
                disabled={!home || !away || isPending || !isConnected}
              >
                {!isConnected
                  ? "Connect wallet to submit"
                  : isPending
                  ? "Waiting for confirmation..."
                  : "Submit prediction · Free"}
              </button>

              {!isConnected && (
                <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                  Open in MiniPay or connect a Celo wallet
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.6 }}>
              Your prediction will be recorded on Celo Mainnet for audit transparency.
              <br />It is not a bet. No entry fee. No prize pool.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SubmittedView({
  match, home, away, txHash, onAudit,
}: {
  match: { home: string; away: string; homeFlag: string; awayFlag: string };
  home: number;
  away: number;
  txHash?: `0x${string}`;
  onAudit: () => void;
}) {
  return (
    <div style={{ textAlign: "center", paddingTop: 32 }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🥭</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Prediction recorded!</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
        {match.homeFlag} {match.home} {home} – {away} {match.away} {match.awayFlag}
      </p>

      <div className="card" style={{ marginBottom: 14, textAlign: "left" }}>
        <div className="wallet-bar" style={{ marginBottom: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="7" fill="#35D07F" />
            <circle cx="7" cy="7" r="3.5" fill="white" />
          </svg>
          Recorded on Celo Mainnet
        </div>
        {txHash && (
          <div style={{ marginTop: 10, fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", wordBreak: "break-all" }}>
            {txHash}
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
          Your pick is committed on-chain. It cannot be edited after the prediction window closes.
        </div>
      </div>

      <button className="btn btn-secondary" onClick={onAudit} style={{ marginBottom: 10 }}>
        View on-chain audit
      </button>
    </div>
  );
}
