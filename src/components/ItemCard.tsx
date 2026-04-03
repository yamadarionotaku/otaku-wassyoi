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
      className="group block overflow-hidden rounded-card border border-zinc-200/80 bg-white shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:scale-[1.02] hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        {item.image_url ? (
          <Image
            fill
            alt={item.title_ja}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loader={passthroughImageLoader}
            sizes="(min-width: 1280px) 24rem, (min-width: 768px) 50vw, 100vw"
            src={item.image_url}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-50 to-amber-50 px-6 text-center text-sm font-medium text-zinc-500">
            画像準備中
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500">
              {item.characters.name_ja}
            </p>
            <Heading className="line-clamp-2 text-lg font-bold leading-7 text-zinc-950">
              {item.title_ja}
            </Heading>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${availabilityClassNames[item.availability]}`}
          >
            {AVAILABILITY_LABELS[item.availability]}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
          <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
            {ITEM_TYPE_LABELS[item.item_type]}
          </span>
          {item.price_cny !== null ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
              CNY {cnyFormatter.format(item.price_cny)}
            </span>
          ) : (
            <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-500">
              価格未登録
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
