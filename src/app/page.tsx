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
    <main className="mx-auto flex w-full flex-1 flex-col px-4 py-10 sm:px-6 lg:px-12 xl:px-20">
      <section
        className="overflow-hidden rounded-card border border-[#b6945b30] px-6 py-10 shadow-[0_18px_40px_rgba(20,32,51,0.08)] sm:px-10 sm:py-14"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)] lg:items-center">
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-semibold tracking-[0.24em] text-[color:var(--color-gold)]">
              GENSHIN GOODS DISCOVERY
            </p>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#f0ead4] sm:text-5xl">
              中国限定の原神グッズを、日本語で探しやすく。
            </h1>
            <p className="text-base leading-8 text-[#8c93a3] sm:text-lg">
              星拾いの崖は、中国限定のフィギュア、アクリルスタンド、
              ぬいぐるみなどのグッズ情報を日本語で整理して届けるディスカバリーサイトです。
            </p>
          </div>

          <div
            className="constellation-bg relative min-h-[280px] overflow-hidden rounded-card border border-[#b6945b30]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 45%, rgba(182, 148, 91, 0.12) 0%, rgba(182, 148, 91, 0) 42%), linear-gradient(145deg, rgba(14, 26, 43, 0.98) 0%, rgba(20, 32, 51, 0.94) 52%, rgba(26, 42, 66, 0.98) 100%)",
            }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#b6945b66]" />
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#b6945b99]" />
              <div className="absolute left-[17%] top-[24%] h-24 w-24 rounded-full border border-[#50617a33]" />
              <div className="absolute right-[14%] top-[16%] h-16 w-16 rounded-full border border-[#d9c08a80]" />
              <div className="absolute bottom-[14%] left-[12%] h-3 w-3 rotate-45 bg-[#b6945bcc]" />
              <div className="absolute right-[18%] top-[36%] h-2.5 w-2.5 rotate-45 bg-[#50617aaa]" />
              <div className="absolute bottom-[18%] right-[21%] h-4 w-4 rotate-45 border border-[#b6945b80]" />
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="my-8 diamond-divider" />

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#f0ead4]">
              グッズ一覧
            </h2>
            <p className="mt-2 text-sm text-[#8c93a3]">
              フィギュア、アクリルスタンド、ぬいぐるみなどの中国限定グッズを一覧で確認できます。
            </p>
          </div>
          <p className="text-sm font-medium text-[color:var(--color-gold)]">
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
