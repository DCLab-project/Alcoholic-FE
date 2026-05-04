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

  const checklist =
    recommendation.ingredientDetails.length > 0
      ? recommendation.ingredientDetails.map((item) => ({
          name: item.displayName,
          status: item.status === "available" ? ("have" as const) : ("lack" as const),
          label:
            item.status === "available"
              ? "냉장고에 있음"
              : `${item.amount ?? ""}${item.unit ?? ""} 구매 필요`.trim(),
          detail: item.variantDetail,
        }))
      : [
          ...recommendation.availableIngredients.map((name) => ({
            name,
            status: "have" as const,
            label: "냉장고에 있음",
            detail: undefined,
          })),
          ...recommendation.unavailableIngredients.map((name) => ({
            name,
            status: "lack" as const,
            label: "부족함 (구매 필요)",
            detail: undefined,
          })),
        ];
  const recipeSteps =
    recommendation.structuredRecipeSteps.length > 0
      ? recommendation.structuredRecipeSteps
      : recommendation.recipeSteps.map((step, index) => ({
          stepNumber: index + 1,
          title: undefined,
          instruction: step,
          timeMinutes: undefined,
          heatLevel: undefined,
          successCue: undefined,
        }));
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
              <div className="detail-meta-row">
                {recommendation.priorityRank ? (
                  <span>{recommendation.priorityRank}순위</span>
                ) : null}
                {recommendation.cookTimeMinutes ? (
                  <span>{recommendation.cookTimeMinutes}분</span>
                ) : null}
                {recommendation.difficulty ? (
                  <span>{recommendation.difficulty}</span>
                ) : null}
                {recommendation.servings ? <span>{recommendation.servings}인분</span> : null}
              </div>
            </div>
          </div>

          {recommendation.priorityReason || recommendation.selectionFactors.length > 0 ? (
            <div className="detail-section detail-section--compact">
              <h3>추천 근거</h3>
              {recommendation.priorityReason ? (
                <p className="detail-note">{recommendation.priorityReason}</p>
              ) : null}
              {recommendation.selectionFactors.length > 0 ? (
                <div className="detail-chip-list">
                  {recommendation.selectionFactors.slice(0, 2).map((factor) => (
                    <span key={factor}>{factor}</span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="detail-section">
            <h3>재료 체크리스트</h3>
            <div className="ingredient-checklist">
              {checklist.length > 0 ? (
                checklist.map((item) => (
                  <div className="ingredient-checklist__row" key={`${item.status}-${item.name}`}>
                    <span>
                      {item.name}
                      {item.detail ? <small> · {item.detail}</small> : null}
                    </span>
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

          {recommendation.shoppingItems.length > 0 ||
          recommendation.substitutionTips.length > 0 ? (
            <div className="detail-section detail-section--compact">
              <h3>장보기/대체</h3>
              {recommendation.shoppingItems.length > 0 ? (
                <div className="detail-chip-list">
                  {recommendation.shoppingItems.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              ) : null}
              {recommendation.substitutionTips.slice(0, 1).map((tip) => (
                <p className="detail-note" key={tip.missingIngredient}>
                  {tip.missingIngredient} 대체: {tip.suggestion}
                  {tip.note ? ` (${tip.note})` : ""}
                </p>
              ))}
            </div>
          ) : null}
        </article>

        <article className="detail-card">
          <div className="detail-section">
            <h3>조리 순서</h3>
            <div className="recipe-step-list">
              {recipeSteps.map((step) => (
                <div className="recipe-step-list__row" key={`${step.stepNumber}-${step.instruction}`}>
                  <span className="recipe-step-list__number">{step.stepNumber}</span>
                  <p>
                    {step.title ? <strong>{step.title} </strong> : null}
                    {step.instruction}
                    {step.timeMinutes ? <small> · {step.timeMinutes}분</small> : null}
                    {step.heatLevel ? <small> · 불: {step.heatLevel}</small> : null}
                    {step.successCue ? <small> · {step.successCue}</small> : null}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {recommendation.pantryItems.length > 0 ||
          recommendation.pairingKnowledge ||
          recommendation.tip ? (
            <div className="detail-section detail-section--compact">
              <h3>추가 팁</h3>
              {recommendation.pantryItems.length > 0 ? (
                <p className="detail-note">
                  기본 재료: {recommendation.pantryItems.join(", ")}
                </p>
              ) : null}
              {recommendation.pairingKnowledge?.whyThisLiquor ? (
                <p className="detail-note">
                  {recommendation.pairingKnowledge.whyThisLiquor}
                </p>
              ) : null}
              {recommendation.tip ? (
                <p className="detail-note">{recommendation.tip}</p>
              ) : null}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
