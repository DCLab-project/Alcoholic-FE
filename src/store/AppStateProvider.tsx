import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  apiMappers,
  connectIngredientStream,
  connectLiquorStream,
  fetchInventory,
  fetchRecommendations,
  patchIngredientQuantity,
  persistDetectedIngredients,
  startLiquorScan,
} from "../services/api";
import type { AppSnapshot, AppStateValue } from "../types/app";

const initialSnapshot: AppSnapshot = {
  systemStatus: {
    fridgeTemperature: "냉장 3℃",
    freezerTemperature: "냉동 -18℃",
    networkLabel: "스트림 연결 중",
    lastSensorEvent: "센서 대기",
  },
  pendingIngredients: [],
  inventory: [],
  activeAlcohol: null,
  recommendations: [],
};

const AppStateContext = createContext<AppStateValue | null>(null);

function formatSensorTime(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(initialSnapshot);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<
    string | null
  >(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAwaitingLiquorDetection, setIsAwaitingLiquorDetection] =
    useState(false);
  const [isSavingPendingIngredients, setIsSavingPendingIngredients] =
    useState(false);
  const [isStartingLiquorScan, setIsStartingLiquorScan] = useState(false);
  const [isRefreshingRecommendations, setIsRefreshingRecommendations] =
    useState(false);
  const [updatingIngredientId, setUpdatingIngredientId] = useState<string | null>(
    null,
  );
  const ingredientSequenceRef = useRef(0);
  const recommendationRequestRef = useRef(0);

  useEffect(() => {
    void loadInventory();

    const closeIngredientStream = connectIngredientStream(
      (payload) => {
        ingredientSequenceRef.current += 1;
        const nextIngredient = apiMappers.mapIngredientDetection(
          payload,
          ingredientSequenceRef.current,
        );

        setSnapshot((current) => ({
          ...current,
          pendingIngredients: [...current.pendingIngredients, nextIngredient],
          systemStatus: {
            ...current.systemStatus,
            networkLabel: "SSE 연결됨",
            lastSensorEvent: `${formatSensorTime(payload.timestamp)} ${payload.ingredient_name} 감지`,
          },
        }));
      },
      () => {
        setSnapshot((current) => ({
          ...current,
          systemStatus: {
            ...current.systemStatus,
            networkLabel: "식재료 스트림 재연결 중",
          },
        }));
      },
    );

    const closeLiquorStream = connectLiquorStream(
      (payload) => {
        const detection = apiMappers.mapLiquorDetection(payload);
        setIsAwaitingLiquorDetection(false);
        setSelectedRecommendationId(null);

        setSnapshot((current) => ({
          ...current,
          activeAlcohol: detection,
          recommendations: [],
          systemStatus: {
            ...current.systemStatus,
            networkLabel: "SSE 연결됨",
            lastSensorEvent: `${formatSensorTime(payload.timestamp)} ${payload.liquor_name} 감지`,
          },
        }));

        void loadRecommendations(payload.liquor_name, false);
      },
      () => {
        setSnapshot((current) => ({
          ...current,
          systemStatus: {
            ...current.systemStatus,
            networkLabel: "주류 스트림 재연결 중",
          },
        }));
      },
    );

    return () => {
      closeIngredientStream();
      closeLiquorStream();
    };
  }, []);

  function syncRecommendationSelection(nextRecommendationIds: string[]) {
    setSelectedRecommendationId((current) => {
      if (current && nextRecommendationIds.includes(current)) {
        return current;
      }

      return nextRecommendationIds[0] ?? null;
    });
  }

  async function loadInventory() {
    setIsBootstrapping(true);
    setErrorMessage(null);

    try {
      const inventory = await fetchInventory();
      setSnapshot((current) => ({
        ...current,
        inventory,
        systemStatus: {
          ...current.systemStatus,
          networkLabel: "API 연결됨",
        },
      }));
    } catch {
      setErrorMessage("재고 목록을 불러오지 못했습니다.");
    } finally {
      setIsBootstrapping(false);
    }
  }

  async function loadRecommendations(liquorName: string, refresh: boolean) {
    const requestId = recommendationRequestRef.current + 1;
    recommendationRequestRef.current = requestId;
    setIsRefreshingRecommendations(true);
    setErrorMessage(null);

    try {
      const recommendations = await fetchRecommendations(liquorName, refresh);

      if (recommendationRequestRef.current !== requestId) {
        return;
      }

      setSnapshot((current) => ({
        ...current,
        recommendations,
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: refresh
            ? `${liquorName} 기준 다른 추천 요청 완료`
            : `${liquorName} 기준 추천 3종 수신`,
        },
      }));
      syncRecommendationSelection(recommendations.map((item) => item.id));
    } catch {
      if (recommendationRequestRef.current === requestId) {
        setErrorMessage("안주 추천을 불러오지 못했습니다.");
      }
    } finally {
      if (recommendationRequestRef.current === requestId) {
        setIsRefreshingRecommendations(false);
      }
    }
  }

  async function handleSavePendingIngredients() {
    const itemsToSave = snapshot.pendingIngredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
    }));
    const itemNames = itemsToSave.map((ingredient) => ingredient.name);

    if (itemNames.length === 0) {
      return;
    }

    setIsSavingPendingIngredients(true);
    setErrorMessage(null);

    try {
      await persistDetectedIngredients(itemNames);
      const inventory = await fetchInventory();
      const savedIds = new Set(itemsToSave.map((ingredient) => ingredient.id));

      setSnapshot((current) => ({
        ...current,
        inventory,
        pendingIngredients: current.pendingIngredients.filter(
          (ingredient) => !savedIds.has(ingredient.id),
        ),
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: "감지 식재료 저장 완료",
        },
      }));
    } catch {
      setErrorMessage("감지된 식재료 저장에 실패했습니다.");
      throw new Error("save-pending-ingredients-failed");
    } finally {
      setIsSavingPendingIngredients(false);
    }
  }

  async function handleChangeIngredientQuantity(
    ingredientId: string,
    delta: number,
  ) {
    setUpdatingIngredientId(ingredientId);
    setErrorMessage(null);

    try {
      const response = await patchIngredientQuantity(
        ingredientId,
        delta > 0 ? "add" : "subtract",
      );
      const inventory = await fetchInventory();

      setSnapshot((current) => ({
        ...current,
        inventory,
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: `${response.ingredient_name} 수량 수정 완료`,
        },
      }));
    } catch {
      setErrorMessage("식재료 수량 반영에 실패했습니다.");
    } finally {
      setUpdatingIngredientId(null);
    }
  }

  async function handleRefreshRecommendations() {
    if (!snapshot.activeAlcohol) {
      setErrorMessage("감지된 술이 없어 다른 추천을 요청할 수 없습니다.");
      return;
    }

    await loadRecommendations(snapshot.activeAlcohol.name, true);
  }

  async function handleStartLiquorScan() {
    setIsStartingLiquorScan(true);
    setIsAwaitingLiquorDetection(true);
    setSelectedRecommendationId(null);
    setErrorMessage(null);

    setSnapshot((current) => ({
      ...current,
      activeAlcohol: null,
      recommendations: [],
      systemStatus: {
        ...current.systemStatus,
        lastSensorEvent: "주류 스캔 요청 중",
      },
    }));

    try {
      const response = await startLiquorScan();

      setSnapshot((current) => ({
        ...current,
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: response.message,
        },
      }));
    } catch {
      setIsAwaitingLiquorDetection(false);
      setErrorMessage("주류 스캔 시작 요청에 실패했습니다.");
      throw new Error("start-liquor-scan-failed");
    } finally {
      setIsStartingLiquorScan(false);
    }
  }

  const value: AppStateValue = {
    ...snapshot,
    errorMessage,
    isBootstrapping,
    isAwaitingLiquorDetection,
    isSavingPendingIngredients,
    isStartingLiquorScan,
    isRefreshingRecommendations,
    updatingIngredientId,
    selectedRecommendationId,
    refreshSnapshot: loadInventory,
    savePendingIngredients: handleSavePendingIngredients,
    startLiquorScan: handleStartLiquorScan,
    changeIngredientQuantity: handleChangeIngredientQuantity,
    refreshRecommendations: handleRefreshRecommendations,
    selectRecommendation: setSelectedRecommendationId,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppStateContext() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppStateContext must be used within AppStateProvider");
  }

  return context;
}
