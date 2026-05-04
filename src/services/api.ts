import type {
  AlcoholDetection,
  DetectedIngredient,
  FavoriteRecipe,
  Recommendation,
  RecommendationFilters,
  StoredIngredient,
} from "../types/app";

type IngredientStreamPayload = {
  ingredient_name: string;
  timestamp: string;
  scan_request_id?: string;
};

type LiquorStreamPayload = {
  liquor_name: string;
  timestamp: string;
  scan_request_id?: string;
};

type InventoryItemResponse = {
  ingredient_name: string;
  quantity: number;
  last_updated: string;
};

type HealthResponse = {
  status?: string;
  message?: string;
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
  priority_rank?: number;
  priority_reason?: string;
  selection_factors?: string[];
  score_breakdown?: {
    available_ingredient_count?: number;
    missing_ingredient_count?: number;
    rank_hint?: number;
    total_score?: number;
  };
  servings?: number;
  cook_time_minutes?: number;
  difficulty?: string;
  pairing_knowledge?: {
    flavor_logic?: string;
    ingredient_logic?: string;
    why_this_liquor?: string;
  };
  ingredient_yes?: string[];
  ingredient_no?: string[];
  ingredient_details?: Array<{
    item_name: string;
    display_name: string;
    variant_detail?: string;
    amount?: number;
    unit?: string;
    status: "available" | "missing";
  }>;
  recipe?: string[];
  recipe_steps?: Array<{
    step_number: number;
    title?: string;
    instruction: string;
    time_minutes?: number;
    heat_level?: string;
    success_cue?: string;
  }>;
  missing_ingredients?: string[];
  pantry_items?: string[];
  pantry_item_details?: Array<{
    name: string;
    amount?: number;
    unit?: string;
  }>;
  shopping_items?: string[];
  substitution_tips?: Array<{
    missing_ingredient: string;
    suggestion: string;
    note?: string;
  }>;
  tip?: string;
  tags?: string[];
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

type FavoriteRecipeDetailResponse =
  | FavoriteRecipeItemResponse
  | {
      status?: string;
      data?: FavoriteRecipeItemResponse;
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
  avocado: "🥑",
  beef: "🥩",
  bread: "🍞",
  broccoli: "🥦",
  butter: "🧈",
  cabbage: "🥬",
  carrot: "🥕",
  cheese: "🧀",
  chicken: "🍗",
  cucumber: "🥒",
  eggplant: "🍆",
  fish: "🐟",
  ginger: "🫚",
  green_onion: "🧅",
  leek: "🥬",
  lemon: "🍋",
  lettuce: "🥬",
  milk: "🥛",
  mushroom: "🍄",
  pepper: "🫑",
  pork: "🥓",
  potato: "🥔",
  radish: "⚪",
  salmon: "🐟",
  sausage: "🌭",
  zucchini: "🥒",
  대파: "🥬",
  김치: "🥡",
  계란: "🥚",
  달걀: "🥚",
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
  avocado: "아보카도",
  beef: "소고기",
  bread: "빵",
  broccoli: "브로콜리",
  butter: "버터",
  cabbage: "양배추",
  carrot: "당근",
  cheese: "치즈",
  chicken: "닭고기",
  cucumber: "오이",
  eggplant: "가지",
  fish: "생선살",
  ginger: "생강",
  green_onion: "대파",
  leek: "대파",
  lemon: "레몬",
  lettuce: "상추",
  milk: "우유",
  mushroom: "버섯",
  onion: "양파",
  pepper: "파프리카",
  pork: "돼지고기",
  potato: "감자",
  radish: "무",
  salmon: "연어",
  sausage: "소시지",
  tomato: "토마토",
  kimchi: "김치",
  egg: "달걀",
  bacon: "베이컨",
  tofu: "두부",
  zucchini: "애호박",
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
  sparkling_wine: "샴페인",
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
  return step.replace(/^\s*\d+\s*[:.]\s*/, "").trim();
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
    const recipe = recommendation.recipe ?? [];
    const structuredRecipeSteps =
      recommendation.recipe_steps?.map((step, stepIndex) => ({
        stepNumber: step.step_number ?? stepIndex + 1,
        title: step.title,
        instruction: step.instruction,
        timeMinutes: step.time_minutes,
        heatLevel: step.heat_level,
        successCue: step.success_cue,
      })) ?? [];

    return {
      id: `${response.liquor}-${recommendation.name}-${index}`,
      name: recommendation.name,
      icon: getIngredientIcon(recommendation.name),
      shortReason: toShortReason(recommendation.reason),
      reason: recommendation.reason,
      priorityRank: recommendation.priority_rank,
      priorityReason: recommendation.priority_reason,
      selectionFactors: recommendation.selection_factors ?? [],
      scoreBreakdown: recommendation.score_breakdown
        ? {
            availableIngredientCount:
              recommendation.score_breakdown.available_ingredient_count,
            missingIngredientCount:
              recommendation.score_breakdown.missing_ingredient_count,
            rankHint: recommendation.score_breakdown.rank_hint,
            totalScore: recommendation.score_breakdown.total_score,
          }
        : undefined,
      servings: recommendation.servings,
      cookTimeMinutes: recommendation.cook_time_minutes,
      difficulty: recommendation.difficulty,
      pairingKnowledge: recommendation.pairing_knowledge
        ? {
            flavorLogic: recommendation.pairing_knowledge.flavor_logic,
            ingredientLogic: recommendation.pairing_knowledge.ingredient_logic,
            whyThisLiquor: recommendation.pairing_knowledge.why_this_liquor,
          }
        : undefined,
      availableIngredients: recommendation.ingredient_yes ?? [],
      unavailableIngredients,
      ingredientDetails:
        recommendation.ingredient_details?.map((item) => ({
          itemName: item.item_name,
          displayName: item.display_name,
          variantDetail: item.variant_detail,
          amount: item.amount,
          unit: item.unit,
          status: item.status,
        })) ?? [],
      recipeSteps:
        structuredRecipeSteps.length > 0
          ? structuredRecipeSteps.map((step) => step.instruction)
          : recipe.map(normalizeRecipeStep),
      structuredRecipeSteps,
      missingIngredients: recommendation.missing_ingredients ?? unavailableIngredients,
      pantryItems: recommendation.pantry_items ?? [],
      pantryItemDetails: recommendation.pantry_item_details ?? [],
      shoppingItems: recommendation.shopping_items ?? [],
      substitutionTips:
        recommendation.substitution_tips?.map((tip) => ({
          missingIngredient: tip.missing_ingredient,
          suggestion: tip.suggestion,
          note: tip.note,
        })) ?? [],
      tip: recommendation.tip,
      tags: recommendation.tags ?? [],
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
    ingredientDetails: [],
    recipeSteps: (item.recipe ?? []).map(normalizeRecipeStep),
    structuredRecipeSteps:
      item.recipe_steps?.map((step, stepIndex) => ({
        stepNumber: step.step_number ?? stepIndex + 1,
        title: step.title,
        instruction: step.instruction,
        timeMinutes: step.time_minutes,
        heatLevel: step.heat_level,
        successCue: step.success_cue,
      })) ?? [],
    missingIngredients: item.missing_ingredients ?? unavailableIngredients,
    pantryItems: item.pantry_items ?? [],
    pantryItemDetails: item.pantry_item_details ?? [],
    shoppingItems: item.shopping_items ?? [],
    substitutionTips:
      item.substitution_tips?.map((tip) => ({
        missingIngredient: tip.missing_ingredient,
        suggestion: tip.suggestion,
        note: tip.note,
      })) ?? [],
    selectionFactors: item.selection_factors ?? [],
    tags: item.tags ?? [],
    savedAt: item.saved_at ?? item.created_at,
  };
}

function normalizeFavoriteRecipeResponse(response: FavoriteRecipeListResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
}

function isFavoriteRecipeDetailEnvelope(
  response: FavoriteRecipeDetailResponse,
): response is { status?: string; data?: FavoriteRecipeItemResponse } {
  return "data" in response;
}

function recommendationToApiItem(recommendation: Recommendation) {
  return {
    name: recommendation.name,
    reason: recommendation.reason,
    ingredient_yes: recommendation.availableIngredients,
    ingredient_no: recommendation.unavailableIngredients,
    recipe: recommendation.recipeSteps.map(restoreRecipeStep),
    missing_ingredients: recommendation.missingIngredients,
    shopping_items: recommendation.shoppingItems,
    substitution_tips: recommendation.substitutionTips.map((tip) => ({
      missing_ingredient: tip.missingIngredient,
      suggestion: tip.suggestion,
      note: tip.note,
    })),
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

export async function fetchHealth() {
  return requestJson<HealthResponse>("/health", {
    method: "GET",
  });
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
        new_ingredient_name: nextIngredientName,
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

export async function fetchRecommendations(
  liquorName: string,
  refresh: boolean,
  filters: RecommendationFilters = {},
) {
  const query = new URLSearchParams({
    liquor: liquorName,
    refresh: String(refresh),
  });

  if (filters.availableOnly !== undefined) {
    query.set("available_only", String(filters.availableOnly));
  }

  if (filters.maxMissingCount !== undefined) {
    query.set("max_missing_count", String(filters.maxMissingCount));
  }

  if (filters.maxCookTimeMinutes !== undefined) {
    query.set("max_cook_time_minutes", String(filters.maxCookTimeMinutes));
  }

  if (filters.difficulty) {
    query.set("difficulty", filters.difficulty);
  }

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

export async function fetchFavoriteRecipe(favoriteId: string) {
  const response = await requestJson<FavoriteRecipeDetailResponse>(
    `/api/v1/favorite-recipes/${encodeURIComponent(favoriteId)}`,
    {
      method: "GET",
    },
  );
  const item = isFavoriteRecipeDetailEnvelope(response) ? response.data : response;

  if (!item) {
    throw new Error("favorite-recipe-not-found");
  }

  return mapFavoriteRecipe(item, 0);
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
