import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";

import { availabilityClassNames } from "@/lib/badge-styles";
import { AVAILABILITY_LABELS, ITEM_TYPE_LABELS } from "@/lib/labels";
import type { ItemWithCharacter } from "@/types";

const cnyFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

const passthroughImageLoader = ({ src }: ImageLoaderProps) => src;

type ItemCardProps = {
  item: ItemWithCharacter;
  headingLevel?: "h2" | "h3";
};

export function ItemCard({ item, headingLevel = "h3" }: ItemCardProps) {
  const Heading = headingLevel;
  return (
    <Link
      href={`/items/${item.id}`}
      className="group ornate-corners block overflow-hidden rounded-card border border-[#e5e7eb] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f8fafc]">
        {item.image_url ? (
          <Image
            fill
            alt={item.title_ja}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            loader={passthroughImageLoader}
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
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#50617a]">
              {item.characters.name_ja}
            </p>
            <Heading className="font-serif line-clamp-2 text-lg font-semibold leading-7 text-[#1c2023]">
              {item.title_ja}
            </Heading>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${availabilityClassNames[item.availability]}`}
          >
            {AVAILABILITY_LABELS[item.availability]}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-[#50617a]">
          <span className="rounded-full border border-[#d9dde5] bg-[#f8fafc] px-3 py-1 font-medium text-[#50617a]">
            {ITEM_TYPE_LABELS[item.item_type]}
          </span>
          {item.price_cny !== null ? (
            <span className="rounded-full border border-[color:var(--color-gold-soft)] bg-[#b6945b14] px-3 py-1 font-semibold text-[color:var(--color-gold)]">
              CNY {cnyFormatter.format(item.price_cny)}
            </span>
          ) : (
            <span className="rounded-full border border-[#d9dde5] bg-[#f8fafc] px-3 py-1 font-medium text-[#50617a]">
              価格未登録
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
