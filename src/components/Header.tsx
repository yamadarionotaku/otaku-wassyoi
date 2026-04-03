import Link from "next/link";

type NavigationItem = {
  label: string;
  href?: string;
  disabled?: boolean;
};

const navigationItems: NavigationItem[] = [
  { href: "/", label: "グッズ一覧" },
  { href: "/characters", label: "キャラ別" },
  { href: "/articles", label: "記事" },
];

export function Header() {
  return (
    <header className="border-b border-zinc-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-teal-500 text-lg font-bold text-white shadow-sm">
            お
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-zinc-950">
              おたくわっしょい
            </span>
            <span className="text-xs text-zinc-500">
              中国限定 原神グッズ データベース
            </span>
          </span>
        </Link>

        <nav
          aria-label="グローバルナビゲーション"
          className="flex flex-wrap items-center gap-2 sm:gap-3"
        >
          {navigationItems.map((item) =>
            !item.href ? (
              <span
                key={item.label}
                aria-disabled="true"
                className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-400"
              >
                {item.label}
                <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                  準備中
                </span>
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="min-h-touch inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
