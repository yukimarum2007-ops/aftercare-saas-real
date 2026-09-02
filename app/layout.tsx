import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { MockDataProvider } from "@/lib/store";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "アフターメンテナンス管理システム",
  description: "住宅設備アフターメンテナンス業務のデジタル化SaaS（デモ版・モックデータ）",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="min-h-screen">
        <MockDataProvider>{children}</MockDataProvider>
      </body>
    </html>
  );
}
