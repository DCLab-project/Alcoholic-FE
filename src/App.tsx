import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DetectedIngredientsPage } from "./pages/DetectedIngredients/DetectedIngredientsPage";
import { InventoryPage } from "./pages/Inventory/InventoryPage";
import { MainPage } from "./pages/Main/MainPage";
import { RecommendationDetailPage } from "./pages/RecommendationDetail/RecommendationDetailPage";
import { RecommendationPage } from "./pages/Recommendation/RecommendationPage";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/detected-ingredients" element={<DetectedIngredientsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
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
