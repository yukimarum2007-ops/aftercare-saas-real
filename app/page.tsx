import Link from "next/link";
import { ClipboardCheck, Search, Building, UserPlus, User, Wrench } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-14">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/30 mb-1">
            <Wrench className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 leading-snug">
            アフターメンテナンス
            <br />
            管理システム
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            アフター会社・ハウスメーカーの方はログイン、
            <br />
            施主様は新規会員登録からご利用ください。
          </p>
        </div>

        <div className="flex flex-col gap-3">
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

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400">施主様はこちら</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <Link href="/customer/login" className="btn-secondary w-full">
            <User size={22} />
            施主様ログイン
          </Link>
          <Link href="/customer/signup" className="btn-secondary w-full">
            <UserPlus size={22} />
            施主様 新規会員登録
          </Link>
          <Link href="/status" className="btn-secondary w-full">
            <Search size={22} />
            対応状況を確認する
          </Link>
        </div>

        <div className="card p-4 text-left text-sm text-slate-500 space-y-1">
          <p className="section-eyebrow mb-1">デモ用ログイン情報</p>
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
