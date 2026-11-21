export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="stat">
      {label}: {value}
    </span>
  );
}
