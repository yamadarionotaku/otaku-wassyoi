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
    <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-semibold text-zinc-700">種類</span>
          <select
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-300 focus:bg-white"
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
          <span className="text-sm font-semibold text-zinc-700">販売状況</span>
          <select
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-300 focus:bg-white"
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
