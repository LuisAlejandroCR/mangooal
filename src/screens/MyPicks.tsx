import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { CeloBadge } from "../components/CeloBadge";
import { useRevealPrediction } from "../hooks/useMangoalLedger";
import { useMyPicks, type PickEntry, type PickStatus } from "../hooks/useMyPicks";
import type { MatchConfig } from "../config/matches";

const STATUS_LABELS: Record<PickStatus, { text: string; color: string }> = {
  none:      { text: "Not submitted",          color: "var(--text-muted)" },
  committed: { text: "Waiting for result",     color: "var(--text-muted)" },
  revealed:  { text: "Revealed · Scoring soon", color: "var(--green)" },
  scored:    { text: "Scored",                 color: "var(--success)" },
};

function RevealButton({ match }: { match: MatchConfig }) {
  const { isConnected } = useAccount();
  const { reveal, txHash, isPending, error } = useRevealPrediction();

  if (txHash) {
    return (
      <div style={{ fontSize: 11, color: "var(--success)", marginTop: 8, fontWeight: 700 }}>
        ✓ Revealed on Celo
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button
        className="btn btn-secondary btn-sm"
        disabled={isPending || !isConnected}
        onClick={async () => {
          try {
            await reveal({ campaignId: match.campaignId, matchId: match.matchId });
          } catch {
            // error surfaces in the error state below
          }
        }}
      >
        {isPending ? "Revealing..." : "Reveal prediction"}
      </button>
      {error && (
        <div style={{ fontSize: 11, color: "#B91C1C", marginTop: 4 }}>
          {error.message}
        </div>
      )}
    </div>
  );
}

function PickCard({ entry }: { entry: PickEntry }) {
  const navigate = useNavigate();
  const { match, status, homeScore, awayScore, points, canReveal, hasSalt } = entry;
  const statusMeta = STATUS_LABELS[status];
  const isExact =
    status === "scored" &&
    homeScore !== null &&
    awayScore !== null;

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: statusMeta.color, fontWeight: 700 }}>
          {statusMeta.text}
        </span>
        {points !== null && points > 0 && (
          <span style={{ fontWeight: 800, color: isExact ? "var(--success)" : "var(--text)", fontSize: 15 }}>
            {isExact ? "🎯 " : ""}{points} pts
          </span>
        )}
      </div>

      <div
        className="match-teams"
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`/audit/${match.id}`)}
      >
        <div className="team-name" style={{ fontSize: 13 }}>
          <div style={{ fontSize: 22, marginBottom: 2 }}>{match.homeFlag}</div>
          {match.home}
        </div>
        <div style={{ textAlign: "center" }}>
          {homeScore !== null ? (
            <div style={{ fontWeight: 800, fontSize: 18, color: "var(--green)" }}>
              {homeScore} – {awayScore}
            </div>
          ) : (
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-muted)" }}>
              Committed
            </div>
          )}
        </div>
        <div className="team-name" style={{ fontSize: 13 }}>
          <div style={{ fontSize: 22, marginBottom: 2 }}>{match.awayFlag}</div>
          {match.away}
        </div>
      </div>

      <div
        style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
        onClick={() => navigate(`/audit/${match.id}`)}
      >
        <CeloBadge variant="network" />
        <span>Tap to view on-chain audit</span>
      </div>

      {/* Reveal: only show when past lockedAt and not yet revealed */}
      {canReveal && hasSalt && <RevealButton match={match} />}
      {canReveal && !hasSalt && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
          Reveal data not found on this device. Open on the device where you submitted the prediction.
        </div>
      )}
    </div>
  );
}

export function MyPicks() {
  const { picks, isLoading } = useMyPicks();
  const activePicks = picks.filter((p) => p.status !== "none");
  const totalPoints = activePicks.reduce((s, p) => s + (p.points ?? 0), 0);

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-logo">⚽ <span>Mangoo</span>al</span>
        <CeloBadge variant="network" />
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>
        {/* Summary card */}
        {activePicks.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Total points</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "var(--green)" }}>{totalPoints}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Picks</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{activePicks.length}</div>
              </div>
            </div>
          </div>
        )}

        <div className="section-title">My predictions</div>

        {isLoading ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 16px" }}>
            Loading…
          </div>
        ) : activePicks.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "24px 16px" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⚽</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>No picks yet</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Head to the Predictions tab and submit your first pick — it's free!
            </div>
          </div>
        ) : (
          activePicks.map((entry) => <PickCard key={entry.match.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
