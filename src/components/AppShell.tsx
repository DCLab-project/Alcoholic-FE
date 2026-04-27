import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../hooks/useAppState";

function canAutoNavigateToDetected(pathname: string) {
  if (pathname === "/detected-ingredients") {
    return false;
  }

  if (pathname.startsWith("/recommendations/")) {
    return false;
  }

  return true;
}

export function AppShell({ children }: PropsWithChildren) {
  const { pendingIngredients, recommendations, systemStatus } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();
  const previousPendingCountRef = useRef(pendingIngredients.length);
  const previousRecommendationCountRef = useRef(recommendations.length);
  const [clockLabel, setClockLabel] = useState(() =>
    new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date()),
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockLabel(
        new Intl.DateTimeFormat("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const previousPendingCount = previousPendingCountRef.current;
    const hasNewDetectedIngredient = pendingIngredients.length > previousPendingCount;

    if (hasNewDetectedIngredient && canAutoNavigateToDetected(location.pathname)) {
      navigate("/detected-ingredients");
    }

    previousPendingCountRef.current = pendingIngredients.length;
  }, [location.pathname, navigate, pendingIngredients.length]);

  useEffect(() => {
    const previousRecommendationCount = previousRecommendationCountRef.current;
    const hasNewRecommendations = recommendations.length > previousRecommendationCount;

    if (hasNewRecommendations && location.pathname !== "/recommendations") {
      navigate("/recommendations");
    }

    previousRecommendationCountRef.current = recommendations.length;
  }, [location.pathname, navigate, recommendations.length]);

  return (
    <div className="tablet-app">
      <header className="top-bar">
        <div className="top-bar__left">
          <strong className="clock">{clockLabel}</strong>
          <span className="top-bar__brand">AI 냉장고</span>
        </div>

        <div className="top-bar__right">
          <span>{systemStatus.fridgeTemperature}</span>
          <span>/</span>
          <span>{systemStatus.freezerTemperature}</span>
          <span>{systemStatus.networkLabel}</span>
        </div>
      </header>

      <main className="page-frame">{children}</main>
    </div>
  );
}
