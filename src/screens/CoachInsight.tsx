import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { LanguageToggle } from "../components/LanguageToggle";
import { useHasActiveCoachPass } from "../hooks/useMangoalLedger";
import { getMatchById } from "../config/matches";
import { useEspnScores, findMatch } from "../hooks/useEspnScores";
import { useLanguage } from "../i18n";
import { useMatchIntel, type TeamIntel } from "../hooks/useMatchIntel";

// ── FIFA ranking strength table (last-resort fallback) ────────────────────────
const TEAM_STRENGTH: Record<string, number> = {
  "france": 0.95, "spain": 0.93, "argentina": 0.92, "england": 0.90,
  "portugal": 0.89, "netherlands": 0.88, "belgium": 0.87, "germany": 0.86, "brazil": 0.85,
  "colombia": 0.82, "switzerland": 0.81, "croatia": 0.80, "morocco": 0.79, "senegal": 0.78,
  "sweden": 0.76, "mexico": 0.76, "norway": 0.75, "austria": 0.75, "japan": 0.75, "usa": 0.74,
  "ecuador": 0.73, "ivory coast": 0.72, "côte d'ivoire": 0.72, "australia": 0.71,
  "algeria": 0.70, "ghana": 0.68, "egypt": 0.68, "canada": 0.68, "paraguay": 0.67,
  "bosnia-herz": 0.64, "bosnia": 0.64, "congo dr": 0.62, "cape verde": 0.60,
};

function teamStrength(name: string): number {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(TEAM_STRENGTH)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return 0.70;
}

function parseRecordPoints(record?: string | null) {
  if (!record) return null;
  const parts = record.match(/(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?/);
  if (!parts) return null;
  const wins = Number(parts[1] ?? 0);
  const losses = Number(parts[2] ?? 0);
  const draws = Number(parts[3] ?? 0);
  const games = Math.max(1, wins + losses + draws);
  return { wins, losses, draws, games, pointsPerGame: (wins * 3 + draws) / games };
}

function ppgToStrength(ppg: number): number {
  return 0.55 + (ppg / 3) * 0.40;
}

// Converts live API intel into the same 0.55–0.95 scale as TEAM_STRENGTH.
// Composite: 50% weighted form, 25% attack (goals/game), 25% defense.
function intelToStrength(intel: TeamIntel): number {
  const g = Math.max(1, intel.games);
  const attack  = Math.min(1.0, (intel.goalsFor     / g) / 2.5);
  const defense = Math.max(0.0, 1 - (intel.goalsAgainst / g) / 3.0);
  const composite = intel.formScore * 0.50 + attack * 0.25 + defense * 0.25;
  return 0.55 + composite * 0.40;
}

function fmt1(n: number, g: number) {
  return (n / Math.max(1, g)).toFixed(1);
}

function getCoachContext(
  home: string,
  away: string,
  language: "en" | "es",
  homeRecord?: string | null,
  awayRecord?: string | null,
  liveStatus?: string,
  liveHomeScore?: number | null,
  liveAwayScore?: number | null,
  homeIntel?: TeamIntel | null,
  awayIntel?: TeamIntel | null,
) {
  const homeForm = parseRecordPoints(homeRecord);
  const awayForm = parseRecordPoints(awayRecord);

  // Priority: live API intel → ESPN W/D/L → FIFA ranking table
  const homeStr = homeIntel ? intelToStrength(homeIntel)
    : homeForm ? ppgToStrength(homeForm.pointsPerGame) : teamStrength(home);
  const awayStr = awayIntel ? intelToStrength(awayIntel)
    : awayForm ? ppgToStrength(awayForm.pointsPerGame) : teamStrength(away);

  const formDelta = homeStr - awayStr; // ≈ −0.40 to +0.40

  const liveBias = liveStatus === "in_progress" && liveHomeScore != null && liveAwayScore != null
    ? Math.max(-0.20, Math.min(0.20, ((liveHomeScore ?? 0) - (liveAwayScore ?? 0)) * 0.07))
    : 0;

  const advantage = formDelta + liveBias + 0.06; // +0.06 small KO-stage seeding edge

  // Score prediction
  let homeGoals = 1, awayGoals = 1;
  if (advantage > 0.35)       { homeGoals = 2; awayGoals = 0; }
  else if (advantage > 0.15)  { homeGoals = 2; awayGoals = 1; }
  else if (advantage < -0.35) { homeGoals = 0; awayGoals = 2; }
  else if (advantage < -0.15) { homeGoals = 1; awayGoals = 2; }

  const confidenceValue = Math.min(79, Math.max(52, Math.round(55 + Math.abs(formDelta) * 62)));

  // Base probabilities for neutral-ground WC KO: 38/27/35
  const homeWin = Math.min(70, Math.max(12, Math.round(38 + formDelta * 78)));
  const awayWin = Math.min(70, Math.max(12, Math.round(35 - formDelta * 78)));
  const draw    = Math.max(12, 100 - homeWin - awayWin);

  const hasIntel = !!(homeIntel || awayIntel);
  const leader = advantage > 0.13 ? home : advantage < -0.13 ? away
    : language === "es" ? "partido equilibrado" : "balanced match";

  function teamLine(name: string, intel: TeamIntel | null | undefined, record: string | null | undefined): string {
    if (intel) {
      const wdl = `${intel.wins}W-${intel.draws}D-${intel.losses}L`;
      const gf  = fmt1(intel.goalsFor,     intel.games);
      const ga  = fmt1(intel.goalsAgainst, intel.games);
      return language === "es"
        ? `${name}: ${wdl}, ${gf} goles/partido, ${ga} recibidos`
        : `${name}: ${wdl}, ${gf} goals/game, ${ga} conceded`;
    }
    if (record) return `${name}: ${record}`;
    return language === "es"
      ? `${name}: sin datos disponibles (ranking FIFA aplicado)`
      : `${name}: no data available (FIFA ranking applied)`;
  }

  const modelSrc = hasIntel
    ? (language === "es" ? "forma reciente y contexto de localía" : "recent form and venue context")
    : !homeForm && !awayForm
    ? (language === "es" ? "ranking FIFA y contexto de localía"  : "FIFA ranking and venue context")
    : (language === "es" ? "forma ESPN y contexto de localía"    : "ESPN form and venue context");

  const summary = language === "es"
    ? `${teamLine(home, homeIntel, homeRecord)}. ${teamLine(away, awayIntel, awayRecord)}. El modelo favorece a ${leader} usando ${modelSrc}.`
    : `${teamLine(home, homeIntel, homeRecord)}. ${teamLine(away, awayIntel, awayRecord)}. The model favors ${leader} using ${modelSrc}.`;

  const drivers = hasIntel
    ? (language === "es"
        ? ["Forma reciente", "Goles marcados", "Goles recibidos", "Estado en vivo"]
        : ["Recent form", "Goals scored", "Goals conceded", "Live state"])
    : (language === "es"
        ? ["Ranking FIFA", "Forma ESPN", "Localía", "Estado en vivo"]
        : ["FIFA ranking", "ESPN form", "Venue edge", "Live state"]);

  return {
    suggestedScore: `${homeGoals} - ${awayGoals}`,
    confidence: `${confidenceValue}%`,
    winModel: { home: homeWin, draw, away: awayWin },
    summary,
    drivers,
    dataSource: homeIntel?.source ?? awayIntel?.source ?? null,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CoachInsight() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { language } = useLanguage();

  const c = language === "es"
    ? {
        notFound:     "Partido no encontrado",
        liveData:     "Forma reciente · Últimos 5 partidos",
        publicCtx:    "Contexto con datos públicos de fútbol",
        disclaimer:   "Solo contexto del partido. Sin cuotas. Sin resultado garantizado.",
        context:      "Contexto del partido",
        source:       "Fuente",
        locked:       "Insight de Coach Pass bloqueado",
        lockedBody:   "Desbloquea contexto adicional: duelos directos, notas de alineación, descanso y forma de jugadores clave.",
        unlock:       "Desbloquear Coach",
      }
    : {
        notFound:     "Match not found",
        liveData:     "Live form data · Last 5 matches",
        publicCtx:    "Public football data context",
        disclaimer:   "Match context only. No odds. No guaranteed result.",
        context:      "Match context",
        source:       "Source",
        locked:       "Coach Pass insight locked",
        lockedBody:   "Unlock deeper context: head-to-head, lineup notes, rest-day impact, and key player form.",
        unlock:       "Unlock Coach",
      };

  const { hasPass } = useHasActiveCoachPass(address);
  const match = getMatchById(id ?? "");

  const matchDate = match
    ? new Date(match.kickoffAt).toISOString().slice(0, 10).replace(/-/g, "")
    : undefined;
  const { matches: espnMatches, isLoading: liveLoading } = useEspnScores("fifa.world", matchDate, language);
  const live = match ? findMatch(espnMatches, match.home, match.away) : null;

  const homeName = live?.home ?? match?.home ?? "";
  const awayName = live?.away ?? match?.away ?? "";

  // Primary: TheSportsDB — Backup: football-data.org (needs VITE_FOOTBALL_DATA_KEY)
  const { home: homeIntel, away: awayIntel, isLoading: intelLoading } = useMatchIntel(homeName, awayName);

  const coach = useMemo(
    () => getCoachContext(
      homeName, awayName, language,
      live?.homeRecord, live?.awayRecord,
      live?.status, live?.homeScore, live?.awayScore,
      homeIntel, awayIntel,
    ),
    [homeName, awayName, language, live, homeIntel, awayIntel]
  );

  if (!match) {
    return (
      <div className="screen">
        <div className="topbar">
          <button className="icon-button" onClick={() => navigate(-1)} type="button" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="topbar-logo compact">
            <span className="brand-ball-icon" aria-hidden="true" /> <span>Mangooal Coach</span>
          </span>
          <LanguageToggle />
        </div>
        <div className="screen-body" style={{ paddingTop: 40, textAlign: "center", color: "var(--text-muted)" }}>
          {c.notFound}
        </div>
      </div>
    );
  }

  const hasLiveData = !!(homeIntel || awayIntel);
  const srcLabel = coach.dataSource === "thesportsdb" ? "TheSportsDB"
    : coach.dataSource === "football-data" ? "football-data.org"
    : null;

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-button" onClick={() => navigate(-1)} type="button" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="topbar-logo compact">
          <span className="brand-ball-icon" aria-hidden="true" /> <span>Mangooal Coach</span>
        </span>
        <LanguageToggle />
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{homeName} vs {awayName}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{match.competition}</div>
        </div>

        {!liveLoading && live && (live.status === "in_progress" || live.status === "final") && (
          <div className="live-score-card">
            <div><small>{live.home}</small><strong>{live.homeScore ?? "-"}</strong></div>
            <span>{live.status === "in_progress" ? "LIVE" : "FT"}</span>
            <div><small>{live.away}</small><strong>{live.awayScore ?? "-"}</strong></div>
          </div>
        )}

        <div className="coach-card">
          <div className="coach-label">Mangooal Coach</div>
          <div className="coach-score">
            {intelLoading && !hasLiveData ? "…" : coach.suggestedScore}
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>
            {hasLiveData ? c.liveData : c.publicCtx} · {language === "es" ? "Confianza" : "Confidence"} {coach.confidence}
          </div>
          <div className="coach-win-model">
            <span>{homeName}: {coach.winModel.home}%</span>
            <span>Draw: {coach.winModel.draw}%</span>
            <span>{awayName}: {coach.winModel.away}%</span>
          </div>
          <div className="coach-driver-list">
            {coach.drivers.map((d) => <span key={d}>{d}</span>)}
          </div>
          {srcLabel && (
            <div style={{ fontSize: 10, opacity: 0.5, marginTop: 6, letterSpacing: "0.03em" }}>
              {c.source}: {srcLabel}
            </div>
          )}
          <div className="coach-disclaimer">{c.disclaimer}</div>
        </div>

        <div className="section-title">{c.context}</div>
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{coach.summary}</p>
        </div>

        {!hasPass && (
          <div className="card" style={{ border: "2px solid var(--yellow)", background: "#FFFDF0", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{c.locked}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>{c.lockedBody}</div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/coach-pass")} style={{ width: "100%" }}>
              {c.unlock}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
