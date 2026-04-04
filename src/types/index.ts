import type { Database } from "@/types/database";

export type { Database, Json } from "@/types/database";

export type Character = Database["public"]["Tables"]["characters"]["Row"];
export type Item = Database["public"]["Tables"]["items"]["Row"];
export type AlibabaItem = Database["public"]["Tables"]["alibaba_items"]["Row"];

export type Game = Character["game"];
export type ItemType = Item["item_type"];
export type Availability = Item["availability"];
export type AlibabaItemCategory = AlibabaItem["item_category"];

export type PurchaseUrl = {
  label: string;
  url: string;
  type: "official" | "proxy" | "reseller" | "ec";
};

export type ItemWithCharacter = Item & {
  characters?: Pick<Character, "name_ja" | "name_en" | "slug">;
};
