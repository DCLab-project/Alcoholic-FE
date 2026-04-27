import { Link } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

export function RecommendationPage() {
  const {
    activeAlcohol,
    isRefreshingRecommendations,
    recommendations,
    refreshRecommendations,
    selectRecommendation,
  } = useAppState();

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
            onClick={() => void refreshRecommendations()}
            type="button"
          >
            {isRefreshingRecommendations ? "추천 다시 불러오는 중..." : "⬅ 다른 추천 보기"}
          </button>
          <Link className="button button--light screen-toolbar__button" to="/">
            🏠 홈으로
          </Link>
        </div>
      </div>

      <div className="recommendation-card-grid">
        {recommendations.map((recommendation) => (
          <Link
            className="recommendation-choice-card"
            key={recommendation.id}
            onClick={() => selectRecommendation(recommendation.id)}
            to={`/recommendations/${recommendation.id}`}
          >
            <div className="recommendation-choice-card__emoji">{recommendation.icon}</div>
            <strong>{recommendation.name}</strong>
            <p>"{recommendation.shortReason}"</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
