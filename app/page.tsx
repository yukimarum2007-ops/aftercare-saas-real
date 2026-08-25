import Link from "next/link";
import { ClipboardCheck, Search, Building, UserPlus, User, Wrench } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">
          アフターメンテナンス管理システム
        </h1>
        <p className="text-slate-500">
          アフター会社・ハウスメーカーの方はログイン、施主様は新規会員登録または担当会社から案内されたURLからご利用ください。
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <Link href="/login" className="btn-primary w-full">
            <ClipboardCheck size={22} />
            アフター会社ログイン
          </Link>
          <Link href="/signup" className="btn-secondary w-full">
            <UserPlus size={22} />
            アフター会社 新規登録
          </Link>
          <Link href="/maker/login" className="btn-secondary w-full">
            <Building size={22} />
            ハウスメーカー担当者ログイン
          </Link>
          <div className="h-px bg-slate-200 my-1" />
          <Link href="/customer/login" className="btn-secondary w-full">
            <User size={22} />
            施主様ログイン
          </Link>
          <Link href="/customer/signup" className="btn-secondary w-full">
            <UserPlus size={22} />
            施主様 新規会員登録
          </Link>
          <Link href="/request/c1" className="btn-secondary w-full">
            <Wrench size={22} />
            施主・工務店の受付フォーム（デモ）
          </Link>
          <Link href="/status" className="btn-secondary w-full">
            <Search size={22} />
            対応状況を確認する
          </Link>
        </div>

        <div className="card p-4 text-left text-sm text-slate-500 space-y-1">
          <p className="font-bold text-slate-600">デモ用ログイン情報</p>
          <p>アフター会社: company@example.com / password123</p>
          <p>ハウスメーカー: maker@example.com / password123</p>
          <p>施主様: customer@example.com / password123</p>
          <p className="text-xs text-slate-400 pt-1">
            ※本アプリはダミーデータで動作するデモ版です。データはブラウザのメモリ上のみで保持され、再読み込みでリセットされます。
          </p>
        </div>
      </div>
    </main>
  );
}
