import type { PropsWithChildren } from "react";

interface StatusBadgeProps extends PropsWithChildren {
  tone?: "neutral" | "success" | "warning" | "critical";
}

export function StatusBadge({
  children,
  tone = "neutral",
}: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}

