import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

export function FavoriteRecipeDetailPage() {
  const { favoriteId } = useParams();
  const navigate = useNavigate();
  const { deleteFavoriteRecipe, deletingFavoriteId, favoriteRecipes } = useAppState();
  const favorite = favoriteRecipes.find((item) => item.favoriteId === favoriteId);

  if (!favorite) {
    return (
      <section className="screen-panel screen-panel--centered">
        <div className="empty-screen">
          <h2>저장한 레시피를 찾지 못했습니다.</h2>
          <Link className="button button--light" to="/favorites">
            즐겨찾기 목록으로 돌아가기
          </Link>
        </div>
      </section>
    );
  }

  const checklist = [
    ...favorite.availableIngredients.map((name) => ({
      name,
      status: "have" as const,
      label: "냉장고에 있음",
    })),
    ...favorite.unavailableIngredients.map((name) => ({
      name,
      status: "lack" as const,
      label: "부족함 (구매 필요)",
    })),
  ];
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
            </div>
          </div>

          <div className="detail-section">
            <h3>재료 체크리스트</h3>
            <div className="ingredient-checklist">
              {checklist.map((item) => (
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
              ))}
            </div>
          </div>
        </article>

        <article className="detail-card">
          <div className="detail-section">
            <h3>조리 순서</h3>
            <div className="recipe-step-list">
              {favorite.recipeSteps.map((step, index) => (
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
