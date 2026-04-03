type EmptyStateProps = {
  message?: string;
  subMessage?: string;
};

export function EmptyState({
  message = "条件に合う商品が見つかりませんでした",
  subMessage = "フィルターを変更してお試しください",
}: EmptyStateProps) {
  return (
    <div className="rounded-card bg-amber-50/50 p-8 text-center">
      <svg
        className="mx-auto h-12 w-12 text-zinc-400"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">{message}</h2>
      <p className="mt-2 text-sm leading-7 text-zinc-600">{subMessage}</p>
    </div>
  );
}
