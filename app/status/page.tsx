"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function StatusLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/status/${code.trim().toUpperCase()}`);
  }

  return (
    <main className="min-h-screen app-shell-bg flex flex-col">
      <div className="app-header-band px-6 pt-14 pb-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3">
          <Search size={26} />
        </div>
        <h1 className="text-xl font-bold">対応状況の確認</h1>
        <p className="text-sm text-white/75 mt-1">受付完了画面に表示された受付IDを入力してください</p>
      </div>

      <div className="flex-1 px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg shadow-slate-200/60 p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="input-lg text-center tracking-widest font-bold"
              placeholder="例: A1B2C3D4"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button type="submit" className="btn-primary w-full">
              <Search size={20} />
              確認する
            </button>
          </form>
          <p className="text-center text-xs text-slate-400">デモ用受付ID: DEMO0001 / DEMO0002 / DEMO0003</p>
        </div>
      </div>
    </main>
  );
}
