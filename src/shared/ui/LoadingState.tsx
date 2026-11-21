export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      {label}
    </div>
  );
}
