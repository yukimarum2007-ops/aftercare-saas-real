"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";

export default function PublicUrlCard({ companyId }: { companyId: string }) {
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const url = `${baseUrl}/request/${companyId}`;

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
        <Link2 size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">施主・工務店にお渡しする受付フォームURL</p>
        <p className="text-sm font-bold text-slate-700 truncate">{url}</p>
      </div>
      <button onClick={copy} className="btn-secondary !px-3 !py-2 !text-sm shrink-0">
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? "コピー済み" : "コピー"}
      </button>
    </div>
  );
}
