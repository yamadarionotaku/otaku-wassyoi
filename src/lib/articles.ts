import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

export const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

const ARTICLE_CATEGORIES = ["review", "roundup", "guide", "news"] as const;

const articleFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.enum(ARTICLE_CATEGORIES),
    publishedAt: z.string().refine(isValidIsoDate, {
      message: "publishedAt must be a valid ISO date string",
    }),
    updatedAt: z
      .string()
      .refine(isValidIsoDate, {
        message: "updatedAt must be a valid ISO date string",
      })
      .optional(),
    tags: z.array(z.string().min(1)).optional(),
    relatedItems: z.array(z.string().min(1)).optional(),
  })
  .strict();

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export type ArticleSummary = ArticleFrontmatter & {
  slug: string;
};

function isValidIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value));
}

function getArticlePath(slug: string) {
  return path.join(ARTICLES_DIR, `${slug}.mdx`);
}

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) {
    return [];
  }

  return fs
    .readdirSync(ARTICLES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.replace(/\.mdx$/, ""))
    .sort((a, b) => a.localeCompare(b));
}

export function getArticleBySlug(
  slug: string,
): { frontmatter: ArticleFrontmatter; content: string } | null {
  const articlePath = getArticlePath(slug);

  if (!fs.existsSync(articlePath)) {
    return null;
  }

  const source = fs.readFileSync(articlePath, "utf8");
  const { content, data } = matter(source);

  return {
    frontmatter: articleFrontmatterSchema.parse(data),
    content,
  };
}

export function getAllArticles(): ArticleSummary[] {
  return getArticleSlugs()
    .map((slug) => {
      const article = getArticleBySlug(slug);

      if (!article) {
        return null;
      }

      return {
        slug,
        ...article.frontmatter,
      };
    })
    .filter((article): article is ArticleSummary => article !== null)
    .sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() -
        new Date(left.publishedAt).getTime(),
    );
}
