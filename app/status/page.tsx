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
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-6">
      <div className="max-w-sm w-full card p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-slate-800">対応状況の確認</h1>
          <p className="text-slate-500 text-sm">受付完了画面に表示された受付IDを入力してください</p>
        </div>
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
  );
}
