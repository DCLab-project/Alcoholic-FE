import { Link } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

export function MainPage() {
  const {
    activeAlcohol,
    errorMessage,
    isAwaitingLiquorDetection,
    isRefreshingRecommendations,
    isStartingLiquorScan,
    recommendations,
    startLiquorScan,
  } = useAppState();
  const hasReadyRecommendations = recommendations.length > 0;
  const liquorStatusLabel = activeAlcohol
    ? isRefreshingRecommendations
      ? "추천 중"
      : hasReadyRecommendations
        ? "준비 완료"
        : errorMessage
          ? "재시도 필요"
          : "인식 완료"
    : isAwaitingLiquorDetection
      ? "스캔 중"
      : "대기 중";
  const liquorStatusDescription = activeAlcohol
    ? isRefreshingRecommendations
      ? `${activeAlcohol.name}에 맞는 안주를 추천하고 있습니다.`
      : hasReadyRecommendations
        ? `${activeAlcohol.name} 추천 3가지를 준비했습니다.`
        : errorMessage
          ? "추천을 다시 받아오지 못했습니다. 다시 감지해 주세요."
          : `${activeAlcohol.name} 감지 완료`
    : isAwaitingLiquorDetection
      ? "카메라에서 주류를 인식하고 있습니다. 잠시만 기다려주세요."
      : "움직임이 감지되었습니다. 마실 주류를 카메라에 보여주세요!";
  const cameraEmoji = activeAlcohol?.icon ?? "📷";
  const isRingActive = isAwaitingLiquorDetection || (activeAlcohol && isRefreshingRecommendations);

  async function handleStartLiquorScan() {
    try {
      await startLiquorScan();
    } catch {
      return;
    }
  }

  return (
    <section className="screen-panel screen-panel--centered">
      <div className="home-screen">
        <div className={`camera-ring ${isRingActive ? "camera-ring--active" : ""}`}>
          <span className="camera-ring__emoji">{cameraEmoji}</span>
          <strong className="camera-ring__status">{liquorStatusLabel}</strong>
          <span className="camera-ring__name">
            {activeAlcohol ? activeAlcohol.name : isAwaitingLiquorDetection ? "인식 대기" : "주류 인식"}
          </span>
        </div>

        <div className="home-screen__copy">
          <h1>
            {activeAlcohol
              ? `${activeAlcohol.name} 인식 완료`
              : isAwaitingLiquorDetection
                ? "주류를 인식하는 중입니다"
                : "냉장고가 대기 중입니다"}
          </h1>
          <p>{liquorStatusDescription}</p>
        </div>

        <div className="home-screen__actions">
          <button
            className="button button--primary"
            disabled={isStartingLiquorScan || isAwaitingLiquorDetection}
            onClick={() => void handleStartLiquorScan()}
            type="button"
          >
            {isStartingLiquorScan
              ? "주류 스캔 요청 중..."
              : isAwaitingLiquorDetection
                ? "주류 스캔 중..."
                : "🍺 주류 스캔"}
          </button>
          <Link className="button button--light" to="/inventory">
            🛒 보관 중인 식재료 보기
          </Link>
          {activeAlcohol ? (
            hasReadyRecommendations ? (
              <Link className="button button--ghost" to="/recommendations">
                🍽 추천 결과 다시 보기
              </Link>
            ) : (
              <button className="button button--ghost" disabled type="button">
                {isRefreshingRecommendations ? "추천 준비 중..." : "추천 결과 대기 중"}
              </button>
            )
          ) : null}
        </div>

        {activeAlcohol ? (
          <div className="home-screen__hint-box">
            <p className="home-screen__hint">최근 감지된 주류: {activeAlcohol.name}</p>
            <p className="home-screen__hint home-screen__hint--strong">
              {isRefreshingRecommendations
                ? "추천 중입니다. 결과가 도착하면 자동으로 추천 화면을 열어줍니다."
                : hasReadyRecommendations
                  ? "추천 결과가 준비되었습니다."
                  : "다음 추천 요청을 대기 중입니다."}
            </p>
          </div>
        ) : isAwaitingLiquorDetection ? (
          <div className="home-screen__hint-box">
            <p className="home-screen__hint">주류 스캔 요청이 접수되었습니다.</p>
            <p className="home-screen__hint home-screen__hint--strong">
              인식 결과가 오면 자동으로 추천 흐름을 이어갑니다.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
