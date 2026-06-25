import { useParams } from "react-router-dom";
import { CeloBadge } from "../components/CeloBadge";

type AuditStatus = "committed" | "revealed" | "locked" | "scored";

function StatusBadge({ status }: { status: AuditStatus }) {
  const map: Record<AuditStatus, { label: string; dotClass: string }> = {
    committed: { label: "Committed", dotClass: "dot-yellow" },
    revealed: { label: "Revealed", dotClass: "dot-green" },
    locked: { label: "Locked", dotClass: "dot-yellow" },
    scored: { label: "Scored", dotClass: "dot-green" },
  };
  const { label, dotClass } = map[status];
  return (
    <span>
      <span className={`status-dot ${dotClass}`} />
      {label}
    </span>
  );
}

export function OnChainAudit() {
  const { id } = useParams();

  // Mock audit data — replace with on-chain read via MangooalLedger.getPrediction()
  const audit = {
    status: "committed" as AuditStatus,
    txHash: "0xabc123...def456",
    campaignId: "copa-2026",
    matchId: id ?? "m1",
    committedAt: new Date().toISOString(),
    revealedAt: null as string | null,
    wallet: "0xC720...3b66",
    blockNumber: "31234567",
    celoExplorerBase: "https://celoscan.io/tx/",
  };

  return (
    <div className="screen">
      <div className="topbar">
        <span style={{ fontWeight: 800, fontSize: 16 }}>On-chain audit</span>
        <CeloBadge variant="network" />
      </div>

      <div className="screen-body" style={{ paddingTop: 20 }}>
        {/* Status hero */}
        <div className="card" style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
            Your prediction is recorded on Celo Mainnet
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <CeloBadge variant="network" />
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            On-chain audit helps verify timing and integrity.
            It is not betting.
          </div>
        </div>

        {/* Audit rows */}
        <div className="section-title">Prediction audit trail</div>
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="audit-row">
            <span className="audit-label">Status</span>
            <span className="audit-value">
              <StatusBadge status={audit.status} />
            </span>
          </div>
          <div className="audit-row">
            <span className="audit-label">Campaign</span>
            <span className="audit-value">{audit.campaignId}</span>
          </div>
          <div className="audit-row">
            <span className="audit-label">Match</span>
            <span className="audit-value">{audit.matchId}</span>
          </div>
          <div className="audit-row">
            <span className="audit-label">Wallet</span>
            <span className="audit-value" style={{ fontFamily: "monospace", fontSize: 12 }}>
              {audit.wallet}
            </span>
          </div>
          <div className="audit-row">
            <span className="audit-label">Block</span>
            <span className="audit-value">#{audit.blockNumber}</span>
          </div>
          <div className="audit-row">
            <span className="audit-label">Committed</span>
            <span className="audit-value">{new Date(audit.committedAt).toLocaleString()}</span>
          </div>
          {audit.revealedAt && (
            <div className="audit-row">
              <span className="audit-label">Revealed</span>
              <span className="audit-value">{new Date(audit.revealedAt).toLocaleString()}</span>
            </div>
          )}
          <div className="audit-row" style={{ borderBottom: "none" }}>
            <span className="audit-label">Tx hash</span>
            <a
              href={`${audit.celoExplorerBase}${audit.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--green)", fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}
            >
              {audit.txHash.slice(0, 16)}…
            </a>
          </div>
        </div>

        {/* How it works */}
        <div className="section-title">How commit-reveal works</div>
        <div className="card">
          {[
            { step: "1", title: "Commit", desc: "Before kickoff, a hash of your score pick is stored on-chain. Your actual score is hidden." },
            { step: "2", title: "Lock", desc: "At prediction lock time, no edits are possible. The hash remains sealed until reveal." },
            { step: "3", title: "Reveal", desc: "After kickoff, you reveal your score. The contract verifies it matches the committed hash." },
            { step: "4", title: "Score", desc: "Points are calculated by the backend indexing Celo events and recorded on-chain." },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 0",
                borderBottom: item.step !== "4" ? "1px solid var(--border)" : "none",
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
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
