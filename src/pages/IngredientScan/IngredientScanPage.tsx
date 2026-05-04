import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppState } from "../../hooks/useAppState";
import { getIngredientAsset } from "../../utils/visualAssets";

export function IngredientScanPage() {
  const {
    discardPendingIngredient,
    isAwaitingIngredientDetection,
    isSavingPendingIngredients,
    isStartingIngredientScan,
    pendingIngredients,
    savePendingIngredient,
    startIngredientScan,
  } = useAppState();
  const [draftName, setDraftName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const detectedIngredient = pendingIngredients[0] ?? null;
  const displayName = draftName.trim() || detectedIngredient?.name;
  const visual = getIngredientAsset(displayName);
  const hasDetectedIngredient = Boolean(detectedIngredient);
  const isScanning =
    isStartingIngredientScan || (isAwaitingIngredientDetection && !hasDetectedIngredient);

  useEffect(() => {
    setDraftName(detectedIngredient?.name ?? "");
    setIsEditingName(false);
  }, [detectedIngredient?.id, detectedIngredient?.name]);

  async function handleStartScan() {
    try {
      await startIngredientScan();
    } catch {
      return;
    }
  }

  async function handleAddIngredient() {
    if (!detectedIngredient) {
      return;
    }

    try {
      await savePendingIngredient(detectedIngredient.id, draftName);
    } catch {
      return;
    }
  }

  async function handleRescan() {
    if (detectedIngredient) {
      discardPendingIngredient(detectedIngredient.id);
    }

    try {
      await startIngredientScan();
    } catch {
      return;
    }
  }

  return (
    <section className="screen-panel screen-panel--centered">
      <div className="scan-screen">
        <div className={`camera-ring ${isScanning ? "camera-ring--active" : ""}`}>
          {hasDetectedIngredient ? (
            <img
              alt={displayName}
              className="camera-ring__image"
              src={visual.imageSrc}
            />
          ) : (
            <span className="camera-ring__emoji">📷</span>
          )}
          <strong className="camera-ring__status">
            {hasDetectedIngredient ? "인식 완료" : isScanning ? "스캔 중" : "대기 중"}
          </strong>
          <span className="camera-ring__name">
            {hasDetectedIngredient ? displayName : "식재료 인식"}
          </span>
        </div>

        <div className="scan-screen__copy">
          <h1>
            {hasDetectedIngredient
              ? `${displayName} 인식 완료`
              : "식재료를 카메라에 보여주세요"}
          </h1>
          <p>
            {hasDetectedIngredient
              ? "결과가 맞으면 추가하고, 다르면 수정하기로 이름을 바꿔주세요."
              : "하나씩 확인한 뒤 보관 중인 식재료에 추가합니다."}
          </p>
        </div>

        {hasDetectedIngredient && isEditingName ? (
          <label className="scan-edit-field">
            <span>식재료 이름</span>
            <input
              autoFocus
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="예: 대파"
              value={draftName}
            />
            <small>입력한 이름에 맞는 저장 이미지가 있으면 즉시 바뀝니다.</small>
          </label>
        ) : null}

        <div className="scan-screen__actions">
          {hasDetectedIngredient ? (
            <>
              <button
                className="button button--primary"
                disabled={isSavingPendingIngredients || !draftName.trim()}
                onClick={() => void handleAddIngredient()}
                type="button"
              >
                {isSavingPendingIngredients ? "추가 중..." : "추가하기"}
              </button>
              <button
                className="button button--light"
                disabled={isSavingPendingIngredients}
                onClick={() => setIsEditingName((current) => !current)}
                type="button"
              >
                {isEditingName ? "수정 취소" : "수정하기"}
              </button>
              <button
                className="button button--light"
                disabled={isStartingIngredientScan || isAwaitingIngredientDetection}
                onClick={() => void handleRescan()}
                type="button"
              >
                다시 스캔
              </button>
            </>
          ) : (
            <button
              className="button button--primary"
              disabled={isStartingIngredientScan || isAwaitingIngredientDetection}
              onClick={() => void handleStartScan()}
              type="button"
            >
              {isStartingIngredientScan ? "스캔 요청 중..." : "식재료 스캔 시작"}
            </button>
          )}
          <Link className="button button--light" to="/">
            홈으로
          </Link>
        </div>

        {pendingIngredients.length > 1 ? (
          <p className="scan-screen__hint">
            대기 중인 식재료가 {pendingIngredients.length - 1}개 더 있습니다.
          </p>
        ) : null}
      </div>
    </section>
  );
}
