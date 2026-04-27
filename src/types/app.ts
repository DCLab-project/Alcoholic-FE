export type ViewStatus = "idle" | "loading" | "ready" | "error";

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
  availableIngredients: string[];
  unavailableIngredients: string[];
  recipeSteps: string[];
  missingIngredients: string[];
}

export interface AppSnapshot {
  systemStatus: SystemStatus;
  pendingIngredients: DetectedIngredient[];
  inventory: StoredIngredient[];
  activeAlcohol: AlcoholDetection | null;
  recommendations: Recommendation[];
}

export interface AppStateValue extends AppSnapshot {
  errorMessage: string | null;
  isBootstrapping: boolean;
  isAwaitingLiquorDetection: boolean;
  isSavingPendingIngredients: boolean;
  isStartingLiquorScan: boolean;
  isRefreshingRecommendations: boolean;
  updatingIngredientId: string | null;
  selectedRecommendationId: string | null;
  refreshSnapshot: () => Promise<void>;
  savePendingIngredients: () => Promise<void>;
  startLiquorScan: () => Promise<void>;
  changeIngredientQuantity: (ingredientId: string, delta: number) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  selectRecommendation: (recommendationId: string) => void;
}
