import { useNavigate, useParams } from "react-router-dom";
import { CeloBadge } from "../components/CeloBadge";

export function CoachInsight() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock insight data — replace with real sports API response
  const insight = {
    home: "Colombia",
    away: "Brazil",
    homeFlag: "🇨🇴",
    awayFlag: "🇧🇷",
    suggestedScore: "2 – 1",
    freeInsight: {
      formHome: "W W D L W",
      formAway: "W W W D W",
      recentTrend: "Colombia have scored in each of the last 5 home fixtures. Brazil are unbeaten in the last 8 qualifiers.",
    },
    premiumLocked: true, // true = user has no Coach Pass
  };

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
        <span style={{ fontWeight: 800, fontSize: 16 }}>🏅 Mangoal Coach</span>
        <CeloBadge variant="built" />
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>
        {/* Teams */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>
            {insight.homeFlag} vs {insight.awayFlag}
          </div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>
            {insight.home} vs {insight.away}
          </div>
        </div>

        {/* Suggested score */}
        <div className="coach-card">
          <div className="coach-label">🏅 Mangoal Coach · Suggested score</div>
          <div className="coach-score">{insight.suggestedScore}</div>
          <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>
            Data-based pick · Recent-form analysis
          </div>
          <div className="coach-disclaimer">
            Insight only, not a guarantee. This is match context, not a betting tip.
            No odds. Not a wager.
          </div>
        </div>

        {/* Free insight */}
        <div className="section-title">Match context</div>
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 4 }}>
                {insight.homeFlag} {insight.home} · Last 5
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>
                {insight.freeInsight.formHome.split(" ").map((r, i) => (
                  <span
                    key={i}
                    style={{ color: r === "W" ? "var(--success)" : r === "L" ? "#EF4444" : "var(--text-muted)" }}
                  >
                    {r}{" "}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 4 }}>
                {insight.awayFlag} {insight.away} · Last 5
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>
                {insight.freeInsight.formAway.split(" ").map((r, i) => (
                  <span
                    key={i}
                    style={{ color: r === "W" ? "var(--success)" : r === "L" ? "#EF4444" : "var(--text-muted)" }}
                  >
                    {r}{" "}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
            {insight.freeInsight.recentTrend}
          </div>
        </div>

        {/* Coach Pass upsell — premium locked */}
        {insight.premiumLocked && (
          <div
            className="card"
            style={{
              border: "2px solid var(--yellow)",
              background: "#FFFDF0",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
              🔒 Coach Pass insight locked
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
              Unlock deeper match context: head-to-head summary, injury reports, lineup analysis, and rest-day impact.
            </div>
            <div
              style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, padding: "8px 10px", background: "var(--bg)", borderRadius: 8 }}
            >
              Coach Pass does not affect points, ranking, or promotional rewards.
              Predictions remain free for everyone.
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/coach-pass")}
              style={{ width: "100%" }}
            >
              Unlock Mangoal Coach insights →
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Mangoal Coach uses public sports data to generate match context.
          <br />No betting advice. No odds. No guaranteed result.
        </div>
      </div>
    </div>
  );
}
