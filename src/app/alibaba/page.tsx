import type { Metadata } from "next";

import { EmptyState } from "@/components/EmptyState";
import { AlibabaItemCard } from "@/components/AlibabaItemCard";
import { AlibabaItemFilter } from "@/components/AlibabaItemFilter";
import {
  ALIBABA_ITEM_CATEGORY_LABELS,
  isAlibabaItemCategory,
} from "@/lib/alibaba";
import { getAlibabaItems } from "@/lib/queries";
import type { AlibabaItemCategory } from "@/types";

export const metadata: Metadata = {
  title: "仕入れ情報",
  description:
    "Alibaba.com で収集したアニメ系グッズの仕入れ候補をカテゴリ別に確認できます。",
};

type AlibabaPageProps = {
  searchParams: Promise<{
    category?: string | string[];
  }>;
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getFilterLabel(category: AlibabaItemCategory | undefined) {
  return category ? ALIBABA_ITEM_CATEGORY_LABELS[category] : "全カテゴリ";
}

export default async function AlibabaPage({ searchParams }: AlibabaPageProps) {
  const resolvedSearchParams = await searchParams;
  const categoryParam = getSingleValue(resolvedSearchParams.category);
  const category = isAlibabaItemCategory(categoryParam)
    ? categoryParam
    : undefined;
  const items = await getAlibabaItems(category);
  const filterLabel = getFilterLabel(category);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section
        className="overflow-hidden rounded-card border border-[#b6945b30] px-6 py-10 shadow-[0_18px_40px_rgba(20,32,51,0.08)] sm:px-10 sm:py-14"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)] lg:items-center">
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-semibold tracking-[0.24em] text-[color:var(--color-gold)]">
              ALIBABA SOURCING ARCHIVE
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-balance tracking-tight text-[#f0ead4] sm:text-5xl">
              Alibaba の仕入れ候補を、カテゴリ別に俯瞰する。
            </h1>
            <p className="text-base leading-8 text-[#8c93a3] sm:text-lg">
              アクスタ、フィギュア、缶バッジ、痛バッグ、抱き枕など、
              Alibaba.com から収集した候補商品を横断で確認できます。
            </p>
          </div>

          <div
            className="constellation-bg overflow-hidden rounded-card border border-[#b6945b30] p-6"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 45%, rgba(182, 148, 91, 0.12) 0%, rgba(182, 148, 91, 0) 42%), linear-gradient(145deg, rgba(14, 26, 43, 0.98) 0%, rgba(20, 32, 51, 0.94) 52%, rgba(26, 42, 66, 0.98) 100%)",
            }}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs tracking-[0.2em] text-[color:var(--color-gold-soft)]">
                  CURRENT FILTER
                </p>
                <p className="mt-2 font-serif text-2xl font-semibold text-[#f0ead4]">
                  {filterLabel}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-inner border border-[#b6945b30] bg-[#0a1420b8] p-4">
                  <p className="text-xs tracking-[0.2em] text-[#8c93a3]">
                    ITEMS
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[#f0ead4]">
                    {items.length}
                  </p>
                </div>
                <div className="rounded-inner border border-[#b6945b30] bg-[#0a1420b8] p-4">
                  <p className="text-xs tracking-[0.2em] text-[#8c93a3]">
                    PRICE
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#f0ead4]">
                    USD表示
                  </p>
                </div>
              </div>
              <p className="text-sm leading-7 text-[#8c93a3]">
                商品ページへのリンクはすべて Alibaba 外部ページを開きます。
              </p>
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="my-8 diamond-divider" />

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[#f0ead4]">
              仕入れ候補一覧
            </h2>
            <p className="mt-2 text-sm text-[#8c93a3]">
              カテゴリを切り替えながら、Alibaba 上の候補商品を比較できます。
            </p>
          </div>
          <p className="text-sm font-medium text-[color:var(--color-gold)]">
            {filterLabel} / {items.length}件
          </p>
        </div>

        <AlibabaItemFilter />

        {items.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <AlibabaItemCard key={item.id} headingLevel="h2" item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            message="条件に一致する仕入れ候補が見つかりませんでした"
            subMessage="カテゴリを切り替えて、別のAlibaba商品を確認してください。"
          />
        )}
      </section>
    </main>
  );
}
