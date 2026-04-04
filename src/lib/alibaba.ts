import type { AlibabaItemCategory } from "@/types";

export const ALIBABA_ITEM_CATEGORY_VALUES = [
  "acrylic_stand",
  "figure",
  "can_badge",
  "itabag",
  "dakimakura",
] as const satisfies readonly AlibabaItemCategory[];

export const ALIBABA_ITEM_CATEGORY_LABELS: Record<
  AlibabaItemCategory,
  string
> = {
  acrylic_stand: "アクスタ",
  figure: "フィギュア",
  can_badge: "缶バッジ",
  itabag: "痛バッグ",
  dakimakura: "抱き枕",
};

export const ALIBABA_ITEM_FILTER_OPTIONS: Array<{
  label: string;
  value: "" | AlibabaItemCategory;
}> = [
  { label: "全て", value: "" },
  { label: "アクスタ", value: "acrylic_stand" },
  { label: "フィギュア", value: "figure" },
  { label: "缶バッジ", value: "can_badge" },
  { label: "痛バッグ", value: "itabag" },
  { label: "抱き枕", value: "dakimakura" },
];

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function isAlibabaItemCategory(
  value: string | undefined,
): value is AlibabaItemCategory {
  return (
    value !== undefined &&
    ALIBABA_ITEM_CATEGORY_VALUES.includes(value as AlibabaItemCategory)
  );
}

export function formatAlibabaPriceRange(
  min: number | null,
  max: number | null,
) {
  const resolvedMin = min ?? max;
  const resolvedMax = max ?? min;

  if (resolvedMin === null || resolvedMax === null) {
    return "価格未登録";
  }

  if (resolvedMin === resolvedMax) {
    return usdFormatter.format(resolvedMin);
  }

  return `${usdFormatter.format(resolvedMin)} - ${usdFormatter.format(
    resolvedMax,
  )}`;
}
