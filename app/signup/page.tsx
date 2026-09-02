"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { UserPlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { BUILDER_TYPE_LABEL } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const { houseMakers, signupCompany, login } = useStore();

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [houseMakerId, setHouseMakerId] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!companyName || !fullName || !email || !password || !houseMakerId) {
      setError("すべての項目を入力してください。");
      return;
    }
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }

    const result = signupCompany({ companyName, fullName, email, password, houseMakerId });
    if (!result.ok) {
      setError(result.message ?? "登録に失敗しました。");
      return;
    }
    setDone(true);
  }

  function handleGoToDashboard() {
    login(email, password);
    router.push("/dashboard");
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-brand-50 auth-bg">
        <div className="max-w-sm w-full card p-8 text-center space-y-5">
          <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
          <div>
            <h1 className="text-xl font-bold text-slate-800">登録が完了しました</h1>
            <p className="text-slate-500 mt-2">
              選択されたハウスメーカーの承認をお待ちください。承認されるとログイン後にご利用いただけます。
            </p>
          </div>
          <button onClick={handleGoToDashboard} className="btn-primary w-full">
            ダッシュボードへ進む
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10 bg-brand-50 auth-bg">
      <div className="max-w-sm w-full card p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-slate-800">新規会員登録</h1>
          <p className="text-sm text-slate-500">アフター会社様の新規アカウント登録</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-lg">会社名</label>
            <input className="input-lg" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          </div>
          <div>
            <label className="label-lg">ご担当者名</label>
            <input className="input-lg" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="label-lg">メールアドレス</label>
            <input type="email" className="input-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label-lg">パスワード</label>
            <input
              type="password"
              className="input-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              required
            />
          </div>
          <div>
            <label className="label-lg">紐付けするハウスメーカー・工務店</label>
            <select
              className="input-lg"
              value={houseMakerId}
              onChange={(e) => setHouseMakerId(e.target.value)}
              required
            >
              <option value="">選択してください</option>
              {houseMakers.map((hm) => (
                <option key={hm.id} value={hm.id}>
                  {hm.name}（{BUILDER_TYPE_LABEL[hm.builder_type]}）
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            <UserPlus size={20} />
            登録して申請する
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-brand-600 font-bold underline">
            こちらからログイン
          </Link>
        </p>
      </div>
    </main>
  );
}
