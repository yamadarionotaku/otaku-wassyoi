import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  fallback: ["Yu Mincho", "Hiragino Mincho ProN", "serif"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "星拾いの崖 | 中国限定 原神グッズ データベース",
    template: "%s | 星拾いの崖",
  },
  description:
    "中国限定の原神グッズ情報を日本語で。フィギュア、アクスタ、ぬいぐるみなどのグッズを検索・発見できるデータベースサイト。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSerifJp.variable} h-full bg-background text-foreground antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
