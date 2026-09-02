import Link from "next/link";
import { ClipboardCheck, Search, Building, UserPlus, User } from "lucide-react";
import HouseSkyline from "@/components/HouseSkyline";
import HouseIllustration from "@/components/HouseIllustration";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-14 home-hero-bg">
      <HouseSkyline className="home-skyline" />
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 md:gap-10 items-center">
        {/* 家のイラスト（手描きSVG） */}
        <div className="hidden md:flex items-center justify-center">
          <HouseIllustration className="w-full max-w-sm drop-shadow-xl" />
        </div>

        <div className="w-full space-y-8">
          <div className="text-center md:text-left space-y-3">
            <HouseIllustration className="w-32 mx-auto md:hidden drop-shadow-lg" />
            <h1 className="text-2xl font-bold text-slate-800 leading-snug">
              アフターメンテナンス
              <br />
              管理システム
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              アフター会社・ハウスメーカー・工務店の方はログイン、
              <br className="hidden md:block" />
              居住者様は新規会員登録からご利用ください。
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

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-bold text-slate-400">ハウスメーカー・工務店はこちら</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link href="/maker/login" className="btn-secondary w-full">
              <Building size={22} />
              ハウスメーカー・工務店ログイン
            </Link>
            <Link href="/maker/signup" className="btn-secondary w-full">
              <UserPlus size={22} />
              ハウスメーカー・工務店 新規登録
            </Link>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-bold text-slate-400">居住者様はこちら</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link href="/customer/login" className="btn-secondary w-full">
              <User size={22} />
              居住者様ログイン
            </Link>
            <Link href="/customer/signup" className="btn-secondary w-full">
              <UserPlus size={22} />
              居住者様 新規会員登録
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
            <p>工務店: contractor@example.com / password123</p>
            <p>居住者様: customer@example.com / password123</p>
            <p className="text-xs text-slate-400 pt-1">
              ※本アプリはダミーデータで動作するデモ版です。データはブラウザのメモリ上のみで保持され、再読み込みでリセットされます。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
