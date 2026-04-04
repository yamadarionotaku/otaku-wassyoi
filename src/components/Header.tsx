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
    <header className="constellation-bg border-b border-[#b6945b40] bg-[#0e1a2bf2] shadow-[0_1px_0_rgba(182,148,91,0.18)] backdrop-blur supports-[backdrop-filter]:bg-[#0e1a2be0]">
      <div className="mx-auto flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-12 xl:px-20">
        <Link href="/" className="flex items-center gap-3 text-[#f0ead4]">
          <span
            aria-hidden="true"
            className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-[#b6945bb3] bg-[linear-gradient(135deg,rgba(14,26,43,0.98),rgba(20,32,51,0.9))] shadow-[0_10px_24px_rgba(20,32,51,0.08)]"
          >
            <span className="absolute inset-[7px] rotate-45 border border-[#b6945bcc]" />
            <span className="absolute inset-[10px] rounded-full border border-[#b6945bb3]" />
            <span className="absolute left-1/2 top-[7px] h-[30px] w-px -translate-x-1/2 bg-[#b6945bc0]" />
            <span className="absolute left-[7px] top-1/2 h-px w-[30px] -translate-y-1/2 bg-[#b6945bc0]" />
            <span className="absolute size-1.5 rounded-full bg-[color:var(--color-gold)]" />
          </span>
          <span className="flex flex-col">
            <span className="font-serif text-lg font-semibold tracking-[0.04em] text-[#f0ead4]">
              星拾いの崖
            </span>
            <span className="text-xs tracking-[0.16em] text-[color:var(--color-gold-soft)]">
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
                className="min-h-touch inline-flex items-center rounded-[1rem] border border-[#b6945b30] bg-[#0a1420] px-4 py-2 text-sm font-medium text-[#5a6478]"
              >
                {item.label}
                <span className="ml-2 rounded-full border border-[color:var(--color-gold-soft)] bg-[#162538] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-gold)]">
                  準備中
                </span>
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="min-h-touch inline-flex items-center justify-center rounded-[1rem] border border-[#b6945b30] bg-[#162538] px-4 py-2 text-sm font-medium text-[#d9ccb6] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,background-color,color,box-shadow] hover:border-[color:var(--color-gold-soft)] hover:bg-[#1e3350] hover:text-[#f0ead4] hover:shadow-[0_10px_22px_rgba(20,32,51,0.08)]"
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
