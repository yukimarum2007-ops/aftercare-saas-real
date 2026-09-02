"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { LogIn } from "lucide-react";
import HouseIllustration from "@/components/HouseIllustration";
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
    <main className="min-h-screen flex items-center justify-center px-6 bg-brand-50 auth-bg">
      <div className="max-w-sm w-full card p-8 space-y-6">
        <div className="text-center space-y-1">
          <HouseIllustration className="w-16 mx-auto mb-1" />
          <h1 className="text-xl font-bold text-slate-800">居住者様ログイン</h1>
          <p className="text-sm text-slate-500">依頼状況の確認・新しい依頼の登録ができます</p>
        </div>

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

        <p className="text-center text-sm text-slate-400">
          はじめての方は{" "}
          <Link href="/customer/signup" className="text-brand-600 font-bold underline">
            新規会員登録
          </Link>
        </p>
      </div>
    </main>
  );
}
