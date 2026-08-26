"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { UserPlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CustomerSignupPage() {
  const router = useRouter();
  const { houseMakers, companies, signupCustomer, login } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [houseMakerId, setHouseMakerId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !phone || !address || !email || !password) {
      setError("お名前・電話番号・住所・メールアドレス・パスワードを入力してください。");
      return;
    }
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }

    const result = signupCustomer({
      name,
      phone,
      address,
      email,
      password,
      companyId: companyId || undefined,
      houseMakerId: houseMakerId || undefined,
    });
    if (!result.ok) {
      setError(result.message ?? "登録に失敗しました。");
      return;
    }
    setDone(true);
  }

  function handleGoToDashboard() {
    login(email, password);
    router.push("/customer/dashboard");
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-brand-50">
        <div className="max-w-sm w-full card p-8 text-center space-y-5">
          <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
          <div>
            <h1 className="text-xl font-bold text-slate-800">登録が完了しました</h1>
            <p className="text-slate-500 mt-2">
              ハウスメーカー・アフター会社を選択された場合、それぞれの承認をお待ちください。承認状況はログイン後にご確認いただけます。
            </p>
          </div>
          <button onClick={handleGoToDashboard} className="btn-primary w-full">
            マイページへ進む
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10 bg-brand-50">
      <div className="max-w-sm w-full card p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-slate-800">施主様 新規会員登録</h1>
          <p className="text-sm text-slate-500">お住まいの点検・修理依頼をかんたんに管理できます</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-lg">お名前</label>
            <input className="input-lg" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label-lg">電話番号</label>
            <input
              type="tel"
              className="input-lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090-1234-5678"
              required
            />
          </div>
          <div>
            <label className="label-lg">ご住所</label>
            <input className="input-lg" value={address} onChange={(e) => setAddress(e.target.value)} required />
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
            <label className="label-lg">お家を建てたハウスメーカー（任意）</label>
            <select className="input-lg" value={houseMakerId} onChange={(e) => setHouseMakerId(e.target.value)}>
              <option value="">選択しない</option>
              {houseMakers.map((hm) => (
                <option key={hm.id} value={hm.id}>
                  {hm.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-lg">連携したいアフター会社（任意）</label>
            <select className="input-lg" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              <option value="">選択しない</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              ハウスメーカー経由でなく、直接アフター会社と契約している場合はこちらから選択してください。
            </p>
          </div>

          {error && <p className="text-sm font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            <UserPlus size={20} />
            登録する
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/customer/login" className="text-brand-600 font-bold underline">
            こちらからログイン
          </Link>
        </p>
      </div>
    </main>
  );
}
