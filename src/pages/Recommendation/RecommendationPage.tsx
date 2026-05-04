import { Link } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import type { RecommendationFilters } from "../../types/app";

const quickFilters: Array<{
  label: string;
  filters: RecommendationFilters;
}> = [
  { label: "전체", filters: {} },
  { label: "있는 재료만", filters: { availableOnly: true } },
  { label: "부족 1개 이하", filters: { maxMissingCount: 1 } },
  { label: "20분 이하", filters: { maxCookTimeMinutes: 20 } },
  { label: "쉬움", filters: { difficulty: "easy" } },
];

function isSameFilter(left: RecommendationFilters, right: RecommendationFilters) {
  return (
    left.availableOnly === right.availableOnly &&
    left.maxMissingCount === right.maxMissingCount &&
    left.maxCookTimeMinutes === right.maxCookTimeMinutes &&
    left.difficulty === right.difficulty
  );
}

export function RecommendationPage() {
  const {
    activeAlcohol,
    fixedRecommendationNames,
    isRefreshingRecommendations,
    recommendationFilters,
    recommendations,
    refreshUnlockedRecommendations,
    selectRecommendation,
    toggleRecommendationFixed,
    updateRecommendationFilters,
  } = useAppState();
  const fixedCount = fixedRecommendationNames.length;

  return (
    <section className="screen-panel">
      <div className="screen-toolbar">
        <h1 className="recommendation-heading">
          🍺 인식된 주류 '{activeAlcohol?.name ?? "대기 중"}'에 어울리는 안주 추천
        </h1>
        <div className="screen-toolbar__actions">
          <button
            className="button button--light screen-toolbar__button"
            disabled={isRefreshingRecommendations}
            onClick={() => void refreshUnlockedRecommendations()}
            type="button"
          >
            {isRefreshingRecommendations
              ? "추천 다시 불러오는 중..."
              : fixedCount > 0
                ? `고정 ${fixedCount}개 빼고 다시 추천`
                : "⬅ 다른 추천 보기"}
          </button>
          <Link className="button button--light screen-toolbar__button" to="/">
            🏠 홈으로
          </Link>
        </div>
      </div>

      <div className="recommendation-filter-bar">
        {quickFilters.map((filter) => {
          const isActive = isSameFilter(recommendationFilters, filter.filters);

          return (
            <button
              className={`filter-chip ${isActive ? "filter-chip--active" : ""}`}
              disabled={isRefreshingRecommendations}
              key={filter.label}
              onClick={() => void updateRecommendationFilters(filter.filters)}
              type="button"
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="recommendation-card-grid">
        {recommendations.map((recommendation) => {
          const isFixed = fixedRecommendationNames.includes(recommendation.name);

          return (
            <article
              className={`recommendation-choice-card ${
                isFixed ? "recommendation-choice-card--fixed" : ""
              }`}
              key={recommendation.id}
            >
              <button
                className="recommendation-choice-card__pin"
                onClick={() => toggleRecommendationFixed(recommendation.id)}
                type="button"
              >
                {isFixed ? "고정됨" : "고정"}
              </button>
              <Link
                className="recommendation-choice-card__link"
                onClick={() => selectRecommendation(recommendation.id)}
                to={`/recommendations/${recommendation.id}`}
              >
                <div className="recommendation-choice-card__emoji">
                  {recommendation.icon}
                </div>
                <div className="recommendation-choice-card__meta">
                  {recommendation.priorityRank ? (
                    <span>{recommendation.priorityRank}순위</span>
                  ) : null}
                  {recommendation.cookTimeMinutes ? (
                    <span>{recommendation.cookTimeMinutes}분</span>
                  ) : null}
                  {recommendation.difficulty ? (
                    <span>{recommendation.difficulty}</span>
                  ) : null}
                </div>
                <strong>{recommendation.name}</strong>
                <p>
                  "{recommendation.priorityReason ?? recommendation.shortReason}"
                </p>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
