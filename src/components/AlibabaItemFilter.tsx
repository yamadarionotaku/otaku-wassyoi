"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ALIBABA_ITEM_FILTER_OPTIONS } from "@/lib/alibaba";
import type { AlibabaItemCategory } from "@/types";

export function AlibabaItemFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const selectedCategory = searchParams.get("category") ?? "";

  function updateCategory(value: "" | AlibabaItemCategory) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set("category", value);
    } else {
      nextParams.delete("category");
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
      <div className="flex flex-wrap gap-3">
        {ALIBABA_ITEM_FILTER_OPTIONS.map((option) => {
          const isActive = selectedCategory === option.value;

          return (
            <button
              key={option.value || "all"}
              aria-pressed={isActive}
              className={`min-h-touch rounded-[1rem] border px-4 py-2 text-sm font-medium transition-[border-color,background-color,color,box-shadow] ${
                isActive
                  ? "border-[color:var(--color-gold-soft)] bg-[#162538] text-[#f0ead4] shadow-[0_10px_22px_rgba(20,32,51,0.08)]"
                  : "border-[#d9dde5] bg-[#f8fafc] text-[#50617a] hover:border-[color:var(--color-gold-soft)] hover:bg-white hover:text-[#1c2023]"
              }`}
              disabled={isPending}
              onClick={() => updateCategory(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
