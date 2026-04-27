interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="panel empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

