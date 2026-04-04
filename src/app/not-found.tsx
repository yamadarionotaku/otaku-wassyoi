import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold tracking-[0.24em] text-[color:var(--color-gold)]">
        404
      </p>
      <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-[#f0ead4] sm:text-4xl">
        ページが見つかりませんでした
      </h1>
      <p className="mt-4 text-base leading-8 text-[#8c93a3]">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-touch items-center justify-center rounded-inner border border-[#b6945b30] bg-[#162538] px-6 py-3 text-sm font-medium text-[#d9ccb6] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,background-color,color,box-shadow] hover:border-[color:var(--color-gold-soft)] hover:bg-[#1e3350] hover:text-[#f0ead4]"
      >
        トップページに戻る
      </Link>
    </main>
  );
}
