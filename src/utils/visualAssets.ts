export type VisualAsset = {
  emoji: string;
  imageSrc: string;
};

const ingredientAssets: Record<string, VisualAsset> = {
  소고기: { emoji: "🥩", imageSrc: "/assets/ingredients/default.svg" },
  빵: { emoji: "🍞", imageSrc: "/assets/ingredients/default.svg" },
  브로콜리: { emoji: "🥦", imageSrc: "/assets/ingredients/default.svg" },
  버터: { emoji: "🧈", imageSrc: "/assets/ingredients/default.svg" },
  양배추: { emoji: "🥬", imageSrc: "/assets/ingredients/default.svg" },
  당근: { emoji: "🥕", imageSrc: "/assets/ingredients/default.svg" },
  치즈: { emoji: "🧀", imageSrc: "/assets/ingredients/default.svg" },
  닭고기: { emoji: "🍗", imageSrc: "/assets/ingredients/default.svg" },
  오이: { emoji: "🥒", imageSrc: "/assets/ingredients/default.svg" },
  대파: { emoji: "🥬", imageSrc: "/assets/ingredients/green-onion.svg" },
  양파: { emoji: "🧅", imageSrc: "/assets/ingredients/onion.svg" },
  달걀: { emoji: "🥚", imageSrc: "/assets/ingredients/egg.svg" },
  계란: { emoji: "🥚", imageSrc: "/assets/ingredients/egg.svg" },
  가지: { emoji: "🍆", imageSrc: "/assets/ingredients/default.svg" },
  생선살: { emoji: "🐟", imageSrc: "/assets/ingredients/default.svg" },
  김치: { emoji: "🥬", imageSrc: "/assets/ingredients/kimchi.svg" },
  두부: { emoji: "◻️", imageSrc: "/assets/ingredients/tofu.svg" },
  삼겹살: { emoji: "🥓", imageSrc: "/assets/ingredients/pork-belly.svg" },
  돼지고기: { emoji: "🥓", imageSrc: "/assets/ingredients/pork-belly.svg" },
  마늘: { emoji: "🧄", imageSrc: "/assets/ingredients/garlic.svg" },
  상추: { emoji: "🥬", imageSrc: "/assets/ingredients/default.svg" },
  우유: { emoji: "🥛", imageSrc: "/assets/ingredients/default.svg" },
  버섯: { emoji: "🍄", imageSrc: "/assets/ingredients/default.svg" },
  파프리카: { emoji: "🫑", imageSrc: "/assets/ingredients/default.svg" },
  감자: { emoji: "🥔", imageSrc: "/assets/ingredients/default.svg" },
  소시지: { emoji: "🌭", imageSrc: "/assets/ingredients/default.svg" },
  토마토: { emoji: "🍅", imageSrc: "/assets/ingredients/default.svg" },
  애호박: { emoji: "🥒", imageSrc: "/assets/ingredients/default.svg" },
  레몬: { emoji: "🍋", imageSrc: "/assets/ingredients/default.svg" },
  아보카도: { emoji: "🥑", imageSrc: "/assets/ingredients/default.svg" },
  무: { emoji: "⚪", imageSrc: "/assets/ingredients/default.svg" },
  생강: { emoji: "🫚", imageSrc: "/assets/ingredients/default.svg" },
  연어: { emoji: "🐟", imageSrc: "/assets/ingredients/default.svg" },
};

const liquorAssets: Record<string, VisualAsset> = {
  소주: { emoji: "🍶", imageSrc: "/assets/liquors/soju.svg" },
  맥주: { emoji: "🍺", imageSrc: "/assets/liquors/beer.svg" },
  화이트와인: { emoji: "🥂", imageSrc: "/assets/liquors/white-wine.svg" },
  레드와인: { emoji: "🍷", imageSrc: "/assets/liquors/red-wine.svg" },
  사케: { emoji: "🍶", imageSrc: "/assets/liquors/sake.svg" },
  위스키: { emoji: "🥃", imageSrc: "/assets/liquors/whisky.svg" },
  샴페인: { emoji: "🍾", imageSrc: "/assets/liquors/champagne.svg" },
  스파클링와인: { emoji: "🍾", imageSrc: "/assets/liquors/champagne.svg" },
};

const fallbackIngredientAsset: VisualAsset = {
  emoji: "🥣",
  imageSrc: "/assets/ingredients/default.svg",
};

const fallbackLiquorAsset: VisualAsset = {
  emoji: "📷",
  imageSrc: "/assets/liquors/default.svg",
};

export function getIngredientAsset(name?: string | null) {
  if (!name) {
    return fallbackIngredientAsset;
  }

  return ingredientAssets[name] ?? fallbackIngredientAsset;
}

export function getLiquorAsset(name?: string | null) {
  if (!name) {
    return fallbackLiquorAsset;
  }

  return liquorAssets[name] ?? fallbackLiquorAsset;
}
