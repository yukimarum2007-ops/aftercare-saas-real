"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { User, LogIn } from "lucide-react";
import Link from "next/link";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login } = useStore();
  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = login(email, password);
    if (!result.ok) {
      setError(result.message ?? "ログインに失敗しました。");
      return;
    }
    if (result.redirectTo !== "/customer/dashboard") {
      setError("このアカウントは居住者様用のアカウントとして登録されていません。");
      return;
    }
    router.push("/customer/dashboard");
  }

  return (
    <main className="min-h-screen app-shell-bg flex flex-col">
      <div className="app-header-band px-6 pt-14 pb-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3">
          <User size={26} />
        </div>
        <h1 className="text-xl font-bold">居住者様ログイン</h1>
        <p className="text-sm text-white/75 mt-1">依頼状況の確認・新しい依頼の登録ができます</p>
      </div>

      <div className="flex-1 px-6 -mt-8 pb-10">
        <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg shadow-slate-200/60 p-6 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label-lg">メールアドレス</label>
              <input
                type="email"
                required
                className="input-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label-lg">パスワード</label>
              <input
                type="password"
                required
                className="input-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full">
              <LogIn size={20} />
              ログイン
            </button>
          </form>
        </div>

        <div className="max-w-sm mx-auto mt-5">
          <p className="text-center text-sm text-slate-400">
            はじめての方は{" "}
            <Link href="/customer/signup" className="text-brand-600 font-bold underline">
              新規会員登録
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
