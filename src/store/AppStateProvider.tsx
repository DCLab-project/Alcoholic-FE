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
  createInventoryIngredient,
  fetchFavoriteRecipes,
  fetchInventory,
  fetchRecommendations,
  patchIngredientQuantity,
  persistDetectedIngredients,
  persistFavoriteRecipe,
  refreshRecommendationsWithKeep,
  removeFavoriteRecipe,
  removeInventoryIngredient,
  startIngredientScan,
  startLiquorScan,
  updateInventoryIngredient,
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
  favoriteRecipes: [],
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
  const [isAwaitingIngredientDetection, setIsAwaitingIngredientDetection] =
    useState(false);
  const [isAwaitingLiquorDetection, setIsAwaitingLiquorDetection] =
    useState(false);
  const [isSavingPendingIngredients, setIsSavingPendingIngredients] =
    useState(false);
  const [isStartingIngredientScan, setIsStartingIngredientScan] =
    useState(false);
  const [isStartingLiquorScan, setIsStartingLiquorScan] = useState(false);
  const [isRefreshingRecommendations, setIsRefreshingRecommendations] =
    useState(false);
  const [isCreatingInventoryIngredient, setIsCreatingInventoryIngredient] =
    useState(false);
  const [isLoadingFavoriteRecipes, setIsLoadingFavoriteRecipes] = useState(false);
  const [savingFavoriteRecommendationId, setSavingFavoriteRecommendationId] =
    useState<string | null>(null);
  const [deletingFavoriteId, setDeletingFavoriteId] = useState<string | null>(null);
  const [updatingIngredientId, setUpdatingIngredientId] = useState<string | null>(
    null,
  );
  const [fixedRecommendationNames, setFixedRecommendationNames] = useState<string[]>(
    [],
  );
  const ingredientSequenceRef = useRef(0);
  const recommendationRequestRef = useRef(0);

  useEffect(() => {
    void loadInventory();
    void loadFavoriteRecipes();

    const closeIngredientStream = connectIngredientStream(
      (payload) => {
        ingredientSequenceRef.current += 1;
        const nextIngredient = apiMappers.mapIngredientDetection(
          payload,
          ingredientSequenceRef.current,
        );
        setIsAwaitingIngredientDetection(false);

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
        setFixedRecommendationNames([]);

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

  async function loadFavoriteRecipes() {
    setIsLoadingFavoriteRecipes(true);
    setErrorMessage(null);

    try {
      const favoriteRecipes = await fetchFavoriteRecipes();
      setSnapshot((current) => ({
        ...current,
        favoriteRecipes,
      }));
    } catch {
      setErrorMessage("즐겨찾는 레시피를 불러오지 못했습니다.");
    } finally {
      setIsLoadingFavoriteRecipes(false);
    }
  }

  async function loadRecommendations(
    liquorName: string,
    refresh: boolean,
    keepRecommendations: AppSnapshot["recommendations"] = [],
  ) {
    const requestId = recommendationRequestRef.current + 1;
    recommendationRequestRef.current = requestId;
    setIsRefreshingRecommendations(true);
    setErrorMessage(null);

    try {
      const recommendations =
        keepRecommendations.length > 0
          ? await refreshRecommendationsWithKeep(liquorName, keepRecommendations)
          : await fetchRecommendations(liquorName, refresh);

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
      setFixedRecommendationNames((current) =>
        current.filter((name) =>
          recommendations.some((recommendation) => recommendation.name === name),
        ),
      );
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

  async function handleSavePendingIngredient(
    ingredientId: string,
    ingredientName: string,
  ) {
    const itemName = ingredientName.trim();

    if (!itemName) {
      setErrorMessage("추가할 식재료 이름을 입력해주세요.");
      throw new Error("empty-ingredient-name");
    }

    setIsSavingPendingIngredients(true);
    setErrorMessage(null);

    try {
      await persistDetectedIngredients([itemName]);
      const inventory = await fetchInventory();

      setSnapshot((current) => ({
        ...current,
        inventory,
        pendingIngredients: current.pendingIngredients.filter(
          (ingredient) => ingredient.id !== ingredientId,
        ),
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: `${itemName} 보관함 추가 완료`,
        },
      }));
    } catch {
      setErrorMessage("식재료 추가에 실패했습니다.");
      throw new Error("save-pending-ingredient-failed");
    } finally {
      setIsSavingPendingIngredients(false);
    }
  }

  function handleDiscardPendingIngredient(ingredientId: string) {
    setSnapshot((current) => ({
      ...current,
      pendingIngredients: current.pendingIngredients.filter(
        (ingredient) => ingredient.id !== ingredientId,
      ),
    }));
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

  async function handleCreateInventoryIngredient(
    ingredientName: string,
    quantity: number,
  ) {
    const itemName = ingredientName.trim();
    const safeQuantity = Math.max(1, Math.floor(quantity));

    if (!itemName) {
      setErrorMessage("식재료 이름을 입력해주세요.");
      throw new Error("empty-inventory-name");
    }

    setIsCreatingInventoryIngredient(true);
    setErrorMessage(null);

    try {
      await createInventoryIngredient(itemName, safeQuantity);
      const inventory = await fetchInventory();

      setSnapshot((current) => ({
        ...current,
        inventory,
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: `${itemName} ${safeQuantity}개 등록 완료`,
        },
      }));
    } catch {
      setErrorMessage("식재료 등록에 실패했습니다.");
      throw new Error("create-inventory-ingredient-failed");
    } finally {
      setIsCreatingInventoryIngredient(false);
    }
  }

  async function handleEditInventoryIngredient(
    currentIngredientName: string,
    nextIngredientName: string,
    quantity: number,
  ) {
    const nextName = nextIngredientName.trim();
    const safeQuantity = Math.max(0, Math.floor(quantity));

    if (!nextName) {
      setErrorMessage("식재료 이름을 입력해주세요.");
      throw new Error("empty-inventory-name");
    }

    setUpdatingIngredientId(currentIngredientName);
    setErrorMessage(null);

    try {
      await updateInventoryIngredient(currentIngredientName, nextName, safeQuantity);
      const inventory = await fetchInventory();

      setSnapshot((current) => ({
        ...current,
        inventory,
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: `${nextName} 정보 수정 완료`,
        },
      }));
    } catch {
      setErrorMessage("식재료 수정에 실패했습니다.");
      throw new Error("edit-inventory-ingredient-failed");
    } finally {
      setUpdatingIngredientId(null);
    }
  }

  async function handleDeleteInventoryIngredient(ingredientName: string) {
    setUpdatingIngredientId(ingredientName);
    setErrorMessage(null);

    try {
      await removeInventoryIngredient(ingredientName);
      const inventory = await fetchInventory();

      setSnapshot((current) => ({
        ...current,
        inventory,
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: `${ingredientName} 삭제 완료`,
        },
      }));
    } catch {
      setErrorMessage("식재료 삭제에 실패했습니다.");
      throw new Error("delete-inventory-ingredient-failed");
    } finally {
      setUpdatingIngredientId(null);
    }
  }

  async function handleRefreshRecommendations() {
    if (!snapshot.activeAlcohol) {
      setErrorMessage("감지된 술이 없어 다른 추천을 요청할 수 없습니다.");
      return;
    }

    setFixedRecommendationNames([]);
    await loadRecommendations(snapshot.activeAlcohol.name, true);
  }

  async function handleRefreshUnlockedRecommendations() {
    if (!snapshot.activeAlcohol) {
      setErrorMessage("감지된 술이 없어 다른 추천을 요청할 수 없습니다.");
      return;
    }

    const keepRecommendations = snapshot.recommendations.filter((recommendation) =>
      fixedRecommendationNames.includes(recommendation.name),
    );

    await loadRecommendations(
      snapshot.activeAlcohol.name,
      true,
      keepRecommendations,
    );
  }

  function handleToggleRecommendationFixed(recommendationId: string) {
    const recommendation = snapshot.recommendations.find(
      (item) => item.id === recommendationId,
    );

    if (!recommendation) {
      return;
    }

    setFixedRecommendationNames((current) =>
      current.includes(recommendation.name)
        ? current.filter((name) => name !== recommendation.name)
        : [...current, recommendation.name],
    );
  }

  async function handleSaveFavoriteRecipe(recommendationId: string) {
    const recommendation = snapshot.recommendations.find(
      (item) => item.id === recommendationId,
    );

    if (!snapshot.activeAlcohol || !recommendation) {
      setErrorMessage("저장할 추천 레시피를 찾지 못했습니다.");
      throw new Error("favorite-recipe-not-found");
    }

    setSavingFavoriteRecommendationId(recommendationId);
    setErrorMessage(null);

    try {
      await persistFavoriteRecipe(snapshot.activeAlcohol.name, recommendation);
      const favoriteRecipes = await fetchFavoriteRecipes();

      setSnapshot((current) => ({
        ...current,
        favoriteRecipes,
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: `${recommendation.name} 즐겨찾기 저장 완료`,
        },
      }));
    } catch {
      setErrorMessage("즐겨찾기 저장에 실패했습니다.");
      throw new Error("save-favorite-recipe-failed");
    } finally {
      setSavingFavoriteRecommendationId(null);
    }
  }

  async function handleDeleteFavoriteRecipe(favoriteId: string) {
    setDeletingFavoriteId(favoriteId);
    setErrorMessage(null);

    try {
      await removeFavoriteRecipe(favoriteId);
      const favoriteRecipes = await fetchFavoriteRecipes();

      setSnapshot((current) => ({
        ...current,
        favoriteRecipes,
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: "즐겨찾기 삭제 완료",
        },
      }));
    } catch {
      setErrorMessage("즐겨찾기 삭제에 실패했습니다.");
      throw new Error("delete-favorite-recipe-failed");
    } finally {
      setDeletingFavoriteId(null);
    }
  }

  async function handleStartIngredientScan() {
    setIsStartingIngredientScan(true);
    setIsAwaitingIngredientDetection(true);
    setErrorMessage(null);

    setSnapshot((current) => ({
      ...current,
      systemStatus: {
        ...current.systemStatus,
        lastSensorEvent: "식재료 스캔 요청 중",
      },
    }));

    try {
      const response = await startIngredientScan();

      setSnapshot((current) => ({
        ...current,
        systemStatus: {
          ...current.systemStatus,
          lastSensorEvent: response.message,
        },
      }));
    } catch {
      setIsAwaitingIngredientDetection(false);
      setErrorMessage("식재료 스캔 시작 요청에 실패했습니다.");
      throw new Error("start-ingredient-scan-failed");
    } finally {
      setIsStartingIngredientScan(false);
    }
  }

  async function handleStartLiquorScan() {
    setIsStartingLiquorScan(true);
    setIsAwaitingLiquorDetection(true);
    setSelectedRecommendationId(null);
    setFixedRecommendationNames([]);
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
    isAwaitingIngredientDetection,
    isAwaitingLiquorDetection,
    isSavingPendingIngredients,
    isStartingIngredientScan,
    isStartingLiquorScan,
    isRefreshingRecommendations,
    isCreatingInventoryIngredient,
    isLoadingFavoriteRecipes,
    savingFavoriteRecommendationId,
    deletingFavoriteId,
    updatingIngredientId,
    selectedRecommendationId,
    fixedRecommendationNames,
    refreshSnapshot: loadInventory,
    savePendingIngredients: handleSavePendingIngredients,
    savePendingIngredient: handleSavePendingIngredient,
    discardPendingIngredient: handleDiscardPendingIngredient,
    startIngredientScan: handleStartIngredientScan,
    startLiquorScan: handleStartLiquorScan,
    changeIngredientQuantity: handleChangeIngredientQuantity,
    createInventoryIngredient: handleCreateInventoryIngredient,
    editInventoryIngredient: handleEditInventoryIngredient,
    deleteInventoryIngredient: handleDeleteInventoryIngredient,
    refreshRecommendations: handleRefreshRecommendations,
    refreshUnlockedRecommendations: handleRefreshUnlockedRecommendations,
    toggleRecommendationFixed: handleToggleRecommendationFixed,
    selectRecommendation: setSelectedRecommendationId,
    loadFavoriteRecipes,
    saveFavoriteRecipe: handleSaveFavoriteRecipe,
    deleteFavoriteRecipe: handleDeleteFavoriteRecipe,
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
