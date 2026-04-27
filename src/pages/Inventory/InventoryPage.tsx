import { Link } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

export function InventoryPage() {
  const { changeIngredientQuantity, inventory, updatingIngredientId } = useAppState();

  return (
    <section className="screen-panel">
      <div className="screen-toolbar">
        <h1>냉장고 속 식재료 (총 {inventory.length}종)</h1>
        <Link className="button button--light screen-toolbar__button" to="/">
          🏠 홈으로
        </Link>
      </div>

      <div className="inventory-card-grid">
        {inventory.map((ingredient) => {
          const isUpdating = updatingIngredientId === ingredient.id;

          return (
            <article className="inventory-tile" key={ingredient.id}>
              <span className="inventory-tile__count">{ingredient.quantity}</span>
              <div className="inventory-tile__icon">{ingredient.icon}</div>
              <strong>{ingredient.name}</strong>
              <div className="inventory-tile__controls">
                <button
                  className="count-btn"
                  disabled={isUpdating}
                  onClick={() => void changeIngredientQuantity(ingredient.id, -1)}
                  type="button"
                >
                  −
                </button>
                <button
                  className="count-btn"
                  disabled={isUpdating}
                  onClick={() => void changeIngredientQuantity(ingredient.id, 1)}
                  type="button"
                >
                  +
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

