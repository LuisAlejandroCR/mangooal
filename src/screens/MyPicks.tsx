import { useNavigate } from "react-router-dom";
import { CeloBadge } from "../components/CeloBadge";

const MOCK_PICKS = [
  {
    id: "m3",
    home: "Spain",
    away: "England",
    homeFlag: "🇪🇸",
    awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    pick: { home: 2, away: 1 },
    result: { home: 2, away: 1 },
    points: 10,
    status: "scored" as const,
  },
  {
    id: "m1",
    home: "Colombia",
    away: "Brazil",
    homeFlag: "🇨🇴",
    awayFlag: "🇧🇷",
    pick: { home: 2, away: 0 },
    result: null,
    points: null,
    status: "committed" as const,
  },
  {
    id: "m2",
    home: "Argentina",
    away: "Mexico",
    homeFlag: "🇦🇷",
    awayFlag: "🇲🇽",
    pick: { home: 3, away: 1 },
    result: null,
    points: null,
    status: "committed" as const,
  },
];

const STATUS_LABELS = {
  committed: { text: "Waiting for result", color: "var(--text-muted)" },
  scored: { text: "Scored", color: "var(--success)" },
};

export function MyPicks() {
  const navigate = useNavigate();
  const totalPoints = MOCK_PICKS.reduce((s, p) => s + (p.points ?? 0), 0);

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-logo">⚽ <span>Mango</span>al</span>
        <CeloBadge variant="network" />
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>
        {/* Summary card */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Total points</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "var(--green)" }}>{totalPoints}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Picks</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{MOCK_PICKS.length}</div>
            </div>
          </div>
        </div>

        <div className="section-title">My predictions</div>
        {MOCK_PICKS.map((pick) => {
          const exact = pick.result &&
            pick.result.home === pick.pick.home &&
            pick.result.away === pick.pick.away;

          return (
            <div
              key={pick.id}
              className="card"
              style={{ marginBottom: 10, cursor: "pointer" }}
              onClick={() => navigate(`/audit/${pick.id}`)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: STATUS_LABELS[pick.status].color, fontWeight: 700 }}>
                  {STATUS_LABELS[pick.status].text}
                </span>
                {pick.points !== null && (
                  <span style={{ fontWeight: 800, color: exact ? "var(--success)" : "var(--text)", fontSize: 15 }}>
                    {exact ? "🎯 " : ""}{pick.points} pts
                  </span>
                )}
              </div>

              <div className="match-teams">
                <div className="team-name" style={{ fontSize: 13 }}>
                  <div style={{ fontSize: 22, marginBottom: 2 }}>{pick.homeFlag}</div>
                  {pick.home}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "var(--green)" }}>
                    {pick.pick.home} – {pick.pick.away}
                  </div>
                  {pick.result && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      Result: {pick.result.home} – {pick.result.away}
                    </div>
                  )}
                </div>
                <div className="team-name" style={{ fontSize: 13 }}>
                  <div style={{ fontSize: 22, marginBottom: 2 }}>{pick.awayFlag}</div>
                  {pick.away}
                </div>
              </div>

              <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <CeloBadge variant="network" />
                <span>Tap to view on-chain audit</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
