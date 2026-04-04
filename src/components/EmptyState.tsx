type EmptyStateProps = {
  message?: string;
  subMessage?: string;
};

export function EmptyState({
  message = "条件に合う商品が見つかりませんでした",
  subMessage = "フィルターを変更してお試しください",
}: EmptyStateProps) {
  return (
    <div className="ornate-corners rounded-card border border-[#e5e7eb] bg-white px-8 py-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--color-gold)]">
        ARCHIVE AWAITS
      </p>
      <div aria-hidden="true" className="mx-auto my-5 max-w-xs diamond-divider" />
      <h2 className="font-serif text-2xl font-semibold text-[#1c2023]">
        {message}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[#50617a]">
        {subMessage}
      </p>
    </div>
  );
}
