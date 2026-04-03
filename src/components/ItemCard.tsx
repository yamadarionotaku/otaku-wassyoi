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
      className="group ornate-corners block overflow-hidden rounded-card border border-[color:var(--color-line)] bg-[color:var(--color-panel)] shadow-[0_12px_30px_rgba(20,32,51,0.06)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(20,32,51,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[color:var(--color-paper-strong)]">
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
          <div className="constellation-bg flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#efe5d2_0%,#fbf8f1_52%,#f6f1e6_100%)] px-6 text-center text-sm font-medium text-[color:var(--color-ink-soft)]">
            画像準備中
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-[color:var(--color-line)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[color:var(--color-ink-soft)]">
              {item.characters.name_ja}
            </p>
            <Heading className="font-serif line-clamp-2 text-lg font-semibold leading-7 text-[color:var(--color-night)]">
              {item.title_ja}
            </Heading>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${availabilityClassNames[item.availability]}`}
          >
            {AVAILABILITY_LABELS[item.availability]}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--color-ink-soft)]">
          <span className="rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-paper-strong)] px-3 py-1 font-medium text-[color:var(--color-ink-soft)]">
            {ITEM_TYPE_LABELS[item.item_type]}
          </span>
          {item.price_cny !== null ? (
            <span className="rounded-full border border-[color:var(--color-gold-soft)] bg-[#b6945b14] px-3 py-1 font-semibold text-[color:var(--color-gold)]">
              CNY {cnyFormatter.format(item.price_cny)}
            </span>
          ) : (
            <span className="rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-paper-strong)] px-3 py-1 font-medium text-[color:var(--color-ink-soft)]">
              価格未登録
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
