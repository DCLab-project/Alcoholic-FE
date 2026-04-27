import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function SectionHeading({
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <p className="section-heading__eyebrow">Display Flow</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  );
}
