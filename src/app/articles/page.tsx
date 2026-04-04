import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import {
  type ArticleFrontmatter,
  getAllArticles,
} from "@/lib/articles";
import { getAbsoluteUrl } from "@/lib/site";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "long",
});

const CATEGORY_LABELS: Record<ArticleFrontmatter["category"], string> = {
  review: "レビュー",
  roundup: "まとめ",
  guide: "ガイド",
  news: "ニュース",
};

const CATEGORY_CLASS_NAMES: Record<ArticleFrontmatter["category"], string> = {
  review: "bg-amber-100 text-amber-800",
  roundup: "bg-sky-100 text-sky-800",
  guide: "border border-[color:var(--color-gold-soft)] bg-[#b6945b14] text-[color:var(--color-gold)]",
  news: "bg-zinc-200 text-zinc-700",
};

export function generateMetadata(): Metadata {
  const articlesUrl = getAbsoluteUrl("/articles");

  return {
    title: "記事一覧",
    description:
      "中国限定の原神グッズに関するレビュー、まとめ、買い方ガイド、ニュースを日本語で紹介します。",
    alternates: {
      canonical: articlesUrl,
    },
    openGraph: {
      title: "記事一覧",
      description:
        "中国限定の原神グッズに関するレビュー、まとめ、買い方ガイド、ニュースを日本語で紹介します。",
      type: "website",
      url: articlesUrl,
    },
  };
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <main className="mx-auto flex w-full flex-1 flex-col px-4 py-10 sm:px-6 lg:px-12 xl:px-20">
      <section
        className="constellation-bg ornate-corners rounded-card border border-[#b6945b30] px-6 py-10 shadow-[0_16px_36px_rgba(20,32,51,0.08)] sm:px-10"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full border border-[color:var(--color-gold-soft)] bg-[#162538] px-3 py-1 text-sm font-semibold text-[color:var(--color-gold)] shadow-sm">
            Editorial
          </span>
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[#f0ead4] sm:text-4xl">
            記事
          </h1>
          <p className="text-base leading-8 text-[#8c93a3]">
            中国限定グッズのレビュー、買い方ガイド、ラウンドアップ記事を日本語でまとめています。購入判断や情報収集の起点として使える内容を順次追加します。
          </p>
        </div>
      </section>

      <section className="mt-8">
        {articles.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group ornate-corners flex h-full flex-col rounded-card border border-[#e5e7eb] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${CATEGORY_CLASS_NAMES[article.category]}`}
                  >
                    {CATEGORY_LABELS[article.category]}
                  </span>
                  <time className="text-sm font-medium text-[#50617a]">
                    {formatDate(article.publishedAt)}
                  </time>
                </div>

                <div className="mt-5 flex-1 space-y-3">
                  <h3 className="font-serif text-2xl font-semibold tracking-tight text-[#1c2023] transition group-hover:text-[color:var(--color-gold)]">
                    {article.title}
                  </h3>
                  <p className="text-sm leading-7 text-[#50617a] sm:text-base">
                    {article.description}
                  </p>
                </div>

                <p className="mt-6 text-sm font-semibold text-[color:var(--color-gold)]">
                  記事を読む
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            message="まだ記事はありません"
            subMessage="買い方ガイドやレビュー記事は順次公開予定です。"
          />
        )}
      </section>
    </main>
  );
}
