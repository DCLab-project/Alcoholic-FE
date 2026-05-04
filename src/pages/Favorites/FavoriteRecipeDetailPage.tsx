import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import { fetchFavoriteRecipe } from "../../services/api";
import type { FavoriteRecipe } from "../../types/app";

export function FavoriteRecipeDetailPage() {
  const { favoriteId } = useParams();
  const navigate = useNavigate();
  const { deleteFavoriteRecipe, deletingFavoriteId, favoriteRecipes } = useAppState();
  const [remoteFavorite, setRemoteFavorite] = useState<FavoriteRecipe | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const favorite =
    favoriteRecipes.find((item) => item.favoriteId === favoriteId) ?? remoteFavorite;

  useEffect(() => {
    if (!favoriteId || favoriteRecipes.some((item) => item.favoriteId === favoriteId)) {
      return;
    }

    setIsLoadingDetail(true);
    fetchFavoriteRecipe(favoriteId)
      .then(setRemoteFavorite)
      .catch(() => setRemoteFavorite(null))
      .finally(() => setIsLoadingDetail(false));
  }, [favoriteId, favoriteRecipes]);

  if (!favorite) {
    return (
      <section className="screen-panel screen-panel--centered">
        <div className="empty-screen">
          <h2>
            {isLoadingDetail
              ? "저장한 레시피를 불러오는 중입니다."
              : "저장한 레시피를 찾지 못했습니다."}
          </h2>
          <Link className="button button--light" to="/favorites">
            즐겨찾기 목록으로 돌아가기
          </Link>
        </div>
      </section>
    );
  }

  const checklist =
    favorite.ingredientDetails.length > 0
      ? favorite.ingredientDetails.map((item) => ({
          name: item.displayName,
          status: item.status === "available" ? ("have" as const) : ("lack" as const),
          label:
            item.status === "available"
              ? "냉장고에 있음"
              : `${item.amount ?? ""}${item.unit ?? ""} 구매 필요`.trim(),
          detail: item.variantDetail,
        }))
      : [
          ...favorite.availableIngredients.map((name) => ({
            name,
            status: "have" as const,
            label: "냉장고에 있음",
            detail: undefined,
          })),
          ...favorite.unavailableIngredients.map((name) => ({
            name,
            status: "lack" as const,
            label: "부족함 (구매 필요)",
            detail: undefined,
          })),
        ];
  const recipeSteps =
    favorite.structuredRecipeSteps.length > 0
      ? favorite.structuredRecipeSteps
      : favorite.recipeSteps.map((step, index) => ({
          stepNumber: index + 1,
          title: undefined,
          instruction: step,
          timeMinutes: undefined,
          heatLevel: undefined,
          successCue: undefined,
        }));
  const favoriteIdForDelete = favorite.favoriteId;

  async function handleDelete() {
    try {
      await deleteFavoriteRecipe(favoriteIdForDelete);
      navigate("/favorites");
    } catch {
      return;
    }
  }

  return (
    <section className="screen-panel">
      <div className="detail-toolbar">
        <Link className="button button--light screen-toolbar__button" to="/favorites">
          ← 즐겨찾기
        </Link>
        <button
          className="button button--ghost"
          disabled={deletingFavoriteId === favorite.favoriteId}
          onClick={() => void handleDelete()}
          type="button"
        >
          삭제
        </button>
      </div>

      <div className="detail-layout">
        <article className="detail-card">
          <div className="detail-card__header">
            <div className="detail-card__icon">{favorite.icon}</div>
            <div>
              <h2>{favorite.name}</h2>
              <p>
                {favorite.liquorName} 추천으로 저장됨 · {favorite.reason}
              </p>
              <div className="detail-meta-row">
                {favorite.cookTimeMinutes ? <span>{favorite.cookTimeMinutes}분</span> : null}
                {favorite.difficulty ? <span>{favorite.difficulty}</span> : null}
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>재료 체크리스트</h3>
            <div className="ingredient-checklist">
              {checklist.map((item) => (
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
              ))}
            </div>
          </div>

          {favorite.shoppingItems.length > 0 || favorite.substitutionTips.length > 0 ? (
            <div className="detail-section detail-section--compact">
              <h3>장보기/대체</h3>
              {favorite.shoppingItems.length > 0 ? (
                <div className="detail-chip-list">
                  {favorite.shoppingItems.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              ) : null}
              {favorite.substitutionTips.slice(0, 1).map((tip) => (
                <p className="detail-note" key={tip.missingIngredient}>
                  {tip.missingIngredient} 대체: {tip.suggestion}
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
                  </p>
                </div>
              ))}
            </div>
          </div>

          {favorite.pantryItems.length > 0 || favorite.tip ? (
            <div className="detail-section detail-section--compact">
              <h3>추가 팁</h3>
              {favorite.pantryItems.length > 0 ? (
                <p className="detail-note">
                  기본 재료: {favorite.pantryItems.join(", ")}
                </p>
              ) : null}
              {favorite.tip ? <p className="detail-note">{favorite.tip}</p> : null}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
