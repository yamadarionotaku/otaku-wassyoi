"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import type { Availability, ItemType } from "@/types";

const itemTypeOptions: Array<{ label: string; value: "" | ItemType }> = [
  { label: "全て", value: "" },
  { label: "フィギュア", value: "figure" },
  { label: "アクスタ", value: "acrylic_stand" },
  { label: "ぬいぐるみ", value: "plush" },
  { label: "アパレル", value: "apparel" },
  { label: "文房具", value: "stationery" },
  { label: "その他", value: "other" },
];

const availabilityOptions: Array<{
  label: string;
  value: "" | Exclude<Availability, "unknown">;
}> = [
  { label: "全て", value: "" },
  { label: "販売中", value: "available" },
  { label: "予約受付中", value: "preorder" },
  { label: "売り切れ", value: "sold_out" },
];

export function ItemFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedItemType = searchParams.get("item_type") ?? "";
  const selectedAvailability = searchParams.get("availability") ?? "";

  function updateParam(key: "item_type" | "availability", value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    const nextUrl = nextParams.toString()
      ? `${pathname}?${nextParams.toString()}`
      : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  return (
    <section className="ornate-corners rounded-card border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div aria-hidden="true" className="diamond-divider mb-4" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-semibold text-[#1c2023]">
            種類
          </span>
          <select
            className="min-h-touch rounded-inner border border-[#d9dde5] bg-[#f8fafc] px-4 py-3 text-sm text-[#1c2023] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none transition-[border-color,background-color,box-shadow] focus:border-[color:var(--color-gold)] focus:bg-white"
            disabled={isPending}
            onChange={(event) => updateParam("item_type", event.target.value)}
            value={selectedItemType}
          >
            {itemTypeOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-semibold text-[#1c2023]">
            販売状況
          </span>
          <select
            className="min-h-touch rounded-inner border border-[#d9dde5] bg-[#f8fafc] px-4 py-3 text-sm text-[#1c2023] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none transition-[border-color,background-color,box-shadow] focus:border-[color:var(--color-gold)] focus:bg-white"
            disabled={isPending}
            onChange={(event) =>
              updateParam("availability", event.target.value)
            }
            value={selectedAvailability}
          >
            {availabilityOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
