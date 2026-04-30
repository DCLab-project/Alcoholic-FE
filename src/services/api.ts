import type {
  AlcoholDetection,
  DetectedIngredient,
  FavoriteRecipe,
  Recommendation,
  StoredIngredient,
} from "../types/app";

type IngredientStreamPayload = {
  ingredient_name: string;
  timestamp: string;
};

type LiquorStreamPayload = {
  liquor_name: string;
  timestamp: string;
};

type InventoryItemResponse = {
  ingredient_name: string;
  quantity: number;
  last_updated: string;
};

type InventoryListResponse = {
  status: string;
  data: InventoryItemResponse[];
};

type InventoryBulkResponse = {
  status: string;
  message: string;
  saved_count: number;
};

type InventoryQuantityResponse = {
  status: string;
  ingredient_name: string;
  current_quantity: number;
};

type RecommendationItemResponse = {
  name: string;
  reason: string;
  ingredient_yes?: string[];
  ingredient_no?: string[];
  recipe: string[];
  missing_ingredients?: string[];
};

type RecommendationResponse = {
  liquor: string;
  recommendations: RecommendationItemResponse[];
};

type FavoriteRecipeItemResponse = RecommendationItemResponse & {
  id?: string;
  favorite_id?: string;
  liquor?: string;
  liquor_name?: string;
  created_at?: string;
  saved_at?: string;
};

type FavoriteRecipeListResponse =
  | FavoriteRecipeItemResponse[]
  | {
      status?: string;
      data?: FavoriteRecipeItemResponse[];
    };

type RecommendationRefreshResponse = RecommendationResponse;

type InventoryMutationResponse = {
  status: string;
  message?: string;
};

type LiquorScanStartResponse = {
  status: string;
  message: string;
  scan_request_id: string;
};

type IngredientScanStartResponse = {
  status: string;
  message: string;
  scan_request_id: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

const ingredientIconMap: Record<string, string> = {
  green_onion: "🧅",
  대파: "🥬",
  김치: "🥡",
  계란: "🥚",
  egg: "🥚",
  onion: "🧅",
  양파: "🧅",
  tomato: "🍅",
  토마토: "🍅",
  베이컨: "🥓",
  치즈: "🧀",
  버터: "🧈",
  새우: "🍤",
  레몬: "🍋",
  두부: "◻️",
  tofu: "◻️",
  삼겹살: "🥓",
  pork_belly: "🥓",
  마늘: "🧄",
  garlic: "🧄",
  소주: "🍶",
  맥주: "🍺",
  와인: "🍷",
  화이트와인: "🥂",
  레드와인: "🍷",
  사케: "🍶",
  위스키: "🥃",
  샴페인: "🍾",
};

const ingredientLabelMap: Record<string, string> = {
  green_onion: "대파",
  onion: "양파",
  tomato: "토마토",
  kimchi: "김치",
  egg: "계란",
  bacon: "베이컨",
  tofu: "두부",
  pork_belly: "삼겹살",
  garlic: "마늘",
};

const liquorLabelMap: Record<string, string> = {
  beer: "맥주",
  soju: "소주",
  whisky: "위스키",
  whiskey: "위스키",
  wine: "와인",
  white_wine: "화이트와인",
  whitewine: "화이트와인",
  red_wine: "레드와인",
  redwine: "레드와인",
  sake: "사케",
  champagne: "샴페인",
};

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

function getIngredientIcon(name: string) {
  return ingredientIconMap[name] ?? "🥣";
}

function getDisplayLabel(name: string) {
  return ingredientLabelMap[name] ?? liquorLabelMap[name] ?? name;
}

function toShortReason(reason: string) {
  const normalized = reason.trim();

  if (normalized.length <= 32) {
    return normalized;
  }

  return `${normalized.slice(0, 31)}...`;
}

function normalizeRecipeStep(step: string) {
  return step.replace(/^\s*\d+\s*:\s*/, "").trim();
}

function restoreRecipeStep(step: string, index: number) {
  return `${index + 1}: ${normalizeRecipeStep(step)}`;
}

function mapInventoryItem(item: InventoryItemResponse): StoredIngredient {
  const label = getDisplayLabel(item.ingredient_name);

  return {
    id: item.ingredient_name,
    name: label,
    icon: getIngredientIcon(item.ingredient_name),
    quantity: item.quantity,
    unit: "개",
    location: "냉장",
    lastUpdated: item.last_updated,
  };
}

function mapLiquorDetection(payload: LiquorStreamPayload): AlcoholDetection {
  const label = getDisplayLabel(payload.liquor_name);

  return {
    id: `${payload.liquor_name}-${payload.timestamp}`,
    name: label,
    icon: getIngredientIcon(payload.liquor_name),
    categoryLabel: label,
    detectedAt: payload.timestamp,
  };
}

function mapIngredientDetection(
  payload: IngredientStreamPayload,
  sequence: number,
): DetectedIngredient {
  const label = getDisplayLabel(payload.ingredient_name);

  return {
    id: `${payload.ingredient_name}-${payload.timestamp}-${sequence}`,
    name: label,
    icon: getIngredientIcon(payload.ingredient_name),
    detectedAt: payload.timestamp,
  };
}

function mapRecommendations(response: RecommendationResponse): Recommendation[] {
  return response.recommendations.map((recommendation, index) => {
    const unavailableIngredients =
      recommendation.ingredient_no ?? recommendation.missing_ingredients ?? [];

    return {
      id: `${response.liquor}-${recommendation.name}-${index}`,
      name: recommendation.name,
      icon: getIngredientIcon(recommendation.name),
      shortReason: toShortReason(recommendation.reason),
      reason: recommendation.reason,
      availableIngredients: recommendation.ingredient_yes ?? [],
      unavailableIngredients,
      recipeSteps: recommendation.recipe.map(normalizeRecipeStep),
      missingIngredients: recommendation.missing_ingredients ?? unavailableIngredients,
    };
  });
}

function mapFavoriteRecipe(
  item: FavoriteRecipeItemResponse,
  index: number,
): FavoriteRecipe {
  const liquorName = item.liquor ?? item.liquor_name ?? "저장한 주류";
  const unavailableIngredients = item.ingredient_no ?? item.missing_ingredients ?? [];

  return {
    id: `favorite-${item.favorite_id ?? item.id ?? index}`,
    favoriteId: item.favorite_id ?? item.id ?? `${item.name}-${index}`,
    liquorName,
    name: item.name,
    icon: getIngredientIcon(item.name),
    shortReason: toShortReason(item.reason),
    reason: item.reason,
    availableIngredients: item.ingredient_yes ?? [],
    unavailableIngredients,
    recipeSteps: item.recipe.map(normalizeRecipeStep),
    missingIngredients: item.missing_ingredients ?? unavailableIngredients,
    savedAt: item.saved_at ?? item.created_at,
  };
}

function normalizeFavoriteRecipeResponse(response: FavoriteRecipeListResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
}

function recommendationToApiItem(recommendation: Recommendation) {
  return {
    name: recommendation.name,
    reason: recommendation.reason,
    ingredient_yes: recommendation.availableIngredients,
    ingredient_no: recommendation.unavailableIngredients,
    recipe: recommendation.recipeSteps.map(restoreRecipeStep),
    missing_ingredients: recommendation.missingIngredients,
  };
}

function attachSseListeners<T>(
  source: EventSource,
  eventNames: string[],
  onPayload: (payload: T) => void,
) {
  const handleMessage = (event: MessageEvent<string>) => {
    try {
      onPayload(JSON.parse(event.data) as T);
    } catch {
      return;
    }
  };

  source.onmessage = handleMessage;
  eventNames.forEach((eventName) => {
    source.addEventListener(eventName, handleMessage as EventListener);
  });

  return () => {
    source.onmessage = null;
    eventNames.forEach((eventName) => {
      source.removeEventListener(eventName, handleMessage as EventListener);
    });
  };
}

export function connectIngredientStream(
  onIngredient: (payload: IngredientStreamPayload) => void,
  onError?: () => void,
) {
  const source = new EventSource(buildUrl("/api/v1/stream/ingredients"));
  const detachListeners = attachSseListeners<IngredientStreamPayload>(
    source,
    ["ingredient", "ingredientdata"],
    onIngredient,
  );

  source.onerror = () => {
    onError?.();
  };

  return () => {
    detachListeners();
    source.close();
  };
}

export function connectLiquorStream(
  onLiquor: (payload: LiquorStreamPayload) => void,
  onError?: () => void,
) {
  const source = new EventSource(buildUrl("/api/v1/stream/liquor"));
  const detachListeners = attachSseListeners<LiquorStreamPayload>(
    source,
    ["liquor", "liquordata"],
    onLiquor,
  );

  source.onerror = () => {
    onError?.();
  };

  return () => {
    detachListeners();
    source.close();
  };
}

export async function fetchInventory() {
  const response = await requestJson<InventoryListResponse>("/api/v1/inventory", {
    method: "GET",
  });

  return response.data.map(mapInventoryItem);
}

export async function persistDetectedIngredients(items: string[]) {
  return requestJson<InventoryBulkResponse>("/api/v1/inventory/bulk", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function patchIngredientQuantity(
  ingredientName: string,
  action: "add" | "subtract",
) {
  return requestJson<InventoryQuantityResponse>("/api/v1/inventory/quantity", {
    method: "PATCH",
    body: JSON.stringify({
      ingredient_name: ingredientName,
      action,
    }),
  });
}

export async function createInventoryIngredient(
  ingredientName: string,
  quantity: number,
) {
  return requestJson<InventoryMutationResponse>("/api/v1/inventory", {
    method: "POST",
    body: JSON.stringify({
      ingredient_name: ingredientName,
      quantity,
    }),
  });
}

export async function updateInventoryIngredient(
  currentIngredientName: string,
  nextIngredientName: string,
  quantity: number,
) {
  return requestJson<InventoryMutationResponse>(
    `/api/v1/inventory/${encodeURIComponent(currentIngredientName)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        ingredient_name: nextIngredientName,
        quantity,
      }),
    },
  );
}

export async function removeInventoryIngredient(ingredientName: string) {
  return requestJson<InventoryMutationResponse>(
    `/api/v1/inventory/${encodeURIComponent(ingredientName)}`,
    {
      method: "DELETE",
    },
  );
}

export async function fetchRecommendations(liquorName: string, refresh: boolean) {
  const query = new URLSearchParams({
    liquor: liquorName,
    refresh: String(refresh),
  });

  const response = await requestJson<RecommendationResponse>(
    `/api/v1/recommendations?${query.toString()}`,
    {
      method: "GET",
    },
  );

  return mapRecommendations(response);
}

export async function refreshRecommendationsWithKeep(
  liquorName: string,
  keepRecommendations: Recommendation[],
) {
  const response = await requestJson<RecommendationRefreshResponse>(
    "/api/v1/recommendations/refresh",
    {
      method: "POST",
      body: JSON.stringify({
        liquor: liquorName,
        keep_recommendations: keepRecommendations.map(recommendationToApiItem),
        refresh_count: Math.max(0, 3 - keepRecommendations.length),
      }),
    },
  );

  return mapRecommendations(response);
}

export async function fetchFavoriteRecipes() {
  const response = await requestJson<FavoriteRecipeListResponse>(
    "/api/v1/favorite-recipes",
    {
      method: "GET",
    },
  );

  return normalizeFavoriteRecipeResponse(response).map(mapFavoriteRecipe);
}

export async function persistFavoriteRecipe(
  liquorName: string,
  recommendation: Recommendation,
) {
  const recipe = recommendationToApiItem(recommendation);

  try {
    return await requestJson<InventoryMutationResponse>("/api/v1/favorite-recipes", {
      method: "POST",
      body: JSON.stringify({
        liquor: liquorName,
        ...recipe,
      }),
    });
  } catch {
    return requestJson<InventoryMutationResponse>("/api/v1/favorite-recipes", {
      method: "POST",
      body: JSON.stringify({
        liquor: liquorName,
        recommendation: recipe,
      }),
    });
  }
}

export async function removeFavoriteRecipe(favoriteId: string) {
  return requestJson<InventoryMutationResponse>(
    `/api/v1/favorite-recipes/${encodeURIComponent(favoriteId)}`,
    {
      method: "DELETE",
    },
  );
}

export async function startLiquorScan() {
  return requestJson<LiquorScanStartResponse>("/api/v1/scan/liquor/start", {
    method: "POST",
    body: JSON.stringify({
      triggered_by: "frontend",
      device_id: "display-01",
    }),
  });
}

export async function startIngredientScan() {
  return requestJson<IngredientScanStartResponse>(
    "/api/v1/scan/ingredients/start",
    {
      method: "POST",
      body: JSON.stringify({
        triggered_by: "frontend",
        device_id: "display-01",
      }),
    },
  );
}

export const apiMappers = {
  mapIngredientDetection,
  mapLiquorDetection,
};
