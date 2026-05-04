import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

export function MainPage() {
  const navigate = useNavigate();
  const {
    isAwaitingIngredientDetection,
    isAwaitingLiquorDetection,
    isStartingIngredientScan,
    isStartingLiquorScan,
    recommendations,
    startIngredientScan,
    startLiquorScan,
  } = useAppState();
  const hasReadyRecommendations = recommendations.length > 0;

  async function handleStartIngredientScan() {
    navigate("/scan/ingredient");

    try {
      await startIngredientScan();
    } catch {
      return;
    }
  }

  async function handleStartLiquorScan() {
    navigate("/scan/liquor");

    try {
      await startLiquorScan();
    } catch {
      return;
    }
  }

  return (
    <section className="screen-panel home-dashboard">
      <div className="home-dashboard__hero">
        <div>
          <span className="home-dashboard__eyebrow">AI 냉장고 홈</span>
          <h1>오늘의 냉장고를 확인하고 안주를 추천받아보세요</h1>
        </div>
        <p>
          식재료를 넣을 때는 식재료 스캔, 
          <br />
          마실 술을 고를 때는 주류 스캔을 시작하세요.
        </p>
      </div>

      <div className="home-dashboard__grid">
        <button
          className="home-action-card home-action-card--primary"
          disabled={isStartingIngredientScan || isAwaitingIngredientDetection}
          onClick={() => void handleStartIngredientScan()}
          type="button"
        >
          <span className="home-action-card__icon">🥬</span>
          <strong>식재료 스캔</strong>
          <span>
            {isStartingIngredientScan || isAwaitingIngredientDetection
              ? "식재료 인식 중"
              : "새 식재료를 카메라로 확인"}
          </span>
        </button>

        <button
          className="home-action-card"
          disabled={isStartingLiquorScan || isAwaitingLiquorDetection}
          onClick={() => void handleStartLiquorScan()}
          type="button"
        >
          <span className="home-action-card__icon">🍶</span>
          <strong>주류 스캔</strong>
          <span>
            {isStartingLiquorScan || isAwaitingLiquorDetection
              ? "주류 인식 중"
              : "마실 술에 맞는 안주 추천"}
          </span>
        </button>

        <Link className="home-action-card" to="/inventory">
          <span className="home-action-card__icon">🛒</span>
          <strong>보관 중인 식재료 보기</strong>
          <span>재고 수량을 확인하고 조절</span>
        </Link>

        <Link className="home-action-card" to="/favorites">
          <span className="home-action-card__icon">♡</span>
          <strong>즐겨찾는 레시피 보기</strong>
          <span>
            {hasReadyRecommendations
              ? "저장한 레시피와 최근 추천 확인"
              : "하트로 저장한 안주 모아보기"}
          </span>
        </Link>
      </div>
    </section>
  );
}
