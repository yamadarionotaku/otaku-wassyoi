import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { CHARACTER_META, ELEMENT_COLORS } from "@/lib/character-elements";
import { GAME_LABELS } from "@/lib/labels";
import { getCharacters } from "@/lib/queries";

export const metadata: Metadata = {
  title: "キャラクター一覧",
  description: "原神などのキャラクター別に中国限定グッズを探せる一覧ページです。",
};

export default async function CharactersPage() {
  const characters = await getCharacters();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section
        className="rounded-card border border-[color:var(--color-line)] px-6 py-8 shadow-[0_16px_36px_rgba(20,32,51,0.08)] sm:px-10 sm:py-10"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[color:var(--color-night)] sm:text-4xl">
          キャラクター一覧
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--color-ink-soft)] sm:text-base">
          気になるキャラクターから中国限定グッズを探せます。
        </p>
      </section>

      <section className="mt-8">
        {characters.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {characters.map((character) => {
              const meta = CHARACTER_META[character.slug];
              const elementColor = meta
                ? ELEMENT_COLORS[meta.element]
                : "var(--color-gold)";

              return (
                <Link
                  key={character.id}
                  href={`/characters/${character.slug}`}
                  className="block rounded-card border border-[color:var(--color-line)] border-l-4 bg-[color:var(--color-panel)] p-5 shadow-[0_12px_30px_rgba(20,32,51,0.06)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(20,32,51,0.12)]"
                  style={{ borderLeftColor: elementColor }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-ink-soft)]">
                      {GAME_LABELS[character.game]}
                    </p>
                    {meta ? (
                      <span
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                        style={{ borderColor: elementColor, color: elementColor }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: elementColor }}
                        />
                        {meta.elementLabel}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-4 font-serif text-2xl font-semibold text-[color:var(--color-night)]">
                    {character.name_ja}
                  </h2>
                  <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
                    {character.name_en} / {character.name_zh}
                  </p>
                  {meta ? (
                    <p className="mt-4 text-xs font-medium tracking-[0.1em] text-[color:var(--color-gold)]">
                      {meta.regionLabel}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            message="登録済みキャラクターはまだありません"
            subMessage="データ投入後にここへ一覧表示されます。"
          />
        )}
      </section>
    </main>
  );
}
