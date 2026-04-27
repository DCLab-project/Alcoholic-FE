import type {
  AlcoholDetection,
  DetectedIngredient,
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

type RecommendationResponse = {
  liquor: string;
  recommendations: Array<{
    name: string;
    reason: string;
    ingredient_yes?: string[];
    ingredient_no?: string[];
    recipe: string[];
    missing_ingredients: string[];
  }>;
};

type LiquorScanStartResponse = {
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
  onion: "🧅",
  양파: "🧅",
  tomato: "🍅",
  베이컨: "🥓",
  치즈: "🧀",
  버터: "🧈",
  새우: "🍤",
  레몬: "🍋",
  소주: "🍶",
  맥주: "🍺",
  와인: "🍷",
  위스키: "🥃",
};

const ingredientLabelMap: Record<string, string> = {
  green_onion: "대파",
  onion: "양파",
  tomato: "토마토",
  kimchi: "김치",
  egg: "계란",
  bacon: "베이컨",
  tofu: "두부",
};

const liquorLabelMap: Record<string, string> = {
  beer: "맥주",
  soju: "소주",
  whisky: "위스키",
  whiskey: "위스키",
  wine: "와인",
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

  return (await response.json()) as T;
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
      recommendation.ingredient_no ?? recommendation.missing_ingredients;

    return {
      id: `${response.liquor}-${recommendation.name}-${index}`,
      name: recommendation.name,
      icon: getIngredientIcon(recommendation.name),
      shortReason: toShortReason(recommendation.reason),
      reason: recommendation.reason,
      availableIngredients: recommendation.ingredient_yes ?? [],
      unavailableIngredients,
      recipeSteps: recommendation.recipe.map(normalizeRecipeStep),
      missingIngredients: recommendation.missing_ingredients,
    };
  });
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

export async function startLiquorScan() {
  return requestJson<LiquorScanStartResponse>("/api/v1/scan/liquor/start", {
    method: "POST",
    body: JSON.stringify({
      triggered_by: "frontend",
      device_id: "display-01",
    }),
  });
}

export const apiMappers = {
  mapIngredientDetection,
  mapLiquorDetection,
};
