import { useNavigate } from "react-router-dom";
import { CeloBadge } from "./CeloBadge";
import { useLanguage } from "../i18n";

export type MatchData = {
  id: string;
  campaignId: string;
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  competition: string;
  kickoff: Date;
  lockedAt: Date;
  userPick?: { home: number; away: number };
  status: "open" | "locked" | "live" | "finished";
};

function formatKickoff(
  d: Date,
  copy: ReturnType<typeof useLanguage>["copy"],
): string {
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return copy.matches.live;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return copy.matches.hoursLeft(hours);
  return d.toLocaleDateString(copy.matches.dateLocale, { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

export function MatchCard({ match }: { match: MatchData }) {
  const navigate = useNavigate();
  const { copy } = useLanguage();
  const isLocked = match.status !== "open";

  return (
    <div className="match-card" onClick={() => navigate(`/match/${match.id}`)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="badge badge-muted" style={{ fontSize: 10 }}>{match.competition}</span>
        <span
          className={`badge ${isLocked ? "badge-muted" : "badge-yellow"}`}
          style={{ fontSize: 10 }}
        >
          {isLocked ? copy.matches.locked : formatKickoff(match.kickoff, copy)}
        </span>
      </div>

      <div className="match-teams">
        <div className="team-name">
          <div style={{ fontSize: 24, marginBottom: 3 }}>{match.homeFlag}</div>
          {match.home}
        </div>
        <div className="match-time">
          {match.userPick
            ? <strong style={{ color: "var(--green)" }}>{match.userPick.home} – {match.userPick.away}</strong>
            : "vs"
          }
        </div>
        <div className="team-name">
          <div style={{ fontSize: 24, marginBottom: 3 }}>{match.awayFlag}</div>
          {match.away}
        </div>
      </div>

      {match.userPick && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <CeloBadge variant="network" />
        </div>
      )}
    </div>
  );
}
