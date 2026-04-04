type EmptyStateProps = {
  message?: string;
  subMessage?: string;
};

export function EmptyState({
  message = "条件に合う商品が見つかりませんでした",
  subMessage = "フィルターを変更してお試しください",
}: EmptyStateProps) {
  return (
    <div
      className="ornate-corners rounded-card border border-[color:var(--color-line)] px-8 py-10 text-center shadow-[0_12px_30px_rgba(20,32,51,0.06)]"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(251, 248, 241, 0.98) 0%, rgba(239, 229, 210, 0.82) 100%)",
      }}
    >
      <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--color-gold)]">
        ARCHIVE AWAITS
      </p>
      <div aria-hidden="true" className="mx-auto my-5 max-w-xs diamond-divider" />
      <h2 className="font-serif text-2xl font-semibold text-[color:var(--color-night)]">
        {message}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink-soft)]">
        {subMessage}
      </p>
    </div>
  );
}
