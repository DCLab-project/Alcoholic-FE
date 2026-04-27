import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

export function DetectedIngredientsPage() {
  const { isSavingPendingIngredients, pendingIngredients, savePendingIngredients } =
    useAppState();
  const navigate = useNavigate();

  const groupedIngredients = pendingIngredients.reduce<
    Record<string, typeof pendingIngredients>
  >((accumulator, ingredient) => {
    if (!accumulator[ingredient.name]) {
      accumulator[ingredient.name] = [];
    }

    accumulator[ingredient.name].push(ingredient);
    return accumulator;
  }, {});

  async function handleSave() {
    try {
      await savePendingIngredients();
      navigate("/inventory");
    } catch {
      return;
    }
  }

  return (
    <section className="screen-panel">
      <div className="screen-toolbar">
        <h1>감지된 식재료 검토</h1>
        <div className="screen-toolbar__actions">
          <button
            className="button button--primary screen-toolbar__button"
            disabled={pendingIngredients.length === 0 || isSavingPendingIngredients}
            onClick={() => void handleSave()}
            type="button"
          >
            {isSavingPendingIngredients ? "저장 중..." : "저장"}
          </button>
          <Link className="button button--light screen-toolbar__button" to="/">
            🏠 홈으로
          </Link>
        </div>
      </div>

      <div className="detected-screen">
        <aside className="detected-screen__summary">
          <h2>실시간 감지 목록</h2>
          <p>같은 품목은 중복 그대로 세로로 쌓아 보여줍니다.</p>
          <div className="detected-screen__stats">
            <div>
              <span>총 감지 수</span>
              <strong>{pendingIngredients.length}개</strong>
            </div>
            <div>
              <span>품목 종류</span>
              <strong>{Object.keys(groupedIngredients).length}종</strong>
            </div>
          </div>
        </aside>

        <div className="detected-screen__grid">
          {Object.entries(groupedIngredients).map(([name, items]) => (
            <article className="detected-screen__card" key={name}>
              <div className="detected-screen__card-header">
                <span className="detected-screen__icon">{items[0]?.icon ?? "🥣"}</span>
                <div>
                  <strong>{name}</strong>
                  <p>{items.length}회 감지</p>
                </div>
              </div>

              <div className="detected-screen__stack">
                {items.map((item) => (
                  <div className="detected-screen__pill" key={item.id}>
                    {item.name}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
