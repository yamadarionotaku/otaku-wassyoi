import { EmptyState } from "@/components/EmptyState";
import { ItemCard } from "@/components/ItemCard";
import { ItemFilter } from "@/components/ItemFilter";
import { AVAILABILITY_VALUES, ITEM_TYPES } from "@/lib/labels";
import { getItems } from "@/lib/queries";
import type { Availability, ItemType } from "@/types";

type HomePageProps = {
  searchParams: Promise<{
    item_type?: string | string[];
    availability?: string | string[];
  }>;
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isItemType(value: string | undefined): value is ItemType {
  return value !== undefined && ITEM_TYPES.includes(value as ItemType);
}

function isAvailability(value: string | undefined): value is Availability {
  return (
    value !== undefined && AVAILABILITY_VALUES.includes(value as Availability)
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const itemTypeParam = getSingleValue(resolvedSearchParams.item_type);
  const availabilityParam = getSingleValue(resolvedSearchParams.availability);
  const itemType = isItemType(itemTypeParam) ? itemTypeParam : undefined;
  const availability = isAvailability(availabilityParam)
    ? availabilityParam
    : undefined;
  const items = await getItems({ itemType, availability });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-card border border-zinc-200/80 px-6 py-10 shadow-sm sm:px-10 sm:py-14" style={{ backgroundImage: 'var(--gradient-hero)' }}>
        <div className="max-w-3xl space-y-5">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
            中国限定の原神グッズを、日本語で探しやすく。
          </h1>
          <p className="text-base leading-8 text-zinc-600 sm:text-lg">
            おたくわっしょいは、中国限定のフィギュア、アクリルスタンド、
            ぬいぐるみなどのグッズ情報を日本語で整理して届けるディスカバリーサイトです。
          </p>
        </div>
      </section>

      <section className="mt-8 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
              グッズ一覧
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              フィギュア、アクリルスタンド、ぬいぐるみなどの中国限定グッズを一覧で確認できます。
            </p>
          </div>
          <p className="text-sm font-medium text-zinc-500">
            {items.length}件のグッズ
          </p>
        </div>

        <ItemFilter />

        {items.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            message="条件に一致するグッズが見つかりませんでした"
            subMessage="フィルター条件を変更して、別のグッズを探してみてください。"
          />
        )}
      </section>
    </main>
  );
}
