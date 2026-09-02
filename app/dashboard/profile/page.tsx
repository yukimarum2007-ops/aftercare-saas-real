"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Save, CheckCircle2 } from "lucide-react";

export default function CompanyProfilePage() {
  const router = useRouter();
  const { currentUser, companies, accounts, updateCompanyProfile } = useStore();
  const companyId = currentUser?.type === "company" ? currentUser.companyId : "";
  const company = companies.find((c) => c.id === companyId);
  const account = accounts.find((a) => a.type === "company" && a.refId === companyId);

  const [companyName, setCompanyName] = useState(company?.name ?? "");
  const [phone, setPhone] = useState(company?.phone ?? "");
  const [address, setAddress] = useState(company?.address ?? "");
  const [fullName, setFullName] = useState(account?.fullName ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!companyName || !fullName || !email) {
      setError("会社名・ご担当者名・メールアドレスを入力してください。");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError("新しいパスワードは6文字以上で入力してください。");
      return;
    }

    const result = updateCompanyProfile({
      companyName,
      phone,
      address,
      fullName,
      email,
      newPassword: newPassword || undefined,
    });
    if (!result.ok) {
      setError(result.message ?? "更新に失敗しました。");
      return;
    }
    setNewPassword("");
    setSaved(true);
  }

  if (!company) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">会社情報の編集</h1>
        <p className="text-slate-500 mt-1">登録内容はいつでも変更できます。</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 md:p-6 space-y-5">
        <div>
          <label className="label-lg">会社名</label>
          <input className="input-lg" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </div>
        <div>
          <label className="label-lg">電話番号</label>
          <input
            type="tel"
            className="input-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03-1234-5678"
          />
        </div>
        <div>
          <label className="label-lg">住所</label>
          <input className="input-lg" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label className="label-lg">ご担当者名</label>
          <input className="input-lg" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="label-lg">メールアドレス（ログインID）</label>
          <input type="email" className="input-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label-lg">新しいパスワード（変更する場合のみ）</label>
          <input
            type="password"
            className="input-lg"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="6文字以上"
          />
        </div>

        {error && <p className="text-sm font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        {saved && (
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
            <CheckCircle2 size={18} />
            保存しました。
          </p>
        )}

        <button type="submit" className="btn-primary w-full">
          <Save size={20} />
          保存する
        </button>
      </form>

      <button onClick={() => router.push("/dashboard")} className="btn-secondary w-full">
        ダッシュボードへ戻る
      </button>
    </div>
  );
}
