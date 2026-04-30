import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

export function FavoriteRecipesPage() {
  const {
    deleteFavoriteRecipe,
    deletingFavoriteId,
    favoriteRecipes,
    isLoadingFavoriteRecipes,
    loadFavoriteRecipes,
  } = useAppState();

  useEffect(() => {
    void loadFavoriteRecipes();
  }, []);

  async function handleDelete(favoriteId: string) {
    try {
      await deleteFavoriteRecipe(favoriteId);
    } catch {
      return;
    }
  }

  return (
    <section className="screen-panel">
      <div className="screen-toolbar">
        <h1>즐겨찾는 레시피 ({favoriteRecipes.length}개)</h1>
        <div className="screen-toolbar__actions">
          <button
            className="button button--light screen-toolbar__button"
            disabled={isLoadingFavoriteRecipes}
            onClick={() => void loadFavoriteRecipes()}
            type="button"
          >
            {isLoadingFavoriteRecipes ? "불러오는 중..." : "새로고침"}
          </button>
          <Link className="button button--light screen-toolbar__button" to="/">
            🏠 홈으로
          </Link>
        </div>
      </div>

      {favoriteRecipes.length === 0 ? (
        <div className="empty-screen">
          <h2>아직 저장한 레시피가 없습니다.</h2>
          <p>추천 상세 화면에서 하트 버튼을 누르면 이곳에 저장됩니다.</p>
          <Link className="button button--primary" to="/recommendations">
            최근 추천 보러가기
          </Link>
        </div>
      ) : (
        <div className="favorite-card-grid">
          {favoriteRecipes.map((favorite) => (
            <article className="favorite-card" key={favorite.favoriteId}>
              <Link
                className="favorite-card__link"
                to={`/favorites/${favorite.favoriteId}`}
              >
                <span className="favorite-card__liquor">{favorite.liquorName}</span>
                <div className="favorite-card__emoji">{favorite.icon}</div>
                <strong>{favorite.name}</strong>
                <p>{favorite.shortReason}</p>
              </Link>
              <button
                className="button button--ghost button--compact"
                disabled={deletingFavoriteId === favorite.favoriteId}
                onClick={() => void handleDelete(favorite.favoriteId)}
                type="button"
              >
                삭제
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
