import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAccount, useReadContracts } from "wagmi";
import { isAddress } from "viem";
import { MANGOAL_LEDGER_ABI } from "../contracts/mangoalLedger.abi";
import { MANGOAL_LEDGER_ADDRESS, CONTRACT_LIVE } from "../hooks/useMangoalLedger";
import { getMatchById, matchStatus, CAMPAIGN_ID } from "../config/matches";
import { CeloBadge } from "../components/CeloBadge";

// ── Types (mirror useMyPicks.ts) ──────────────────────────────────────────────

type PublicPickResult = {
  homeScore: number; awayScore: number; status: number;
  points: number; submittedAt: bigint; updatedAt: bigint;
  version: number; outcomeCode: number; scored: boolean;
};

type PredictionResult = {
  predictionHash: `0x${string}`; committedAt: bigint; revealedAt: bigint;
  homeScore: number; awayScore: number; revealed: boolean;
};

const PICK_NONE = 0;
const PICK_VOID = 4;

type PickState = {
  hasSubmitted: boolean;
  isVisible: boolean;
  homeScore: number | null;
  awayScore: number | null;
  points: number | null;
};

function resolvePickState(
  pick: PublicPickResult | null,
  pred: PredictionResult | null,
  isOpen: boolean
): PickState {
  if (pick && pick.submittedAt > 0n && pick.status !== PICK_NONE && pick.status !== PICK_VOID) {
    return {
      hasSubmitted: true,
      // Hide during open window so picks stay independent
      isVisible: !isOpen,
      homeScore: pick.homeScore,
      awayScore: pick.awayScore,
      points: pick.scored ? pick.points : null,
    };
  }
  if (pred && pred.committedAt > 0n) {
    return {
      hasSubmitted: true,
      isVisible: pred.revealed,
      homeScore: pred.revealed ? pred.homeScore : null,
      awayScore: pred.revealed ? pred.awayScore : null,
      points: null,
    };
  }
  return { hasSubmitted: false, isVisible: false, homeScore: null, awayScore: null, points: null };
}

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function BackArrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ScoreCard({
  label, state, isMe,
}: {
  label: string;
  state: PickState;
  isMe?: boolean;
}) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        {label}
      </div>
      {state.hasSubmitted ? (
        state.isVisible && state.homeScore !== null ? (
          <>
            <div style={{ fontSize: 28, fontWeight: 900, color: isMe ? "var(--green)" : "var(--text)", lineHeight: 1 }}>
              {state.homeScore}–{state.awayScore}
            </div>
            {state.points !== null && (
              <div style={{ fontSize: 13, fontWeight: 700, color: state.points > 0 ? "var(--success)" : "var(--text-muted)", marginTop: 4 }}>
                {state.points} pts
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
            {state.isVisible ? "No score yet" : "Sealed"}
          </div>
        )
      ) : (
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>No pick</div>
      )}
    </div>
  );
}

export function Challenge() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  const challengerParam = searchParams.get("challenger") ?? "";
  const challengerAddr = isAddress(challengerParam) ? (challengerParam as `0x${string}`) : null;
  const isSelf = !!(address && challengerAddr && address.toLowerCase() === challengerAddr.toLowerCase());
  const registeredMatch = getMatchById(id ?? "");

  const isOpen = registeredMatch ? Date.now() < registeredMatch.lockedAt : false;
  const status = registeredMatch ? matchStatus(registeredMatch) : null;

  const ZERO = "0x0000000000000000000000000000000000000000" as `0x${string}`;
  const cAddr = challengerAddr ?? ZERO;
  const vAddr = (address ?? ZERO) as `0x${string}`;
  const matchId = registeredMatch?.matchId ?? (ZERO as `0x${string}`);

  const { data } = useReadContracts({
    contracts: [
      { address: MANGOAL_LEDGER_ADDRESS, abi: MANGOAL_LEDGER_ABI, functionName: "getPick" as const,       args: [cAddr, CAMPAIGN_ID, matchId] as const },
      { address: MANGOAL_LEDGER_ADDRESS, abi: MANGOAL_LEDGER_ABI, functionName: "getPrediction" as const, args: [cAddr, CAMPAIGN_ID, matchId] as const },
      { address: MANGOAL_LEDGER_ADDRESS, abi: MANGOAL_LEDGER_ABI, functionName: "getPick" as const,       args: [vAddr, CAMPAIGN_ID, matchId] as const },
      { address: MANGOAL_LEDGER_ADDRESS, abi: MANGOAL_LEDGER_ABI, functionName: "getPrediction" as const, args: [vAddr, CAMPAIGN_ID, matchId] as const },
    ],
    query: { enabled: !!challengerAddr && !!registeredMatch && CONTRACT_LIVE },
  });

  const cPickRaw = data?.[0]?.status === "success" ? (data[0].result as unknown as PublicPickResult) : null;
  const cPredRaw = data?.[1]?.status === "success" ? (data[1].result as unknown as PredictionResult) : null;
  const mPickRaw = data?.[2]?.status === "success" ? (data[2].result as unknown as PublicPickResult) : null;
  const mPredRaw = data?.[3]?.status === "success" ? (data[3].result as unknown as PredictionResult) : null;

  const cState = resolvePickState(cPickRaw, cPredRaw, isOpen);
  const mState = resolvePickState(mPickRaw, mPredRaw, isOpen);

  const winner =
    cState.points !== null && mState.points !== null
      ? mState.points > cState.points ? "me"
        : cState.points > mState.points ? "challenger"
        : "draw"
      : null;

  async function handleShareChallenge() {
    if (!address || !registeredMatch) return;
    const url = `${window.location.origin}/challenge/${registeredMatch.id}?challenger=${address}`;
    const text = `⚽ Can you beat my pick?\n${registeredMatch.home} vs ${registeredMatch.away} · ${registeredMatch.competition}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mangooal challenge", text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2_000);
      }
    } catch { }
  }

  // ── Error states ────────────────────────────────────────────────────────────
  if (!registeredMatch || !challengerAddr) {
    return (
      <div className="screen">
        <div className="topbar">
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
            <BackArrow />
          </button>
          <span style={{ fontWeight: 800 }}>Challenge</span>
          <span />
        </div>
        <div className="screen-body" style={{ paddingTop: 40, textAlign: "center", color: "var(--text-muted)" }}>
          {!registeredMatch ? "Match not found." : "Invalid challenge link."}
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="screen">
      <div className="topbar">
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
          <BackArrow />
        </button>
        <span style={{ fontWeight: 800, fontSize: 16 }}>⚔️ Head-to-head</span>
        <CeloBadge variant="network" />
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>

        {/* Match card */}
        <div className="card" style={{ marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            {registeredMatch.competition}
          </div>
          <div className="match-teams" style={{ pointerEvents: "none" }}>
            <div className="team-name">
              <span className="team-emoji" aria-hidden="true">{registeredMatch.homeFlag}</span>
              {registeredMatch.home}
            </div>
            <div style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: 14 }}>vs</div>
            <div className="team-name">
              <span className="team-emoji" aria-hidden="true">{registeredMatch.awayFlag}</span>
              {registeredMatch.away}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            {new Date(registeredMatch.kickoffAt).toLocaleString("en", {
              weekday: "short", month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit", timeZoneName: "short",
            })}
          </div>
        </div>

        {/* Self-view: show the share link they can copy */}
        {isSelf && (
          <div className="card" style={{ marginBottom: 12, background: "#F0FDF4", border: "1px solid #86EFAC" }}>
            <div style={{ fontSize: 13, color: "var(--green-dark)", lineHeight: 1.6, marginBottom: 12 }}>
              This is your challenge link. Share it with a friend to compete head-to-head.
            </div>
            <button
              onClick={handleShareChallenge}
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {copied ? "Link copied!" : "Share challenge link"}
            </button>
          </div>
        )}

        {/* Pre-lock: accept challenge prompt */}
        {isOpen && !isSelf && (
          <div className="card" style={{ marginBottom: 12, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚔️</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
              {short(challengerAddr)} challenged you!
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
              {cState.hasSubmitted
                ? "Their pick is sealed until after kickoff. Submit yours — picks stay hidden until the window closes so neither side can copy."
                : "They haven't submitted yet. Get your pick in first!"}
            </div>
            {!mState.hasSubmitted ? (
              <button className="btn btn-primary" onClick={() => navigate(`/match/${registeredMatch.id}`)}>
                Submit my pick — free
              </button>
            ) : (
              <div style={{ fontSize: 13, color: "var(--success)", fontWeight: 700 }}>
                Your pick is in. Come back after kickoff to compare.
              </div>
            )}
          </div>
        )}

        {/* Post-lock: head-to-head comparison */}
        {!isOpen && (
          <div className="card" style={{ marginBottom: 12 }}>
            {winner === "me" && (
              <div style={{ background: "var(--success)", color: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 14 }}>
                🏆 You win this round!
              </div>
            )}
            {winner === "challenger" && (
              <div style={{ background: "#94A3B8", color: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 14 }}>
                🎖️ {short(challengerAddr)} wins this round
              </div>
            )}
            {winner === "draw" && (
              <div style={{ background: "#F59E0B", color: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 14 }}>
                🤝 Equal points — it's a draw!
              </div>
            )}

            <div style={{ display: "flex", gap: 16, justifyContent: "space-around", alignItems: "flex-start" }}>
              <ScoreCard
                label={isSelf ? "You (challenger)" : short(challengerAddr)}
                state={cState}
              />
              <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch", flexShrink: 0 }} />
              <ScoreCard
                label="You"
                state={isConnected ? mState : { hasSubmitted: false, isVisible: false, homeScore: null, awayScore: null, points: null }}
                isMe
              />
            </div>

            {/* Pending hints */}
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.7 }}>
              {!cState.isVisible && cState.hasSubmitted && (
                <div>Challenger's pick sealed — visible after they reveal on-chain.</div>
              )}
              {!isConnected && (
                <div>Connect your wallet to see your side of the challenge.</div>
              )}
              {isConnected && !mState.hasSubmitted && status !== "finished" && (
                <div>
                  You didn't submit a pick for this match.{" "}
                  <button
                    onClick={() => navigate(`/match/${registeredMatch.id}`)}
                    style={{ background: "none", border: "none", color: "var(--green)", fontWeight: 700, cursor: "pointer", fontSize: 12, padding: 0 }}
                  >
                    View match →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Always-visible: re-challenge or audit */}
        {!isSelf && !isOpen && winner && (
          <button
            className="btn btn-secondary"
            style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            onClick={handleShareChallenge}
          >
            ⚔️ {copied ? "Link copied!" : "Challenge them again"}
          </button>
        )}

        <button
          onClick={() => navigate(`/audit/${registeredMatch.id}`)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--text-muted)", display: "block", width: "100%", textAlign: "center", paddingTop: 4 }}
        >
          View on-chain audit →
        </button>
      </div>
    </div>
  );
}
