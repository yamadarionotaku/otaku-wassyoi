import type { Availability, Game, ItemType } from "@/types";

export const ITEM_TYPES = [
  "figure",
  "acrylic_stand",
  "can_badge",
  "itabag",
  "dakimakura",
  "plush",
  "apparel",
  "stationery",
  "other",
] as const satisfies readonly ItemType[];

export const AVAILABILITY_VALUES = [
  "preorder",
  "available",
  "sold_out",
  "unknown",
] as const satisfies readonly Availability[];

export const GAME_VALUES = [
  "genshin",
  "starrail",
  "wutheringwaves",
] as const satisfies readonly Game[];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  figure: "フィギュア",
  acrylic_stand: "アクリルスタンド",
  can_badge: "缶バッジ",
  itabag: "痛バッグ",
  dakimakura: "抱き枕",
  plush: "ぬいぐるみ",
  apparel: "アパレル",
  stationery: "文房具",
  other: "その他",
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  preorder: "予約受付中",
  available: "販売中",
  sold_out: "売り切れ",
  unknown: "不明",
};

export const GAME_LABELS: Record<Game, string> = {
  genshin: "原神",
  starrail: "崩壊：スターレイル",
  wutheringwaves: "鳴潮",
};
