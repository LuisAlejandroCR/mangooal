import { CeloBadge } from "../components/CeloBadge";

const MOCK_RANKING = [
  { rank: 1, name: "🇨🇴 MangoKing", points: 320, streak: 5 },
  { rank: 2, name: "🇧🇷 Seleção_fan", points: 305, streak: 3 },
  { rank: 3, name: "🇦🇷 AlbicelesteFan", points: 298, streak: 4 },
  { rank: 4, name: "🇲🇽 ChilongoFútbol", points: 277, streak: 2 },
  { rank: 5, name: "You", points: 241, streak: 2, isMe: true },
  { rank: 6, name: "🇺🇸 SoccerDave", points: 230, streak: 1 },
  { rank: 7, name: "🇬🇧 PremierPicker", points: 218, streak: 0 },
];

export function Ranking() {
  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-logo">⚽ <span>Mango</span>al</span>
        <CeloBadge variant="network" />
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>
        {/* Campaign badge */}
        <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge badge-yellow">🏆 Copa América 2026</span>
          <span className="badge badge-muted">Round 2</span>
        </div>

        {/* Top 3 podium */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 12,
            marginBottom: 24,
            padding: "0 8px",
          }}
        >
          {[
            { ...MOCK_RANKING[1], height: 80, emoji: "🥈" },
            { ...MOCK_RANKING[0], height: 100, emoji: "🥇" },
            { ...MOCK_RANKING[2], height: 65, emoji: "🥉" },
          ].map((p) => (
            <div key={p.rank} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
                {p.emoji}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{p.name.slice(0, 12)}</div>
              <div
                style={{
                  height: p.height,
                  background: p.rank === 1
                    ? "linear-gradient(to top, #F4B400, #FFC83D)"
                    : "linear-gradient(to top, #2E9E57, #35D07F)",
                  borderRadius: "8px 8px 0 0",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  paddingTop: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "white",
                }}
              >
                {p.points}
              </div>
            </div>
          ))}
        </div>

        {/* Full ranking */}
        <div className="section-title">Full ranking</div>
        <div className="card">
          {MOCK_RANKING.map((player) => (
            <div
              key={player.rank}
              className="rank-row"
              style={player.isMe ? { background: "#FFF9EC", margin: "0 -16px", padding: "12px 16px" } : {}}
            >
              <div className={`rank-pos${player.rank <= 3 ? " top3" : ""}`}>
                {player.rank <= 3 ? ["🥇", "🥈", "🥉"][player.rank - 1] : player.rank}
              </div>
              <div className="rank-avatar">
                {player.isMe ? "👤" : player.name[0]}
              </div>
              <div className="rank-info">
                <div className="rank-name">
                  {player.name}
                  {player.isMe && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400, marginLeft: 6 }}>· you</span>
                  )}
                </div>
                <div className="rank-detail">
                  {player.streak > 0
                    ? `🔥 ${player.streak} streak`
                    : "No active streak"}
                </div>
              </div>
              <div className="rank-pts">{player.points}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 16, lineHeight: 1.6 }}>
          Ranking is built from on-chain prediction events on Celo Mainnet.
          <br />Coach Pass does not affect your ranking position.
        </div>
      </div>
    </div>
  );
}
