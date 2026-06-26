import { CeloBadge } from "../components/CeloBadge";
import { LanguageToggle } from "../components/LanguageToggle";
import { MatchCard, type MatchData } from "../components/MatchCard";
import { useMiniPay } from "../hooks/useMiniPay";
import { useLanguage } from "../i18n";
import { COPA_MATCHES, matchStatus, CAMPAIGN_DISPLAY_NAME } from "../config/matches";

type ComingCompetition = {
  marker: string;
  name: string;
  sub: string;
  color: string;
};

function buildMatchData(): MatchData[] {
  return COPA_MATCHES.map((m) => ({
    id:          m.id,
    campaignId:  m.campaignId,
    home:        m.home,
    away:        m.away,
    homeFlag:    m.homeFlag,
    awayFlag:    m.awayFlag,
    competition: m.competition,
    kickoff:     new Date(m.kickoffAt),
    lockedAt:    new Date(m.lockedAt),
    status:      matchStatus(m),
  }));
}

function buildComingCompetitions(language: "en" | "es"): ComingCompetition[] {
  return [
    {
      marker: "UEFA",
      name: "UEFA Champions League",
      sub: language === "es"
        ? "Temporada 2026-27 · Fase de liga desde septiembre de 2026"
        : "2026-27 season · League phase from September 2026",
      color: "#1B3A8A",
    },
    {
      marker: "CONMEBOL",
      name: "Copa América 2027",
      sub: language === "es"
        ? "Sudamérica · Predicciones para usuarios de Latam"
        : "South America · Predictions for LatAm users",
      color: "#176B3A",
    },
    {
      marker: "CAF",
      name: "Africa Cup of Nations 2027",
      sub: language === "es"
        ? "África · Predicciones para fans africanos"
        : "Africa · Predictions for African football fans",
      color: "#7C3AED",
    },
  ];
}

export function Predictions() {
  const { isMiniPay, isConnected, address } = useMiniPay();
  const { language, copy } = useLanguage();
  const allMatches = buildMatchData();
  const openMatches = allMatches.filter((m) => m.status === "open");
  const lockedOrLive = allMatches.filter(
    (m) => m.status === "locked" || m.status === "live"
  );
  const comingCompetitions = buildComingCompetitions(language);
  const comingSoonNames = comingCompetitions.map((item) => item.name).join(" · ");

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-logo"><span>Mangoo</span>al</span>
        <div className="topbar-actions">
          <LanguageToggle />
          <CeloBadge variant={isConnected ? "connected" : "network"} />
        </div>
      </div>

      <div className="screen-body">
        {isConnected && (
          <div className="wallet-bar" style={{ marginTop: 12 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="7" fill="#35D07F" />
              <circle cx="7" cy="7" r="3.5" fill="white" />
            </svg>
            {isMiniPay ? "MiniPay wallet connected · Celo Mainnet" : "Celo wallet connected"}
            {address && (
              <span style={{ marginLeft: "auto", opacity: 0.7 }}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            )}
          </div>
        )}

        <div className="campaign-banner">
          <div className="campaign-eyebrow">{copy.predictions.currentCup}</div>
          <div className="campaign-title">
            {copy.predictions.now}: {CAMPAIGN_DISPLAY_NAME}
          </div>
          <div className="campaign-meta">
            {COPA_MATCHES.length} {copy.predictions.freePredictions}
          </div>
          <div className="campaign-next">
            {copy.predictions.comingSoon}: {comingSoonNames}
          </div>
          <div className="campaign-pills">
            <span>{openMatches.length} {copy.predictions.open}</span>
            <span>{copy.predictions.promoRewards}</span>
          </div>
        </div>

        {openMatches.length > 0 && (
          <>
            <div className="section-title">{copy.predictions.openPredictions}</div>
            {openMatches.map((m) => <MatchCard key={m.id} match={m} />)}
          </>
        )}

        {lockedOrLive.length > 0 && (
          <>
            <div className="section-title">{copy.predictions.inProgress}</div>
            {lockedOrLive.map((m) => <MatchCard key={m.id} match={m} />)}
          </>
        )}

        {openMatches.length === 0 && lockedOrLive.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "24px 16px", color: "var(--text-muted)", fontSize: 14 }}>
            {copy.predictions.noOpen}
          </div>
        )}

        <div className="section-title" style={{ marginTop: 8 }}>
          {copy.predictions.roadmapTitle}
        </div>
        {comingCompetitions.map((competition) => (
          <div className="coming-card" key={competition.name}>
            <div className="coming-marker" style={{ background: competition.color }}>
              {competition.marker}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{competition.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {competition.sub}
              </div>
            </div>
            <span className="coming-soon">{copy.common.soon}</span>
          </div>
        ))}

        <div className="compliance-note">
          {copy.predictions.complianceLine1}
          <br />
          {copy.predictions.complianceLine2}
        </div>
      </div>
    </div>
  );
}
