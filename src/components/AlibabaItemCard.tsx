import Image from "next/image";

import {
  ALIBABA_ITEM_CATEGORY_LABELS,
  formatAlibabaPriceRange,
} from "@/lib/alibaba";
import type { AlibabaItem } from "@/types";

type AlibabaItemCardProps = {
  item: AlibabaItem;
  headingLevel?: "h2" | "h3";
};

export function AlibabaItemCard({
  item,
  headingLevel = "h3",
}: AlibabaItemCardProps) {
  const Heading = headingLevel;
  const priceLabel = formatAlibabaPriceRange(
    item.price_min_usd,
    item.price_max_usd,
  );

  return (
    <article className="ornate-corners overflow-hidden rounded-card border border-[#e5e7eb] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(0,0,0,0.12)]">
      <div className="relative aspect-square overflow-hidden bg-[#f8fafc]">
        {item.image_url ? (
          <Image
            fill
            alt={item.title}
            className="object-cover"
            sizes="(min-width: 1280px) 24rem, (min-width: 768px) 50vw, 100vw"
            src={item.image_url}
            unoptimized
          />
        ) : (
          <div className="constellation-bg flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f0ead4_0%,#fbf7ee_52%,#f6f1e6_100%)] px-6 text-center text-sm font-medium text-[#50617a]">
            画像準備中
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-[#e5e7eb] p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full border border-[#d9dde5] bg-[#f8fafc] px-3 py-1 font-medium text-[#50617a]">
            {ALIBABA_ITEM_CATEGORY_LABELS[item.item_category]}
          </span>
          <span className="rounded-full border border-[color:var(--color-gold-soft)] bg-[#b6945b14] px-3 py-1 font-semibold text-[color:var(--color-gold)]">
            {priceLabel}
          </span>
        </div>

        <div className="space-y-3">
          <Heading className="font-serif line-clamp-3 text-lg font-semibold leading-7 text-[#1c2023]">
            {item.title}
          </Heading>
          <p className="line-clamp-2 text-sm leading-6 text-[#50617a]">
            {item.seller_name ?? "販売者情報なし"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[#eef1f5] pt-4">
          <p className="line-clamp-1 text-xs tracking-[0.14em] text-[color:var(--color-gold)]">
            ALIBABA SOURCING
          </p>
          <a
            className="inline-flex min-h-touch items-center justify-center rounded-[1rem] border border-[#b6945b30] bg-[#162538] px-4 py-2 text-sm font-medium text-[#d9ccb6] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,background-color,color,box-shadow] hover:border-[color:var(--color-gold-soft)] hover:bg-[#1e3350] hover:text-[#f0ead4]"
            href={item.product_url}
            rel="noreferrer"
            target="_blank"
          >
            Alibabaで見る
          </a>
        </div>
      </div>
    </article>
  );
}
