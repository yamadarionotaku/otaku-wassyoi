import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type {
  AlibabaItem,
  AlibabaItemCategory,
  Availability,
  Character,
  Game,
  ItemType,
  ItemWithCharacter,
} from "@/types";

const ITEM_WITH_CHARACTER_SELECT = `
  *,
  characters!inner (
    name_ja,
    name_en,
    slug
  )
`;

type ItemFilters = {
  game?: Game;
  itemType?: ItemType;
  characterSlug?: string;
  availability?: Availability;
};

type ItemWithRelation = Omit<ItemWithCharacter, "characters"> & {
  characters:
    | ItemWithCharacter["characters"]
    | ItemWithCharacter["characters"][]
    | null;
};

function normalizeItem(item: ItemWithRelation): ItemWithCharacter {
  const character = Array.isArray(item.characters)
    ? item.characters[0]
    : item.characters;

  if (!character) {
    throw new Error(`Item ${item.id} is missing its related character.`);
  }

  return {
    ...item,
    characters: character,
  };
}

export async function getItems(
  filters: ItemFilters = {},
): Promise<ItemWithCharacter[]> {
  const supabase = createPublicClient();

  let query = supabase
    .from("items")
    .select(ITEM_WITH_CHARACTER_SELECT)
    .order("created_at", { ascending: false });

  if (filters.game) {
    query = query.eq("game", filters.game);
  }

  if (filters.itemType) {
    query = query.eq("item_type", filters.itemType);
  }

  if (filters.availability) {
    query = query.eq("availability", filters.availability);
  }

  if (filters.characterSlug) {
    query = query.eq("characters.slug", filters.characterSlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Failed to fetch items: ${error.message}`);
    return [];
  }

  return ((data ?? []) as ItemWithRelation[]).map(normalizeItem);
}

export async function getItem(id: string): Promise<ItemWithCharacter | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("items")
    .select(ITEM_WITH_CHARACTER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch item ${id}: ${error.message}`);
    return null;
  }

  if (!data) {
    return null;
  }

  return normalizeItem(data as ItemWithRelation);
}

export async function getCharacters(): Promise<Character[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .order("game", { ascending: true })
    .order("name_ja", { ascending: true });

  if (error) {
    console.error(`Failed to fetch characters: ${error.message}`);
    return [];
  }

  return data ?? [];
}

export async function getCharacter(slug: string): Promise<Character | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch character ${slug}: ${error.message}`);
    return null;
  }

  return data;
}

export async function getItemsByCharacter(
  slug: string,
): Promise<ItemWithCharacter[]> {
  return getItems({ characterSlug: slug });
}

export async function getAlibabaItems(
  category?: AlibabaItemCategory,
): Promise<AlibabaItem[]> {
  const supabase = createPublicClient();

  let query = supabase
    .from("alibaba_items")
    .select("*")
    .order("item_category", { ascending: true })
    .order("title", { ascending: true });

  if (category) {
    query = query.eq("item_category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Failed to fetch Alibaba items: ${error.message}`);
    return [];
  }

  return data ?? [];
}
