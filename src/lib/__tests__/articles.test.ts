import { describe, expect, it } from "vitest";

import {
  getAllArticles,
  getArticleBySlug,
  getArticleSlugs,
} from "@/lib/articles";

describe("article helpers", () => {
  it("getArticleSlugs includes buying-guide", () => {
    expect(getArticleSlugs()).toContain("buying-guide");
  });

  it("getArticleBySlug returns frontmatter and content", () => {
    const article = getArticleBySlug("buying-guide");

    expect(article).not.toBeNull();
    expect(article?.frontmatter).toMatchObject({
      title: "中国限定グッズの買い方完全ガイド",
      category: "guide",
    });
    expect(article?.content).toContain("中国限定グッズは、日本国内の通販と違って");
  });

  it("getArticleBySlug returns null for nonexistent slugs", () => {
    expect(getArticleBySlug("nonexistent")).toBeNull();
  });

  it("getAllArticles returns a publishedAt-desc sorted array", () => {
    const articles = getAllArticles();
    const sorted = [...articles].sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() -
        new Date(left.publishedAt).getTime(),
    );

    expect(articles.length).toBeGreaterThan(0);
    expect(articles.map((article) => article.slug)).toContain("buying-guide");
    expect(articles).toEqual(sorted);
  });
});
