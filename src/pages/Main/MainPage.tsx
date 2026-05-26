import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

const weekDayLabels = ["일", "월", "화", "수", "목", "금", "토"];

function getWeekDates(today: Date) {
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - today.getDay());

  return weekDayLabels.map((dayLabel, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      dayLabel,
      dateNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    };
  });
}

export function MainPage() {
  const navigate = useNavigate();
  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(today);
  const monthLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(today);
  const calendarDays = getWeekDates(today);
  const {
    isAwaitingIngredientDetection,
    isAwaitingLiquorDetection,
    isStartingIngredientScan,
    isStartingLiquorScan,
    startIngredientScan,
    startLiquorScan,
  } = useAppState();

  async function handleStartIngredientScan() {
    navigate("/scan/ingredient");

    try {
      await startIngredientScan();
    } catch {
      return;
    }
  }

  async function handleStartLiquorScan() {
    navigate("/scan/liquor");

    try {
      await startLiquorScan();
    } catch {
      return;
    }
  }

  return (
    <section className="screen-panel home-dashboard">
      <div className="home-dashboard__hero">
        <div className="home-dashboard__hero-copy">
          <span className="home-dashboard__eyebrow">AI 냉장고 홈</span>
          <h1>오늘의 냉장고를 확인하고 안주를 추천받아보세요</h1>
        </div>
        <span className="home-dashboard__hero-divider" aria-hidden="true" />
        <p className="home-dashboard__hero-note">
          식재료를 넣을 때는 식재료 스캔,
          <br />
          마실 술을 고를 때는 주류 스캔을 시작하세요.
        </p>
      </div>

      <div className="home-dashboard__grid">
        <button
          className="home-action-card home-action-card--primary"
          disabled={isStartingIngredientScan || isAwaitingIngredientDetection}
          onClick={() => void handleStartIngredientScan()}
          type="button"
        >
          <span className="home-action-card__icon">🥬</span>
          <strong>식재료 스캔</strong>
          <span>
            {isStartingIngredientScan || isAwaitingIngredientDetection
              ? "식재료 인식 중"
              : "새 식재료를 카메라로 확인"}
          </span>
        </button>

        <button
          className="home-action-card"
          disabled={isStartingLiquorScan || isAwaitingLiquorDetection}
          onClick={() => void handleStartLiquorScan()}
          type="button"
        >
          <span className="home-action-card__icon">🍶</span>
          <strong>주류 스캔</strong>
          <span>
            {isStartingLiquorScan || isAwaitingLiquorDetection
              ? "주류 인식 중"
              : "마실 술에 맞는 안주 추천"}
          </span>
        </button>

        <Link className="home-action-card" to="/inventory">
          <span className="home-action-card__icon">🛒</span>
          <strong>보관 중인 식재료 보기</strong>
          <span>재고 수량을 확인하고 조절</span>
        </Link>

        <Link className="home-action-card" to="/favorites">
          <span className="home-action-card__icon">♡</span>
          <strong>즐겨찾는 레시피 보기</strong>
          <span>하트로 저장한 안주 모아보기</span>
        </Link>
      </div>

      <div className="home-dashboard__widgets">
        <article className="home-weather-card" aria-label="오늘 날씨">
          <div className="home-widget-card__header">
            <div>
              <span className="home-widget-card__eyebrow">오늘 날씨</span>
              <strong>서울 · {dateLabel}</strong>
            </div>
            <span className="home-weather-card__badge">안주 추천 지수 좋음</span>
          </div>

          <div className="home-weather-card__body">
            <div className="home-weather-card__icon" aria-hidden="true">
              ☀️
            </div>
            <div>
              <strong className="home-weather-card__temperature">24°</strong>
              <p>맑고 산뜻한 저녁이에요</p>
            </div>
          </div>

          <div className="home-weather-card__meta">
            <span>습도 48%</span>
            <span>바람 2m/s</span>
            <span>체감 23°</span>
          </div>
        </article>

        <article className="home-calendar-card" aria-label="주간 캘린더">
          <div className="home-widget-card__header">
            <div>
              <span className="home-widget-card__eyebrow">캘린더</span>
              <strong>{monthLabel}</strong>
            </div>
            <span className="home-calendar-card__today">{today.getDate()}</span>
          </div>

          <div className="home-calendar-card__week">
            {calendarDays.map((day) => (
              <div
                className={`home-calendar-card__day${
                  day.isToday ? " home-calendar-card__day--today" : ""
                }`}
                key={`${day.dayLabel}-${day.dateNumber}`}
              >
                <span>{day.dayLabel}</span>
                <strong>{day.dateNumber}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
