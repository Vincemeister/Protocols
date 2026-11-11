export function LoadMore({ label = "Loading more" }: { label?: string }) {
  return (
    <div className="fv-loadmore" role="status" aria-live="polite">
      <span className="fv-spinner" />
      {label}
    </div>
  );
}
