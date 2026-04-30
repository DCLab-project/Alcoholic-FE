import { Link } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

export function RecommendationPage() {
  const {
    activeAlcohol,
    fixedRecommendationNames,
    isRefreshingRecommendations,
    recommendations,
    refreshUnlockedRecommendations,
    selectRecommendation,
    toggleRecommendationFixed,
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
                <strong>{recommendation.name}</strong>
                <p>"{recommendation.shortReason}"</p>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
