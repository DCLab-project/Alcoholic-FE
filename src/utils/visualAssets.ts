export type VisualAsset = {
  emoji: string;
  imageSrc: string;
};

const ingredientAssets: Record<string, VisualAsset> = {
  대파: { emoji: "🥬", imageSrc: "/assets/ingredients/green-onion.svg" },
  양파: { emoji: "🧅", imageSrc: "/assets/ingredients/onion.svg" },
  계란: { emoji: "🥚", imageSrc: "/assets/ingredients/egg.svg" },
  김치: { emoji: "🥬", imageSrc: "/assets/ingredients/kimchi.svg" },
  두부: { emoji: "◻️", imageSrc: "/assets/ingredients/tofu.svg" },
  삼겹살: { emoji: "🥓", imageSrc: "/assets/ingredients/pork-belly.svg" },
  마늘: { emoji: "🧄", imageSrc: "/assets/ingredients/garlic.svg" },
};

const liquorAssets: Record<string, VisualAsset> = {
  소주: { emoji: "🍶", imageSrc: "/assets/liquors/soju.svg" },
  맥주: { emoji: "🍺", imageSrc: "/assets/liquors/beer.svg" },
  화이트와인: { emoji: "🥂", imageSrc: "/assets/liquors/white-wine.svg" },
  레드와인: { emoji: "🍷", imageSrc: "/assets/liquors/red-wine.svg" },
  사케: { emoji: "🍶", imageSrc: "/assets/liquors/sake.svg" },
  위스키: { emoji: "🥃", imageSrc: "/assets/liquors/whisky.svg" },
  샴페인: { emoji: "🍾", imageSrc: "/assets/liquors/champagne.svg" },
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
