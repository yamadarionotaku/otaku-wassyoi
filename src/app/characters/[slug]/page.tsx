import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GAME_LABELS } from "@/lib/labels";
import { getCharacter, getItemsByCharacter } from "@/lib/queries";
import { getAbsoluteUrl } from "@/lib/site";
import { ItemCard } from "@/components/ItemCard";

type CharacterPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: CharacterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const character = await getCharacter(slug);

  if (!character) {
    return {
      title: "キャラクターが見つかりません",
    };
  }

  const description = `${character.name_ja}（${character.name_en}）の中国限定${GAME_LABELS[character.game]}グッズ一覧です。`;
  const characterUrl = getAbsoluteUrl(`/characters/${character.slug}`);

  return {
    title: `${character.name_ja}のグッズ一覧`,
    description,
    alternates: {
      canonical: characterUrl,
    },
    openGraph: {
      title: `${character.name_ja}のグッズ一覧`,
      description,
      type: "website",
      url: characterUrl,
    },
  };
}

export default async function CharacterDetailPage({
  params,
}: CharacterPageProps) {
  const { slug } = await params;
  const character = await getCharacter(slug);

  if (!character) {
    notFound();
  }

  const items = await getItemsByCharacter(slug);
  const characterUrl = getAbsoluteUrl(`/characters/${character.slug}`);
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
        name: "キャラクター",
        item: getAbsoluteUrl("/characters"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: character.name_ja,
        item: characterUrl,
      },
    ],
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="rounded-[2rem] border border-zinc-200/80 bg-gradient-to-br from-white via-amber-50/40 to-teal-50/70 px-6 py-8 shadow-sm sm:px-10 sm:py-10">
        <Link
          href="/characters"
          className="inline-flex items-center text-sm font-semibold text-teal-700 underline-offset-4 hover:underline"
        >
          キャラクター一覧へ戻る
        </Link>
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-800">
              {GAME_LABELS[character.game]}
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-zinc-600">
              {items.length}件
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              {character.name_ja}
            </h1>
            <p className="text-base text-zinc-500">
              {character.name_en} / {character.name_zh}
            </p>
          </div>
          <p className="max-w-3xl text-sm leading-8 text-zinc-600 sm:text-base">
            {character.name_ja} に関連する中国限定グッズをまとめています。販売状況や詳細は各グッズページで確認できます。
          </p>
        </div>
      </section>

      <section className="mt-8">
        {items.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-zinc-200 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              まだ登録されたグッズがありません
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              {character.name_ja}
              のグッズデータは準備中です。後日追加予定です。
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
