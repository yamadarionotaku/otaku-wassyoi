export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-zinc-500 sm:px-6 lg:px-8">
        <p>© {currentYear} おたくわっしょい</p>
        <p>※当サイトはアフィリエイトプログラムに参加しています</p>
      </div>
    </footer>
  );
}
