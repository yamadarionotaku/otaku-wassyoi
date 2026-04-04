import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/EmptyState";
import { ItemCard } from "@/components/ItemCard";
import { CHARACTER_META, ELEMENT_COLORS } from "@/lib/character-elements";
import { GAME_LABELS } from "@/lib/labels";
import { getCharacter, getItemsByCharacter } from "@/lib/queries";
import { getAbsoluteUrl } from "@/lib/site";

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
  const meta = CHARACTER_META[character.slug];
  const elementColor = meta ? ELEMENT_COLORS[meta.element] : "var(--color-gold)";
  const heroBackground = meta
    ? `radial-gradient(circle at 88% 18%, color-mix(in srgb, ${elementColor} 24%, transparent) 0%, transparent 42%), radial-gradient(circle at 80% 78%, color-mix(in srgb, ${elementColor} 14%, transparent) 0%, transparent 38%), var(--gradient-hero)`
    : "var(--gradient-hero)";
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

      <section
        className="constellation-bg overflow-hidden rounded-card border border-[color:var(--color-line)] px-6 py-8 shadow-[0_16px_36px_rgba(20,32,51,0.08)] sm:px-10 sm:py-10"
        style={{ backgroundImage: heroBackground }}
      >
        <Link
          href="/characters"
          className="inline-flex items-center text-sm font-semibold text-[color:var(--color-gold)] underline-offset-4 hover:underline"
        >
          キャラクター一覧へ戻る
        </Link>
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[color:var(--color-gold-soft)] bg-[#b6945b14] px-3 py-1 text-sm font-semibold text-[color:var(--color-gold)]">
              {GAME_LABELS[character.game]}
            </span>
            {meta ? (
              <>
                <span
                  className="rounded-full border px-3 py-1 text-sm font-semibold"
                  style={{ borderColor: elementColor, color: elementColor }}
                >
                  {meta.elementLabel}
                </span>
                <span className="rounded-full border border-[color:var(--color-line)] bg-white/80 px-3 py-1 text-sm font-medium text-[color:var(--color-ink-soft)]">
                  {meta.regionLabel}
                </span>
              </>
            ) : null}
            <span className="rounded-full border border-[color:var(--color-line)] bg-white/80 px-3 py-1 text-sm font-medium text-[color:var(--color-ink-soft)]">
              {items.length}件
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[color:var(--color-night)] sm:text-4xl">
              {character.name_ja}
            </h1>
            <p className="text-base text-[color:var(--color-ink-soft)]">
              {character.name_en} / {character.name_zh}
            </p>
          </div>
          <p className="max-w-3xl text-sm leading-8 text-[color:var(--color-ink-soft)] sm:text-base">
            {character.name_ja} に関連する中国限定グッズをまとめています。販売状況や詳細は各グッズページで確認できます。
          </p>
        </div>
      </section>

      <section className="mt-8">
        {items.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} headingLevel="h2" />
            ))}
          </div>
        ) : (
          <EmptyState
            message="まだ登録されたグッズがありません"
            subMessage={`${character.name_ja}のグッズデータは準備中です。後日追加予定です。`}
          />
        )}
      </section>
    </main>
  );
}
