import { useParams } from "react-router-dom";
import { useAccount, useReadContracts } from "wagmi";
import { CeloBadge } from "../components/CeloBadge";
import { getMatchById, matchStatus } from "../config/matches";
import { MANGOAL_LEDGER_ABI } from "../contracts/mangoalLedger.abi";
import {
  MANGOAL_LEDGER_ADDRESS,
  CONTRACT_LIVE,
  getCommitTxHash,
} from "../hooks/useMangoalLedger";

type AuditStatus = "none" | "committed" | "locked" | "revealed" | "scored";

const STATUS_META: Record<
  AuditStatus,
  { label: string; dotClass: string; emoji: string }
> = {
  none:      { label: "No prediction",  dotClass: "dot-muted",  emoji: "⚪" },
  committed: { label: "Committed",       dotClass: "dot-yellow", emoji: "🔒" },
  locked:    { label: "Window locked",   dotClass: "dot-yellow", emoji: "⏳" },
  revealed:  { label: "Revealed",        dotClass: "dot-green",  emoji: "✅" },
  scored:    { label: "Scored",          dotClass: "dot-green",  emoji: "🎯" },
};

function StatusBadge({ status }: { status: AuditStatus }) {
  const { label, dotClass } = STATUS_META[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className={`status-dot ${dotClass}`} />
      {label}
    </span>
  );
}

type PredictionResult = {
  predictionHash: `0x${string}`;
  committedAt: bigint;
  revealedAt: bigint;
  homeScore: number;
  awayScore: number;
  revealed: boolean;
};

export function OnChainAudit() {
  const { id } = useParams<{ id: string }>();
  const { address: addr } = useAccount();
  const match = getMatchById(id ?? "");
  const now = Date.now();

  const contracts =
    addr && match && CONTRACT_LIVE
      ? [
          {
            address: MANGOAL_LEDGER_ADDRESS,
            abi: MANGOAL_LEDGER_ABI,
            functionName: "getPrediction" as const,
            args: [addr, match.campaignId, match.matchId] as const,
          },
          {
            address: MANGOAL_LEDGER_ADDRESS,
            abi: MANGOAL_LEDGER_ABI,
            functionName: "points" as const,
            args: [addr, match.campaignId, match.matchId] as const,
          },
        ]
      : [];

  const { data, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: !!addr && !!match && CONTRACT_LIVE,
      refetchInterval: 15_000,
    },
  });

  const pred =
    data?.[0]?.status === "success"
      ? (data[0].result as unknown as PredictionResult)
      : null;

  const pts =
    data?.[1]?.status === "success" ? Number(data[1].result) : null;

  const committed  = pred ? pred.committedAt > 0n : false;
  const revealed   = pred?.revealed ?? false;
  const pastLocked = match ? now >= match.lockedAt : false;

  let auditStatus: AuditStatus = "none";
  if (committed) {
    if (revealed) {
      auditStatus = pts !== null && pts > 0 ? "scored" : "revealed";
    } else if (pastLocked) {
      auditStatus = "locked";
    } else {
      auditStatus = "committed";
    }
  }

  const commitTxHash =
    addr && match ? getCommitTxHash(match.matchId, addr) : null;

  if (!match) {
    return (
      <div className="screen">
        <div className="topbar">
          <span style={{ fontWeight: 800, fontSize: 16 }}>On-chain audit</span>
          <CeloBadge variant="network" />
        </div>
        <div
          className="screen-body"
          style={{ paddingTop: 40, textAlign: "center", color: "var(--text-muted)" }}
        >
          Match not found
        </div>
      </div>
    );
  }

  const mStatus = matchStatus(match);

  return (
    <div className="screen">
      <div className="topbar">
        <span style={{ fontWeight: 800, fontSize: 16 }}>On-chain audit</span>
        <CeloBadge variant="network" />
      </div>

      <div className="screen-body" style={{ paddingTop: 20 }}>
        {/* Status hero */}
        <div className="card" style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>
            {STATUS_META[auditStatus].emoji}
          </div>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
            {auditStatus === "none"
              ? "No prediction recorded yet"
              : "Prediction recorded on Celo Mainnet"}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <CeloBadge variant="network" />
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {match.homeFlag} {match.home} vs {match.awayFlag} {match.away}
            {" · "}
            {mStatus === "live"
              ? "Match in progress"
              : mStatus === "finished"
              ? "Match finished"
              : mStatus === "locked"
              ? "Window locked"
              : "Predictions open"}
          </div>
        </div>

        {/* Audit rows */}
        <div className="section-title">Prediction audit trail</div>
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="audit-row">
            <span className="audit-label">Status</span>
            <span className="audit-value">
              {isLoading ? (
                <span style={{ color: "var(--text-muted)" }}>Loading…</span>
              ) : (
                <StatusBadge status={auditStatus} />
              )}
            </span>
          </div>

          <div className="audit-row">
            <span className="audit-label">Campaign</span>
            <span className="audit-value">Copa América 2026</span>
          </div>

          <div className="audit-row">
            <span className="audit-label">Match</span>
            <span className="audit-value">
              {match.home} vs {match.away}
            </span>
          </div>

          {addr && (
            <div className="audit-row">
              <span className="audit-label">Wallet</span>
              <span
                className="audit-value"
                style={{ fontFamily: "monospace", fontSize: 12 }}
              >
                {addr.slice(0, 6)}…{addr.slice(-4)}
              </span>
            </div>
          )}

          {committed && pred && (
            <div className="audit-row">
              <span className="audit-label">Committed</span>
              <span className="audit-value">
                {new Date(Number(pred.committedAt) * 1000).toLocaleString()}
              </span>
            </div>
          )}

          {revealed && pred && (
            <div className="audit-row">
              <span className="audit-label">Revealed</span>
              <span className="audit-value">
                {new Date(Number(pred.revealedAt) * 1000).toLocaleString()}
              </span>
            </div>
          )}

          {revealed && pred && (
            <div className="audit-row">
              <span className="audit-label">Score pick</span>
              <span className="audit-value" style={{ fontWeight: 800 }}>
                {match.homeFlag} {pred.homeScore} – {pred.awayScore}{" "}
                {match.awayFlag}
              </span>
            </div>
          )}

          {auditStatus === "scored" && pts !== null && (
            <div className="audit-row">
              <span className="audit-label">Points</span>
              <span
                className="audit-value"
                style={{ fontWeight: 800, color: "var(--green)" }}
              >
                {pts} pts
              </span>
            </div>
          )}

          <div className="audit-row" style={{ borderBottom: "none" }}>
            <span className="audit-label">Tx hash</span>
            {commitTxHash ? (
              <a
                href={`https://celoscan.io/tx/${commitTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--green)",
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {commitTxHash.slice(0, 14)}…
              </a>
            ) : (
              <span
                className="audit-value"
                style={{ color: "var(--text-muted)", fontSize: 12 }}
              >
                {committed ? "Available on committing device" : "—"}
              </span>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="section-title">How commit-reveal works</div>
        <div className="card">
          {[
            {
              step: "1",
              title: "Commit",
              desc: "Before kickoff, a hash of your score pick is stored on-chain. Your actual score is hidden.",
            },
            {
              step: "2",
              title: "Lock",
              desc: "At prediction lock time, no edits are possible. The hash remains sealed until reveal.",
            },
            {
              step: "3",
              title: "Reveal",
              desc: "After kickoff, you reveal your score. The contract verifies it matches the committed hash.",
            },
            {
              step: "4",
              title: "Score",
              desc: "Points are calculated from on-chain Celo events and recorded back on-chain.",
            },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 0",
                borderBottom:
                  item.step !== "4" ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--yellow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {item.step}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 16,
            lineHeight: 1.6,
          }}
        >
          On-chain audit verifies timing and integrity.
          <br />
          It is not a bet. No funds are at risk.
        </div>
      </div>
    </div>
  );
}
