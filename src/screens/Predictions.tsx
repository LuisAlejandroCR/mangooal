import { useMemo, useState } from "react";
import { keccak256, toHex } from "viem";
import { CeloBadge } from "../components/CeloBadge";
import { LanguageToggle } from "../components/LanguageToggle";
import { MatchCard, type MatchData } from "../components/MatchCard";
import { useLiveWorldCupMatches } from "../hooks/useLiveWorldCupMatches";
import { useMiniPay } from "../hooks/useMiniPay";
import { useLanguage, type Language } from "../i18n";
import { CAMPAIGN_DISPLAY_NAME } from "../config/matches";

type CompetitionId = "world-cup" | "champions" | "copa-america" | "afcon";
type MatchFilter = "live" | "schedule" | "all";

type Competition = {
  id: CompetitionId;
  marker: string;
  name: string;
  league: string;
  color: string;
  current: boolean;
  description: Record<Language, string>;
  previewMatches: Array<{
    id: string;
    home: string;
    away: string;
    venue: string;
    kickoffAt: number;
  }>;
};

const MAX_VISIBLE_MATCHES = 6;

const COMPETITIONS: Competition[] = [
  {
    id: "world-cup",
    marker: "FIFA",
    name: CAMPAIGN_DISPLAY_NAME,
    league: "fifa.world",
    color: "#176B3A",
    current: true,
    description: {
      en: "Current cup on Mangooal with live scores from ESPN.",
      es: "Copa actual en Mangooal con marcadores en vivo desde ESPN.",
    },
    previewMatches: [],
  },
  {
    id: "champions",
    marker: "UEFA",
    name: "UEFA Champions League",
    league: "uefa.champions",
    color: "#1B3A8A",
    current: false,
    description: {
      en: "European club football. Qualifiers and league phase coming next.",
      es: "Futbol europeo de clubes. Clasificatorias y fase de liga proximamente.",
    },
    previewMatches: [
      ["ucl-2026-qual-1", "Ararat-Armenia", "Riga FC", "Qualifying 1st leg", 1_783_426_800_000],
      ["ucl-2026-qual-2", "Lincoln Red Imps", "IC Escaldes", "Qualifying 1st leg", 1_783_426_800_000],
      ["ucl-2026-qual-3", "Kauno", "Drita", "Qualifying 1st leg", 1_783_426_800_000],
      ["ucl-2026-qual-4", "Sabah Masazir", "New Saints", "Qualifying 1st leg", 1_783_426_800_000],
      ["ucl-2026-qual-5", "FK Vardar Skopje", "KuPS", "Qualifying 1st leg", 1_783_430_400_000],
      ["ucl-2026-qual-6", "Floriana", "Shamrock Rovers", "Qualifying 1st leg", 1_783_432_200_000],
    ].map(([id, home, away, venue, kickoffAt]) => ({
      id: String(id),
      home: String(home),
      away: String(away),
      venue: String(venue),
      kickoffAt: Number(kickoffAt),
    })),
  },
  {
    id: "copa-america",
    marker: "CONMEBOL",
    name: "Copa America",
    league: "conmebol.america",
    color: "#176B3A",
    current: false,
    description: {
      en: "South American football for LatAm fans. Preview fixtures until official schedule opens.",
      es: "Futbol sudamericano para fans de Latam. Vista previa hasta calendario oficial.",
    },
    previewMatches: [
      ["ca-preview-1", "Colombia", "Brazil", "LatAm preview", 1_806_278_400_000],
      ["ca-preview-2", "Argentina", "Mexico", "LatAm preview", 1_806_292_800_000],
      ["ca-preview-3", "Uruguay", "USA", "LatAm preview", 1_806_307_200_000],
      ["ca-preview-4", "Chile", "Peru", "LatAm preview", 1_806_321_600_000],
      ["ca-preview-5", "Ecuador", "Venezuela", "LatAm preview", 1_806_336_000_000],
    ].map(([id, home, away, venue, kickoffAt]) => ({
      id: String(id),
      home: String(home),
      away: String(away),
      venue: String(venue),
      kickoffAt: Number(kickoffAt),
    })),
  },
  {
    id: "afcon",
    marker: "CAF",
    name: "Africa Cup of Nations",
    league: "caf.nations",
    color: "#7C3AED",
    current: false,
    description: {
      en: "African national teams. Built for African football fans in and outside MiniPay.",
      es: "Selecciones africanas. Pensado para fans africanos dentro y fuera de MiniPay.",
    },
    previewMatches: [
      ["afcon-preview-1", "Nigeria", "Ghana", "Africa preview", 1_808_611_200_000],
      ["afcon-preview-2", "Senegal", "Cameroon", "Africa preview", 1_808_625_600_000],
      ["afcon-preview-3", "Morocco", "Egypt", "Africa preview", 1_808_640_000_000],
      ["afcon-preview-4", "Ivory Coast", "South Africa", "Africa preview", 1_808_654_400_000],
      ["afcon-preview-5", "Algeria", "Tunisia", "Africa preview", 1_808_668_800_000],
    ].map(([id, home, away, venue, kickoffAt]) => ({
      id: String(id),
      home: String(home),
      away: String(away),
      venue: String(venue),
      kickoffAt: Number(kickoffAt),
    })),
  },
];

function toPreviewMatch(competition: Competition, item: Competition["previewMatches"][number]): MatchData {
  return {
    id: item.id,
    campaignId: keccak256(toHex(competition.id)),
    home: item.home,
    away: item.away,
    homeFlag: "",
    awayFlag: "",
    competition: competition.name,
    kickoff: new Date(item.kickoffAt),
    lockedAt: new Date(item.kickoffAt - 30 * 60 * 1000),
    status: "open",
    source: "local",
    venue: item.venue,
    canPredict: false,
  };
}

function filterMatches(matches: MatchData[], filter: MatchFilter) {
  if (filter === "live") return matches.filter((match) => match.status === "live");
  if (filter === "schedule") {
    return matches.filter((match) => match.status === "open" || match.status === "locked");
  }
  return matches;
}

export function Predictions() {
  const { isMiniPay, isConnected, address } = useMiniPay();
  const { language, copy } = useLanguage();
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<CompetitionId>("world-cup");
  const [filter, setFilter] = useState<MatchFilter>("schedule");
  const selectedCompetition =
    COMPETITIONS.find((competition) => competition.id === selectedCompetitionId) ?? COMPETITIONS[0];

  const {
    matches: worldCupMatches,
    isLoading,
    error,
    hasLiveData,
  } = useLiveWorldCupMatches();

  const selectedMatches = useMemo(() => {
    if (selectedCompetition.current) return worldCupMatches;
    return selectedCompetition.previewMatches.map((match) => toPreviewMatch(selectedCompetition, match));
  }, [selectedCompetition, worldCupMatches]);

  const visibleMatches = filterMatches(selectedMatches, filter).slice(0, MAX_VISIBLE_MATCHES);
  const liveCount = selectedMatches.filter((match) => match.status === "live").length;
  const scheduleCount = filterMatches(selectedMatches, "schedule").length;
  const predictionReadyCount = selectedMatches.filter((match) => match.canPredict !== false).length;

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-logo">
          <span>Mangoo</span>al
        </span>

        <div className="topbar-actions">
          <LanguageToggle />
          <CeloBadge variant={isConnected ? "connected" : "network"} />
        </div>
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>
        {isConnected && (
          <div className="wallet-bar">
            <span>
              {isMiniPay
                ? "MiniPay wallet connected · Celo Mainnet"
                : "Celo wallet connected"}
            </span>

            {address && (
              <span>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            )}
          </div>
        )}

        <button
          className="campaign-banner campaign-banner-button"
          onClick={() => {
            const currentIndex = COMPETITIONS.findIndex((competition) => competition.id === selectedCompetitionId);
            const nextCompetition = COMPETITIONS[(currentIndex + 1) % COMPETITIONS.length];
            setSelectedCompetitionId(nextCompetition.id);
            setFilter(nextCompetition.current ? "schedule" : "all");
          }}
          type="button"
        >
          <div className="campaign-eyebrow">{copy.predictions.currentCup}</div>
          <div className="campaign-title">
            {copy.predictions.now}: {selectedCompetition.name}
          </div>
          <div className="campaign-meta">
            {selectedCompetition.current && hasLiveData
              ? copy.predictions.currentSource
              : selectedCompetition.description[language]}
          </div>
          <div className="campaign-next">
            {copy.predictions.tapToSwitch}
          </div>
          <div className="campaign-pills">
            <span>{predictionReadyCount} {copy.predictions.freePredictions}</span>
            <span>{scheduleCount} {copy.predictions.open}</span>
            <span>{copy.predictions.promoRewards}</span>
          </div>
        </button>

        <div className="action-filter" aria-label="Match view">
          {([
            ["live", `${copy.predictions.live} (${liveCount})`],
            ["schedule", `${copy.predictions.schedule} (${scheduleCount})`],
            ["all", `${copy.predictions.actionAll} (${selectedMatches.length})`],
          ] as const).map(([value, label]) => (
            <button
              className={filter === value ? "active" : ""}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {error && selectedCompetition.current && (
          <div className="hint-card error">
            ESPN live data could not be loaded. Mangooal is showing the local registered schedule.
          </div>
        )}

        {isLoading && selectedCompetition.current && (
          <div className="card" style={{ marginBottom: 14 }}>
            Loading live schedule...
          </div>
        )}

        <div className="match-list-heading">
          <div>
            <div className="section-title">{selectedCompetition.name}</div>
            <div className="source-note">
              {selectedCompetition.current
                ? copy.predictions.currentSource
                : copy.predictions.futureSource}
            </div>
          </div>
          <span>{visibleMatches.length}/{Math.min(selectedMatches.length, MAX_VISIBLE_MATCHES)}</span>
        </div>

        {visibleMatches.length > 0 ? (
          visibleMatches.map((match) => <MatchCard key={match.id} match={match} />)
        ) : (
          <div className="card" style={{ textAlign: "center" }}>
            <strong>{copy.predictions.noMatches}</strong>
          </div>
        )}

        <div className="section-title">{copy.predictions.roadmapTitle}</div>
        <div className="competition-switcher">
          {COMPETITIONS.map((competition) => (
            <button
              className={competition.id === selectedCompetitionId ? "active" : ""}
              key={competition.id}
              onClick={() => {
                setSelectedCompetitionId(competition.id);
                setFilter(competition.current ? "schedule" : "all");
              }}
              type="button"
            >
              <span className="coming-marker" style={{ background: competition.color }}>
                {competition.marker}
              </span>
              <span>
                <strong>{competition.name}</strong>
                <small>{competition.description[language]}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="hint-card">
          {copy.predictions.fallbackNote}
        </div>

        <div className="compliance-note">
          {copy.predictions.complianceLine1}
          <br />
          {copy.predictions.complianceLine2}
        </div>
      </div>
    </div>
  );
}
