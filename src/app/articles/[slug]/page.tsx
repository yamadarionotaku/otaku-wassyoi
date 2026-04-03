import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

import {
  type ArticleFrontmatter,
  getArticleBySlug,
  getArticleSlugs,
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
  guide: "bg-teal-100 text-teal-800",
  news: "bg-zinc-200 text-zinc-700",
};

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "記事が見つかりません",
    };
  }

  const articleUrl = getAbsoluteUrl(`/articles/${slug}`);

  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.frontmatter.title,
      description: article.frontmatter.description,
      type: "article",
      url: articleUrl,
      publishedTime: article.frontmatter.publishedAt,
      modifiedTime:
        article.frontmatter.updatedAt ?? article.frontmatter.publishedAt,
      tags: article.frontmatter.tags,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const articleUrl = getAbsoluteUrl(`/articles/${slug}`);
  const publishedLabel = formatDate(article.frontmatter.publishedAt);
  const updatedLabel = article.frontmatter.updatedAt
    ? formatDate(article.frontmatter.updatedAt)
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "トップ",
        item: getAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "記事",
        item: getAbsoluteUrl("/articles"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.frontmatter.title,
        item: articleUrl,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.frontmatter.title,
    description: article.frontmatter.description,
    datePublished: article.frontmatter.publishedAt,
    dateModified:
      article.frontmatter.updatedAt ?? article.frontmatter.publishedAt,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    articleSection: CATEGORY_LABELS[article.frontmatter.category],
    keywords: article.frontmatter.tags,
    inLanguage: "ja-JP",
    author: {
      "@type": "Organization",
      name: "おたくわっしょい",
    },
    publisher: {
      "@type": "Organization",
      name: "おたくわっしょい",
      url: getAbsoluteUrl("/"),
    },
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <article className="overflow-hidden rounded-card border border-zinc-200/80 bg-white shadow-sm">
        <header className="border-b border-zinc-200/70 px-6 py-8 sm:px-10 sm:py-10" style={{ backgroundImage: 'var(--gradient-hero)' }}>
          <nav
            aria-label="パンくず"
            className="flex flex-wrap items-center gap-2 text-sm text-zinc-500"
          >
            <Link
              href="/"
              className="font-medium text-zinc-600 underline-offset-4 hover:text-teal-700 hover:underline"
            >
              トップ
            </Link>
            <span>/</span>
            <Link
              href="/articles"
              className="font-medium text-zinc-600 underline-offset-4 hover:text-teal-700 hover:underline"
            >
              記事
            </Link>
            <span>/</span>
            <span className="truncate text-zinc-400">{article.frontmatter.title}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${CATEGORY_CLASS_NAMES[article.frontmatter.category]}`}
            >
              {CATEGORY_LABELS[article.frontmatter.category]}
            </span>
            <time className="text-sm font-medium text-zinc-500">
              公開: {publishedLabel}
            </time>
            {updatedLabel ? (
              <time className="text-sm font-medium text-zinc-500">
                更新: {updatedLabel}
              </time>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              {article.frontmatter.title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-zinc-600">
              {article.frontmatter.description}
            </p>
            {article.frontmatter.tags && article.frontmatter.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {article.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="article-prose max-w-none">
            <MDXRemote source={article.content} />
          </div>
        </div>
      </article>
    </main>
  );
}
