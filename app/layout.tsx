import type { Metadata } from "next";
import "./globals.css";
import { MockDataProvider } from "@/lib/store";

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
    <html lang="ja">
      <body className="min-h-screen">
        <MockDataProvider>{children}</MockDataProvider>
      </body>
    </html>
  );
}
