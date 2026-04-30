import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DetectedIngredientsPage } from "./pages/DetectedIngredients/DetectedIngredientsPage";
import { FavoriteRecipeDetailPage } from "./pages/Favorites/FavoriteRecipeDetailPage";
import { FavoriteRecipesPage } from "./pages/Favorites/FavoriteRecipesPage";
import { IngredientScanPage } from "./pages/IngredientScan/IngredientScanPage";
import { InventoryPage } from "./pages/Inventory/InventoryPage";
import { LiquorScanPage } from "./pages/LiquorScan/LiquorScanPage";
import { MainPage } from "./pages/Main/MainPage";
import { RecommendationDetailPage } from "./pages/RecommendationDetail/RecommendationDetailPage";
import { RecommendationPage } from "./pages/Recommendation/RecommendationPage";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/scan/ingredient" element={<IngredientScanPage />} />
        <Route path="/scan/liquor" element={<LiquorScanPage />} />
        <Route path="/detected-ingredients" element={<DetectedIngredientsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/favorites" element={<FavoriteRecipesPage />} />
        <Route path="/favorites/:favoriteId" element={<FavoriteRecipeDetailPage />} />
        <Route path="/recommendations" element={<RecommendationPage />} />
        <Route
          path="/recommendations/:recommendationId"
          element={<RecommendationDetailPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
