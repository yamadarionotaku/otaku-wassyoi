import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
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
      <section className="rounded-card border border-zinc-200/80 px-6 py-8 shadow-sm sm:px-10 sm:py-10" style={{ backgroundImage: 'var(--gradient-hero)' }}>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          キャラクター一覧
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-zinc-600 sm:text-base">
          気になるキャラクターから中国限定グッズを探せます。
        </p>
      </section>

      <section className="mt-8">
        {characters.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {characters.map((character) => (
              <Link
                key={character.id}
                href={`/characters/${character.slug}`}
                className="block rounded-card border border-zinc-200/80 bg-white p-5 shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:scale-[1.02] hover:shadow-lg"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-zinc-500">
                  {GAME_LABELS[character.game]}
                </p>
                <h2 className="mt-3 text-xl font-bold text-zinc-950">
                  {character.name_ja}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {character.name_en} / {character.name_zh}
                </p>
              </Link>
            ))}
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
