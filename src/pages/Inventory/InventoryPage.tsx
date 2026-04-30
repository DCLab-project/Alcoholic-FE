import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import type { StoredIngredient } from "../../types/app";
import { getIngredientAsset } from "../../utils/visualAssets";

export function InventoryPage() {
  const {
    changeIngredientQuantity,
    createInventoryIngredient,
    deleteInventoryIngredient,
    editInventoryIngredient,
    inventory,
    isCreatingInventoryIngredient,
    updatingIngredientId,
  } = useAppState();
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientQuantity, setNewIngredientQuantity] = useState(1);
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingQuantity, setEditingQuantity] = useState(1);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createInventoryIngredient(newIngredientName, newIngredientQuantity);
      setNewIngredientName("");
      setNewIngredientQuantity(1);
    } catch {
      return;
    }
  }

  function beginEdit(ingredient: StoredIngredient) {
    setEditingIngredientId(ingredient.id);
    setEditingName(ingredient.name);
    setEditingQuantity(ingredient.quantity);
  }

  async function handleSaveEdit(ingredient: StoredIngredient) {
    try {
      await editInventoryIngredient(ingredient.id, editingName, editingQuantity);
      setEditingIngredientId(null);
    } catch {
      return;
    }
  }

  async function handleDelete(ingredient: StoredIngredient) {
    try {
      await deleteInventoryIngredient(ingredient.id);
    } catch {
      return;
    }
  }

  return (
    <section className="screen-panel">
      <div className="screen-toolbar">
        <h1>냉장고 속 식재료 (총 {inventory.length}종)</h1>
        <Link className="button button--light screen-toolbar__button" to="/">
          🏠 홈으로
        </Link>
      </div>

      <form className="inventory-create-panel" onSubmit={(event) => void handleCreate(event)}>
        <div>
          <strong>식재료 직접 등록</strong>
          <p>인식이 안 됐거나 수동으로 넣고 싶은 식재료를 추가합니다.</p>
        </div>
        <input
          aria-label="새 식재료 이름"
          onChange={(event) => setNewIngredientName(event.target.value)}
          placeholder="식재료 이름"
          value={newIngredientName}
        />
        <input
          aria-label="새 식재료 수량"
          min={1}
          onChange={(event) => setNewIngredientQuantity(Number(event.target.value))}
          type="number"
          value={newIngredientQuantity}
        />
        <button
          className="button button--primary"
          disabled={isCreatingInventoryIngredient || !newIngredientName.trim()}
          type="submit"
        >
          {isCreatingInventoryIngredient ? "등록 중..." : "등록"}
        </button>
      </form>

      <div className="inventory-card-grid">
        {inventory.map((ingredient) => {
          const isUpdating = updatingIngredientId === ingredient.id;
          const isEditing = editingIngredientId === ingredient.id;
          const visual = getIngredientAsset(isEditing ? editingName : ingredient.name);

          return (
            <article
              className={`inventory-tile ${isEditing ? "inventory-tile--editing" : ""}`}
              key={ingredient.id}
            >
              <span className="inventory-tile__count">
                {isEditing ? editingQuantity : ingredient.quantity}
              </span>
              <img
                alt={isEditing ? editingName : ingredient.name}
                className="inventory-tile__image"
                src={visual.imageSrc}
              />

              {isEditing ? (
                <div className="inventory-edit-form">
                  <input
                    aria-label={`${ingredient.name} 이름 수정`}
                    onChange={(event) => setEditingName(event.target.value)}
                    value={editingName}
                  />
                  <input
                    aria-label={`${ingredient.name} 수량 수정`}
                    min={0}
                    onChange={(event) => setEditingQuantity(Number(event.target.value))}
                    type="number"
                    value={editingQuantity}
                  />
                </div>
              ) : (
                <strong>{ingredient.name}</strong>
              )}

              {isEditing ? (
                <div className="inventory-tile__actions">
                  <button
                    className="button button--primary button--compact"
                    disabled={isUpdating || !editingName.trim()}
                    onClick={() => void handleSaveEdit(ingredient)}
                    type="button"
                  >
                    저장
                  </button>
                  <button
                    className="button button--light button--compact"
                    disabled={isUpdating}
                    onClick={() => setEditingIngredientId(null)}
                    type="button"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <>
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
                  <div className="inventory-tile__actions">
                    <button
                      className="button button--light button--compact"
                      disabled={isUpdating}
                      onClick={() => beginEdit(ingredient)}
                      type="button"
                    >
                      수정
                    </button>
                    <button
                      className="button button--ghost button--compact"
                      disabled={isUpdating}
                      onClick={() => void handleDelete(ingredient)}
                      type="button"
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
