export type ViewStatus = "idle" | "loading" | "ready" | "error";

export interface RecommendationFilters {
  availableOnly?: boolean;
  maxMissingCount?: number;
  maxCookTimeMinutes?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface SystemStatus {
  fridgeTemperature: string;
  freezerTemperature: string;
  networkLabel: string;
  lastSensorEvent: string;
}

export interface DetectedIngredient {
  id: string;
  name: string;
  icon: string;
  detectedAt: string;
}

export interface StoredIngredient {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  unit: string;
  location: "냉장" | "냉동";
  lastUpdated?: string;
}

export interface AlcoholDetection {
  id: string;
  name: string;
  icon: string;
  categoryLabel: string;
  detectedAt: string;
}

export interface Recommendation {
  id: string;
  name: string;
  icon: string;
  shortReason: string;
  reason: string;
  priorityRank?: number;
  priorityReason?: string;
  selectionFactors: string[];
  scoreBreakdown?: {
    availableIngredientCount?: number;
    missingIngredientCount?: number;
    rankHint?: number;
    totalScore?: number;
  };
  servings?: number;
  cookTimeMinutes?: number;
  difficulty?: string;
  pairingKnowledge?: {
    flavorLogic?: string;
    ingredientLogic?: string;
    whyThisLiquor?: string;
  };
  availableIngredients: string[];
  unavailableIngredients: string[];
  ingredientDetails: Array<{
    itemName: string;
    displayName: string;
    variantDetail?: string;
    amount?: number;
    unit?: string;
    status: "available" | "missing";
  }>;
  recipeSteps: string[];
  structuredRecipeSteps: Array<{
    stepNumber: number;
    title?: string;
    instruction: string;
    timeMinutes?: number;
    heatLevel?: string;
    successCue?: string;
  }>;
  missingIngredients: string[];
  pantryItems: string[];
  pantryItemDetails: Array<{
    name: string;
    amount?: number;
    unit?: string;
  }>;
  shoppingItems: string[];
  substitutionTips: Array<{
    missingIngredient: string;
    suggestion: string;
    note?: string;
  }>;
  tip?: string;
  tags: string[];
}

export interface FavoriteRecipe extends Recommendation {
  favoriteId: string;
  liquorName: string;
  savedAt?: string;
}

export interface AppSnapshot {
  systemStatus: SystemStatus;
  pendingIngredients: DetectedIngredient[];
  inventory: StoredIngredient[];
  activeAlcohol: AlcoholDetection | null;
  recommendations: Recommendation[];
  favoriteRecipes: FavoriteRecipe[];
}

export interface AppStateValue extends AppSnapshot {
  errorMessage: string | null;
  isBootstrapping: boolean;
  isAwaitingIngredientDetection: boolean;
  isAwaitingLiquorDetection: boolean;
  isSavingPendingIngredients: boolean;
  isStartingIngredientScan: boolean;
  isStartingLiquorScan: boolean;
  isRefreshingRecommendations: boolean;
  isCreatingInventoryIngredient: boolean;
  isLoadingFavoriteRecipes: boolean;
  savingFavoriteRecommendationId: string | null;
  deletingFavoriteId: string | null;
  updatingIngredientId: string | null;
  selectedRecommendationId: string | null;
  fixedRecommendationNames: string[];
  recommendationFilters: RecommendationFilters;
  refreshSnapshot: () => Promise<void>;
  savePendingIngredients: () => Promise<void>;
  savePendingIngredient: (
    ingredientId: string,
    ingredientName: string,
  ) => Promise<void>;
  discardPendingIngredient: (ingredientId: string) => void;
  startIngredientScan: () => Promise<void>;
  startLiquorScan: () => Promise<void>;
  changeIngredientQuantity: (ingredientId: string, delta: number) => Promise<void>;
  createInventoryIngredient: (
    ingredientName: string,
    quantity: number,
  ) => Promise<void>;
  editInventoryIngredient: (
    currentIngredientName: string,
    nextIngredientName: string,
    quantity: number,
  ) => Promise<void>;
  deleteInventoryIngredient: (ingredientName: string) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  refreshUnlockedRecommendations: () => Promise<void>;
  updateRecommendationFilters: (filters: RecommendationFilters) => Promise<void>;
  toggleRecommendationFixed: (recommendationId: string) => void;
  selectRecommendation: (recommendationId: string) => void;
  loadFavoriteRecipes: () => Promise<void>;
  saveFavoriteRecipe: (recommendationId: string) => Promise<void>;
  deleteFavoriteRecipe: (favoriteId: string) => Promise<void>;
}
