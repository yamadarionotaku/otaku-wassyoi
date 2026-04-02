import type { Metadata } from "next";
import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AVAILABILITY_LABELS,
  GAME_LABELS,
  ITEM_TYPE_LABELS,
} from "@/lib/labels";
import { getItem } from "@/lib/queries";
import { parsePurchaseUrls } from "@/lib/schemas";
import { getAbsoluteUrl } from "@/lib/site";
import type { Availability } from "@/types";

const cnyFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

const jpyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "long",
});

const availabilityClassNames: Record<Availability, string> = {
  preorder: "bg-amber-100 text-amber-800",
  available: "bg-emerald-100 text-emerald-800",
  sold_out: "bg-zinc-200 text-zinc-700",
  unknown: "bg-sky-100 text-sky-800",
};

const purchaseTypeLabels = {
  official: "公式",
  proxy: "代行",
  reseller: "リセール",
  ec: "EC",
} as const;

const passthroughImageLoader = ({ src }: ImageLoaderProps) => src;

type ItemPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "未登録";
  }

  return dateFormatter.format(new Date(value));
}

function getSchemaAvailability(availability: Availability) {
  switch (availability) {
    case "preorder":
      return "https://schema.org/PreOrder";
    case "available":
      return "https://schema.org/InStock";
    case "sold_out":
      return "https://schema.org/SoldOut";
    case "unknown":
      return undefined;
  }
}

export async function generateMetadata({
  params,
}: ItemPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);

  if (!item) {
    return {
      title: "アイテムが見つかりません",
    };
  }

  const description =
    item.description ??
    `${item.characters.name_ja}の${ITEM_TYPE_LABELS[item.item_type]}「${item.title_ja}」の詳細ページです。`;
  const itemUrl = getAbsoluteUrl(`/items/${item.id}`);

  return {
    title: item.title_ja,
    description,
    alternates: {
      canonical: itemUrl,
    },
    openGraph: {
      title: item.title_ja,
      description,
      images: item.image_url
        ? [
            {
              url: item.image_url,
              alt: item.title_ja,
            },
          ]
        : undefined,
      type: "website",
      url: itemUrl,
    },
  };
}

export default async function ItemDetailPage({ params }: ItemPageProps) {
  const { id } = await params;
  const item = await getItem(id);

  if (!item) {
    notFound();
  }

  const purchaseUrls = parsePurchaseUrls(item.purchase_urls);
  const estimatedPrice =
    item.price_jpy_estimate !== null
      ? jpyFormatter.format(item.price_jpy_estimate)
      : null;
  const schemaAvailability = getSchemaAvailability(item.availability);
  const itemUrl = getAbsoluteUrl(`/items/${item.id}`);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title_ja,
    alternateName: item.title_zh ?? undefined,
    description:
      item.description ??
      `${item.characters.name_ja}の${ITEM_TYPE_LABELS[item.item_type]}。`,
    image: item.image_url ? [item.image_url] : undefined,
    category: ITEM_TYPE_LABELS[item.item_type],
    sku: item.id,
    brand: item.source
      ? {
          "@type": "Brand",
          name: item.source,
        }
      : undefined,
    releaseDate: item.release_date ?? undefined,
    offers: item.price_cny !== null
      ? {
          "@type": "Offer",
          priceCurrency: "CNY",
          price: item.price_cny,
          availability: schemaAvailability,
          url: purchaseUrls[0]?.url,
          seller: item.source
            ? {
                "@type": "Organization",
                name: item.source,
              }
            : undefined,
        }
      : undefined,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Character",
        value: item.characters.name_ja,
      },
      {
        "@type": "PropertyValue",
        name: "Game",
        value: GAME_LABELS[item.game],
      },
      {
        "@type": "PropertyValue",
        name: "Availability",
        value: AVAILABILITY_LABELS[item.availability],
      },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "トップ",
        item: getAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "グッズ一覧",
        item: getAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title_ja,
        item: itemUrl,
      },
    ],
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white shadow-sm">
          <div className="relative aspect-square bg-zinc-100">
            {item.image_url ? (
              <Image
                fill
                priority
                alt={item.title_ja}
                className="object-cover"
                loader={passthroughImageLoader}
                sizes="(min-width: 1024px) 58vw, 100vw"
                src={item.image_url}
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-50 to-amber-50 text-sm font-medium text-zinc-500">
                画像準備中
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${availabilityClassNames[item.availability]}`}
              >
                {AVAILABILITY_LABELS[item.availability]}
              </span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
                {ITEM_TYPE_LABELS[item.item_type]}
              </span>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                {GAME_LABELS[item.game]}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                  {item.title_ja}
                </h1>
                {item.title_zh ? (
                  <p className="text-base text-zinc-500">{item.title_zh}</p>
                ) : null}
              </div>

              <p className="text-sm text-zinc-600">
                キャラクター:{" "}
                <Link
                  href={`/characters/${item.characters.slug}`}
                  className="font-semibold text-teal-700 underline-offset-4 hover:underline"
                >
                  {item.characters.name_ja}
                </Link>
              </p>

              <dl className="grid gap-4 rounded-[1.5rem] bg-zinc-50 p-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-zinc-500">価格</dt>
                  <dd className="mt-1 text-base font-semibold text-zinc-900">
                    {item.price_cny !== null
                      ? `CNY ${cnyFormatter.format(item.price_cny)}`
                      : "未登録"}
                    {estimatedPrice ? (
                      <span className="ml-2 text-sm font-medium text-zinc-500">
                        ({estimatedPrice} 目安)
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">販売元</dt>
                  <dd className="mt-1 text-base text-zinc-900">
                    {item.source ?? "未登録"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">発売日</dt>
                  <dd className="mt-1 text-base text-zinc-900">
                    {formatDate(item.release_date)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-500">最終確認日</dt>
                  <dd className="mt-1 text-base text-zinc-900">
                    {formatDate(item.last_verified_at)}
                  </dd>
                </div>
              </dl>

              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-zinc-950">購入先</h2>
                {purchaseUrls.length > 0 ? (
                  <div className="space-y-3">
                    <ul className="space-y-3">
                      {purchaseUrls.map((purchaseUrl) => (
                        <li key={`${purchaseUrl.type}-${purchaseUrl.url}`}>
                          <a
                            href={purchaseUrl.url}
                            rel="nofollow noopener noreferrer"
                            target="_blank"
                            className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 transition hover:border-amber-200 hover:bg-amber-50"
                          >
                            <span>
                              <span className="mr-2 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600">
                                {purchaseTypeLabels[purchaseUrl.type]}
                              </span>
                              <span className="font-medium text-zinc-900">
                                {purchaseUrl.label}
                              </span>
                            </span>
                            <span className="text-sm font-semibold text-teal-700">
                              外部サイトへ
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs leading-6 text-zinc-500">
                      ※アフィリエイトリンクを含みます
                    </p>
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
                    現在掲載できる購入先リンクはありません。
                  </p>
                )}
              </div>
            </div>
          </div>

          <section className="rounded-[2rem] border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-zinc-950">説明</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-zinc-600">
              {item.description ?? "説明はまだ登録されていません。"}
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
