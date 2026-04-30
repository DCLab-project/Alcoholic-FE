import { Link, useParams } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

export function RecommendationDetailPage() {
  const { recommendationId } = useParams();
  const {
    activeAlcohol,
    favoriteRecipes,
    recommendations,
    saveFavoriteRecipe,
    savingFavoriteRecommendationId,
  } = useAppState();

  const recommendation = recommendations.find((item) => item.id === recommendationId);

  if (!recommendation) {
    return (
      <section className="screen-panel screen-panel--centered">
        <div className="empty-screen">
          <h2>추천 결과를 찾지 못했습니다.</h2>
          <Link className="button button--light" to="/recommendations">
            추천 목록으로 돌아가기
          </Link>
        </div>
      </section>
    );
  }

  const checklist = [
    ...recommendation.availableIngredients.map((name) => ({
      name,
      status: "have" as const,
      label: "냉장고에 있음",
    })),
    ...recommendation.unavailableIngredients.map((name) => ({
      name,
      status: "lack" as const,
      label: "부족함 (구매 필요)",
    })),
  ];
  const isSaved = favoriteRecipes.some(
    (favorite) =>
      favorite.name === recommendation.name &&
      favorite.liquorName === (activeAlcohol?.name ?? favorite.liquorName),
  );
  const isSavingFavorite = savingFavoriteRecommendationId === recommendation.id;
  const recommendationIdForSave = recommendation.id;

  async function handleSaveFavorite() {
    try {
      await saveFavoriteRecipe(recommendationIdForSave);
    } catch {
      return;
    }
  }

  return (
    <section className="screen-panel">
      <div className="detail-toolbar">
        <Link className="button button--light screen-toolbar__button" to="/recommendations">
          ← 뒤로가기
        </Link>
        <div className="screen-toolbar__actions">
          <button
            className={isSaved ? "button button--light" : "button button--primary"}
            disabled={isSaved || isSavingFavorite}
            onClick={() => void handleSaveFavorite()}
            type="button"
          >
            {isSaved ? "♡ 저장됨" : isSavingFavorite ? "저장 중..." : "♡ 즐겨찾기 저장"}
          </button>
          <Link className="button button--primary screen-toolbar__button" to="/">
            🏠 완료
          </Link>
        </div>
      </div>

      <div className="detail-layout">
        <article className="detail-card">
          <div className="detail-card__header">
            <div className="detail-card__icon">{recommendation.icon}</div>
            <div>
              <h2>{recommendation.name}</h2>
              <p>{recommendation.reason}</p>
            </div>
          </div>

          <div className="detail-section">
            <h3>재료 체크리스트</h3>
            <div className="ingredient-checklist">
              {checklist.length > 0 ? (
                checklist.map((item) => (
                  <div className="ingredient-checklist__row" key={`${item.status}-${item.name}`}>
                    <span>{item.name}</span>
                    <strong
                      className={
                        item.status === "have"
                          ? "ingredient-checklist__status ingredient-checklist__status--have"
                          : "ingredient-checklist__status ingredient-checklist__status--lack"
                      }
                    >
                      {item.status === "have" ? "✅ " : "❌ "}
                      {item.label}
                    </strong>
                  </div>
                ))
              ) : (
                <div className="ingredient-checklist__row">
                  <span>부족 식재료 정보가 없습니다.</span>
                </div>
              )}
            </div>
          </div>
        </article>

        <article className="detail-card">
          <div className="detail-section">
            <h3>조리 순서</h3>
            <div className="recipe-step-list">
              {recommendation.recipeSteps.map((step, index) => (
                <div className="recipe-step-list__row" key={step}>
                  <span className="recipe-step-list__number">{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
