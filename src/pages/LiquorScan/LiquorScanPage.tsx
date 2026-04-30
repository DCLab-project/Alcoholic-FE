import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import { getLiquorAsset } from "../../utils/visualAssets";

const MIN_RECOMMENDATION_LOADING_MS = 3000;

export function LiquorScanPage() {
  const navigate = useNavigate();
  const {
    activeAlcohol,
    isAwaitingLiquorDetection,
    isRefreshingRecommendations,
    isStartingLiquorScan,
    recommendations,
    startLiquorScan,
  } = useAppState();
  const [hasShownMinimumLoading, setHasShownMinimumLoading] = useState(false);
  const activeAlcoholIdRef = useRef<string | null>(null);
  const hasDetectedLiquor = Boolean(activeAlcohol);
  const visual = getLiquorAsset(activeAlcohol?.name);
  const isScanning = isStartingLiquorScan || (isAwaitingLiquorDetection && !activeAlcohol);
  const isRecommending =
    hasDetectedLiquor &&
    (isRefreshingRecommendations ||
      !hasShownMinimumLoading ||
      recommendations.length === 0);

  useEffect(() => {
    if (!activeAlcohol || activeAlcoholIdRef.current === activeAlcohol.id) {
      return;
    }

    activeAlcoholIdRef.current = activeAlcohol.id;
    setHasShownMinimumLoading(false);

    const timeoutId = window.setTimeout(() => {
      setHasShownMinimumLoading(true);
    }, MIN_RECOMMENDATION_LOADING_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeAlcohol]);

  useEffect(() => {
    if (activeAlcohol && hasShownMinimumLoading && recommendations.length > 0) {
      navigate("/recommendations");
    }
  }, [activeAlcohol, hasShownMinimumLoading, navigate, recommendations.length]);

  async function handleStartScan() {
    setHasShownMinimumLoading(false);

    try {
      await startLiquorScan();
    } catch {
      return;
    }
  }

  return (
    <section className="screen-panel screen-panel--centered">
      <div className="scan-screen">
        <div className={`camera-ring ${isScanning || isRecommending ? "camera-ring--active" : ""}`}>
          {hasDetectedLiquor ? (
            <img
              alt={activeAlcohol?.name}
              className="camera-ring__image"
              src={visual.imageSrc}
            />
          ) : (
            <span className="camera-ring__emoji">📷</span>
          )}
          <strong className="camera-ring__status">
            {hasDetectedLiquor
              ? "추천 중"
              : isScanning
                ? "스캔 중"
                : "대기 중"}
          </strong>
          <span className="camera-ring__name">
            {hasDetectedLiquor ? activeAlcohol?.name : "주류 인식"}
          </span>
        </div>

        <div className="scan-screen__copy">
          <h1>
            {hasDetectedLiquor
              ? `${activeAlcohol?.name} 인식 완료`
              : "마실 주류를 카메라에 보여주세요"}
          </h1>
          <p>
            {hasDetectedLiquor
              ? "안주를 추천하고 있습니다. 잠시만 기다려주세요."
              : "인식된 주류에 맞춰 보관 재료 기반 안주를 추천합니다."}
          </p>
        </div>

        <div className="scan-screen__actions">
          {!hasDetectedLiquor ? (
            <button
              className="button button--primary"
              disabled={isStartingLiquorScan || isAwaitingLiquorDetection}
              onClick={() => void handleStartScan()}
              type="button"
            >
              {isStartingLiquorScan ? "스캔 요청 중..." : "주류 스캔 시작"}
            </button>
          ) : (
            <Link className="button button--light" to="/recommendations">
              추천 결과 보기
            </Link>
          )}
          <Link className="button button--light" to="/">
            홈으로
          </Link>
        </div>

        {isRefreshingRecommendations ? (
          <p className="scan-screen__hint">추천 결과를 불러오는 중입니다.</p>
        ) : null}
      </div>
    </section>
  );
}
