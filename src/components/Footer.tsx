export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div aria-hidden="true" className="diamond-divider" />
      </div>
      <div className="bg-[color:var(--color-night)]">
        <div className="mx-auto flex w-full flex-col gap-3 px-4 py-8 sm:px-6 lg:px-12 xl:px-20">
          <p className="font-serif text-base text-[color:var(--color-gold-soft)]">
            © {currentYear} 星拾いの崖
          </p>
          <p className="text-sm leading-7 text-[#f6f1e6cc]">
            ※当サイトはアフィリエイトプログラムに参加しています
          </p>
        </div>
      </div>
    </footer>
  );
}
