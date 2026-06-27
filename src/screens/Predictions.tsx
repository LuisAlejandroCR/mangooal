import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageToggle } from "../components/LanguageToggle";
import { MatchCard } from "../components/MatchCard";
import { StablecoinBalances } from "../components/StablecoinBalances";
import {
  COMPETITIONS,
  MAX_VISIBLE_MATCHES,
  filterMatches,
  toApiMatch,
  type CompetitionId,
  type MatchFilter,
} from "../config/competitions";
import { useEspnScores } from "../hooks/useEspnScores";
import { useLiveWorldCupMatches } from "../hooks/useLiveWorldCupMatches";
import { useLanguage } from "../i18n";

export function Predictions() {
  const { language, copy } = useLanguage();
  const navigate = useNavigate();
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<CompetitionId>("world-cup");
  const [filter, setFilter] = useState<MatchFilter>("schedule");

  const selectedCompetition =
    COMPETITIONS.find((competition) => competition.id === selectedCompetitionId) ?? COMPETITIONS[0];

  const { matches: worldCupMatches, isLoading: worldCupLoading, error: worldCupError } =
    useLiveWorldCupMatches(language);
  const {
    matches: cupApiMatches,
    isLoading: cupApiLoading,
    error: cupApiError,
  } = useEspnScores(selectedCompetition.league, undefined, language);

  const selectedMatches = useMemo(() => {
    if (selectedCompetition.current) return worldCupMatches;
    return cupApiMatches.map((match) => toApiMatch(selectedCompetition, match));
  }, [cupApiMatches, selectedCompetition, worldCupMatches]);

  const isLoading = selectedCompetition.current ? worldCupLoading : cupApiLoading;
  const error = selectedCompetition.current ? worldCupError : cupApiError;

  const filteredMatches = filterMatches(selectedMatches, filter);
  const visibleMatches = filteredMatches.slice(0, MAX_VISIBLE_MATCHES);
  const liveCount = selectedMatches.filter((match) => match.status === "live").length;
  const scheduleCount = filterMatches(selectedMatches, "schedule").length;
  const finishedCount = filterMatches(selectedMatches, "finished").length;

  function selectCup(id: CompetitionId) {
    const nextCompetition = COMPETITIONS.find((competition) => competition.id === id) ?? COMPETITIONS[0];
    setSelectedCompetitionId(nextCompetition.id);
    setFilter(nextCompetition.current ? "schedule" : "all");
  }

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-logo">
          <span className="brand-ball-icon" aria-hidden="true" /> <span>Mangoo</span>al
        </span>

        <div className="topbar-actions">
          <LanguageToggle />
          <a className="icon-button" href="/support" aria-label="Legal and support">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.1 9a3 3 0 1 1 5.8 1c-.4.9-1.2 1.4-2 2-.6.4-.9.8-.9 1.6" />
              <path d="M12 17h.01" />
            </svg>
          </a>
          <button className="icon-button" type="button" aria-label="Notifications" onClick={() => navigate("/support")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <span className="network-text">Celo Mainnet</span>
        </div>
      </div>

      <div className="screen-body picks-body">
        <StablecoinBalances />

        <div className="campaign-banner">
          <div className="campaign-eyebrow">{copy.predictions.currentCup}</div>
          <div className="campaign-title">
            {copy.predictions.now}: {selectedCompetition.name}
          </div>
          <div className="campaign-meta">{selectedCompetition.description[language]}</div>
        </div>

        <label className="cup-select-row">
          <span>{language === "es" ? "Cambiar copa" : "Cup"}</span>
          <select
            value={selectedCompetitionId}
            onChange={(event) => selectCup(event.target.value as CompetitionId)}
            aria-label="Cup selector"
          >
            {COMPETITIONS.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.marker} - {competition.name}
              </option>
            ))}
          </select>
        </label>

        <div className="action-filter" aria-label="Match view">
          {([
            ["live", `${copy.predictions.live} (${liveCount})`],
            ["schedule", `${copy.predictions.schedule} (${scheduleCount})`],
            ["finished", `${copy.predictions.finished} (${finishedCount})`],
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

        {error && (
          <div className="hint-card error">{copy.predictions.scheduleFallback}</div>
        )}

        {isLoading && (
          <div className="card" style={{ marginBottom: 14 }}>
            {copy.predictions.loading}
          </div>
        )}

        <div className="matches-panel">
          <div className="match-list-heading">
            <div>
              <div className="section-title">{selectedCompetition.name}</div>
              <div className="source-note">{copy.predictions.nextMatches}</div>
            </div>

            {filteredMatches.length > MAX_VISIBLE_MATCHES && (
              <button
                className="text-action"
                onClick={() => navigate(`/matches?cup=${selectedCompetition.id}&filter=${filter}`)}
                type="button"
              >
                {copy.predictions.seeAll}
              </button>
            )}
          </div>

          <div className="matches-scroll">
            {visibleMatches.length > 0 ? (
              visibleMatches.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <div className="card" style={{ textAlign: "center" }}>
                <strong>{copy.predictions.noMatches}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
