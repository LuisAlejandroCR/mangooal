import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { CeloBadge } from "../components/CeloBadge";
import type { MatchData } from "../components/MatchCard";
import { useCommitPrediction } from "../hooks/useMangoalLedger";
import { getMatchById, matchStatus } from "../config/matches";
import { findMatch, useEspnScores } from "../hooks/useEspnScores";

function toEspnDateUTC(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function isInsufficientFunds(err: Error | null): boolean {
  if (!err) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("insufficient") || msg.includes("not enough") || msg.includes("balance");
}

function TeamMark({ value }: { value?: string | null }) {
  if (!value) return null;
  if (value.startsWith("http")) {
    return <img className="team-logo detail-logo" src={value} alt="" aria-hidden="true" loading="lazy" />;
  }
  if (value.length > 4 && !/^[A-Z]{2,4}$/.test(value)) {
    return <span className="team-emoji" aria-hidden="true">{value}</span>;
  }
  return null;
}

export function PredictionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useAccount();
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { commit, txHash, isPending, error } = useCommitPrediction();

  const registeredMatch = getMatchById(id ?? "");
  const stateMatch = (location.state as { match?: MatchData } | null)?.match;
  const activeMatch = registeredMatch ?? stateMatch;
  const activeKickoffAt = registeredMatch?.kickoffAt ?? stateMatch?.kickoff.getTime() ?? 0;
  const activeLockedAt = registeredMatch?.lockedAt ?? stateMatch?.lockedAt.getTime() ?? 0;
  const matchDate = activeMatch ? toEspnDateUTC(new Date(activeKickoffAt)) : undefined;
  const { matches: espnMatches } = useEspnScores("fifa.world", matchDate);
  const liveMatch = activeMatch ? findMatch(espnMatches, activeMatch.home, activeMatch.away) : null;
  const status = registeredMatch ? matchStatus(registeredMatch) : stateMatch?.status ?? null;
  const isOpen = activeMatch ? Date.now() < activeLockedAt : false;
  const homeName = liveMatch?.home ?? activeMatch?.home ?? "";
  const awayName = liveMatch?.away ?? activeMatch?.away ?? "";
  const homeMark = liveMatch?.homeLogo ?? activeMatch?.homeFlag;
  const awayMark = liveMatch?.awayLogo ?? activeMatch?.awayFlag;

  if (!activeMatch) {
    return (
      <div className="screen">
        <div className="topbar">
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }} aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <CeloBadge variant="network" />
        </div>
        <div className="screen-body" style={{ paddingTop: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Match not found
        </div>
      </div>
    );
  }

  async function handleSubmit() {
    if (!home || !away || !activeMatch) return;

    if (!registeredMatch) {
      localStorage.setItem(
        `mangooal:preview-pick:${activeMatch.id}`,
        JSON.stringify({ homeScore: Number(home), awayScore: Number(away), savedAt: Date.now() })
      );
      setSubmitted(true);
      return;
    }

    try {
      await commit({
        campaignId: registeredMatch.campaignId,
        matchId: registeredMatch.matchId,
        homeScore: Number(home),
        awayScore: Number(away),
      });
      setSubmitted(true);
    } catch {
      // error surfaces through the hook state
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
        <span className="topbar-logo" style={{ fontSize: 17 }}>{activeMatch.competition}</span>
        <CeloBadge variant="network" />
      </div>

      <div className="screen-body" style={{ paddingTop: 20 }}>
        {submitted ? (
          <SubmittedView
            match={{ id: activeMatch.id, home: homeName, away: awayName }}
            home={Number(home)}
            away={Number(away)}
            txHash={txHash}
            onAudit={() => registeredMatch ? navigate(`/audit/${registeredMatch.id}`) : navigate(-1)}
          />
        ) : (
          <>
            <div className="forecast-match-card">
              <div className="forecast-date">
                {activeMatch.competition} � {new Date(activeKickoffAt).toLocaleString("en", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="match-teams">
                <div className="team-name">
                  <TeamMark value={homeMark} />
                  {homeName}
                </div>
                <div className="score-vs">vs</div>
                <div className="team-name">
                  <TeamMark value={awayMark} />
                  {awayName}
                </div>
              </div>

              {!isOpen && (
                <div className="forecast-lock-note">
                  Predictions are closed � {status === "live" ? "Match in progress" : status === "finished" ? "Match finished" : "Window locked"}
                </div>
              )}
            </div>

            <div
              className="coach-card coach-compact-link"
              onClick={() => registeredMatch && navigate(`/coach/${registeredMatch.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && registeredMatch) navigate(`/coach/${registeredMatch.id}`);
              }}
            >
              <div className="coach-label">Mangooal Coach insight</div>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 6 }}>
                Data-based pick � Recent-form analysis
              </div>
              <div style={{ fontSize: 13, opacity: 0.82, marginTop: 4 }}>
                {registeredMatch ? "Tap for suggested score and match context" : "Coach insight opens when this match is registered"}
              </div>
            </div>

            {isOpen && (
              <>
                <div className="section-title">Your forecast</div>
                <div className="card forecast-input-card">
                  <div className="forecast-teams-line">
                    <span>{homeName}</span>
                    <span>{awayName}</span>
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
                    <span className="score-vs">-</span>
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

                  {error && (
                    <div className="hint-card error">
                      {error.message || "Transaction failed. Please try again."}
                      {isInsufficientFunds(error) && (
                        <div style={{ marginTop: 6 }}>
                          <a href="https://link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT" target="_blank" rel="noopener noreferrer">
                            Add funds in MiniPay
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={!home || !away || isPending || (!!registeredMatch && !isConnected)}
                  >
                    {registeredMatch && !isConnected
                      ? "Connect wallet to submit"
                      : isPending
                        ? "Waiting for confirmation..."
                        : "Submit prediction � Free"}
                  </button>

                  {registeredMatch && !isConnected && (
                    <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                      Open in MiniPay or connect a Celo wallet
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.6 }}>
                  Your prediction will be recorded on Celo for audit transparency.
                  <br />It is not a bet. No entry fee. No prize pool.
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SubmittedView({
  match, home, away, txHash, onAudit,
}: {
  match: { home: string; away: string; id: string };
  home: number;
  away: number;
  txHash?: `0x${string}`;
  onAudit: () => void;
}) {
  return (
    <div style={{ textAlign: "center", paddingTop: 32 }}>
      <div className="success-mark" style={{ marginBottom: 12 }}>OK</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Prediction recorded!</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
        {match.home} {home} - {away} {match.away}
      </p>

      <div className="card" style={{ marginBottom: 14, textAlign: "left" }}>
        <div className="wallet-bar" style={{ marginBottom: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="7" fill="#35D07F" />
            <circle cx="7" cy="7" r="3.5" fill="white" />
          </svg>
          Recorded on Celo
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