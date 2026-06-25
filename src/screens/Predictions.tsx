import { CeloBadge } from "../components/CeloBadge";
import { MatchCard, type MatchData } from "../components/MatchCard";
import { useMiniPay } from "../hooks/useMiniPay";

const MOCK_MATCHES: MatchData[] = [
  {
    id: "m1",
    campaignId: "copa-2026",
    home: "Colombia",
    away: "Brazil",
    homeFlag: "🇨🇴",
    awayFlag: "🇧🇷",
    competition: "Copa América 2026",
    kickoff: new Date(Date.now() + 3 * 3600000),
    lockedAt: new Date(Date.now() + 2.5 * 3600000),
    status: "open",
  },
  {
    id: "m2",
    campaignId: "copa-2026",
    home: "Argentina",
    away: "Mexico",
    homeFlag: "🇦🇷",
    awayFlag: "🇲🇽",
    competition: "Copa América 2026",
    kickoff: new Date(Date.now() + 7 * 3600000),
    lockedAt: new Date(Date.now() + 6.5 * 3600000),
    status: "open",
  },
  {
    id: "m3",
    campaignId: "copa-2026",
    home: "Spain",
    away: "England",
    homeFlag: "🇪🇸",
    awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    competition: "UEFA Nations League",
    kickoff: new Date(Date.now() - 1 * 3600000),
    lockedAt: new Date(Date.now() - 2 * 3600000),
    userPick: { home: 2, away: 1 },
    status: "live",
  },
];

export function Predictions() {
  const { isMiniPay, address, isConnected } = useMiniPay();

  return (
    <div className="screen">
      {/* Top bar */}
      <div className="topbar">
        <span className="topbar-logo">⚽ <span>Mangoo</span>al</span>
        <CeloBadge variant={isConnected ? "connected" : "network"} />
      </div>

      <div className="screen-body">
        {/* Wallet status bar (MiniPay auto-shows connected state) */}
        {isConnected && (
          <div className="wallet-bar" style={{ marginTop: 12 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="7" fill="#35D07F" />
              <circle cx="7" cy="7" r="3.5" fill="white" />
            </svg>
            {isMiniPay ? "MiniPay wallet connected · Celo Mainnet" : "Celo wallet connected"}
            {address && (
              <span style={{ marginLeft: "auto", opacity: 0.7 }}>
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
            )}
          </div>
        )}

        {/* Campaign header */}
        <div
          style={{
            background: "linear-gradient(135deg, #176B3A 0%, #2E9E57 100%)",
            borderRadius: "var(--radius)",
            padding: "18px",
            marginBottom: "16px",
            color: "white",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            Active campaign
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Copa América 2026 🏆</div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
            3 matches · Predictions are free for everyone
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 50, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
              7 days left
            </span>
            <span style={{ background: "rgba(255,200,61,0.25)", borderRadius: 50, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#FFC83D" }}>
              Promotional rewards available
            </span>
          </div>
        </div>

        {/* Matches */}
        <div className="section-title">Open predictions</div>
        {MOCK_MATCHES.filter((m) => m.status === "open").map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}

        <div className="section-title">Your active picks</div>
        {MOCK_MATCHES.filter((m) => m.userPick).map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}

        {/* Compliance notice */}
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--text-muted)",
            padding: "16px 8px 0",
            lineHeight: 1.6,
          }}
        >
          Mangooal is a free-to-play sports prediction game. Not betting. Not gambling.
          <br />
          No entry fees · No user-funded prize pools · No odds
        </div>
      </div>
    </div>
  );
}
