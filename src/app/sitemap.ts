import type { MetadataRoute } from "next";

import { getAllArticles } from "@/lib/articles";
import { getAbsoluteUrl } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/types";

type ItemSitemapRow = Pick<Database["public"]["Tables"]["items"]["Row"], "id" | "updated_at">;
type CharacterSitemapRow = Pick<
  Database["public"]["Tables"]["characters"]["Row"],
  "slug" | "updated_at"
>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const [{ data: items, error: itemsError }, { data: characters, error: charactersError }] =
    await Promise.all([
      supabase.from("items").select("id, updated_at"),
      supabase.from("characters").select("slug, updated_at"),
    ]);

  if (itemsError) {
    throw new Error(`Failed to fetch sitemap items: ${itemsError.message}`);
  }

  if (charactersError) {
    throw new Error(
      `Failed to fetch sitemap characters: ${charactersError.message}`,
    );
  }

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: getAbsoluteUrl("/characters"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/articles"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const itemEntries: MetadataRoute.Sitemap = ((items ?? []) as ItemSitemapRow[]).map(
    (item) => ({
      url: getAbsoluteUrl(`/items/${item.id}`),
      lastModified: item.updated_at,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  const characterEntries: MetadataRoute.Sitemap = (
    (characters ?? []) as CharacterSitemapRow[]
  ).map((character) => ({
    url: getAbsoluteUrl(`/characters/${character.slug}`),
    lastModified: character.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = getAllArticles().map(
    (article) => ({
      url: getAbsoluteUrl(`/articles/${article.slug}`),
      lastModified: article.updatedAt ?? article.publishedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  return [...staticEntries, ...itemEntries, ...characterEntries, ...articleEntries];
}
