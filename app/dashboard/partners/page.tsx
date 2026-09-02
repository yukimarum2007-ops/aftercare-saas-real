"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Plus, Copy, Check, Building2, Users } from "lucide-react";

export default function PartnersPage() {
  const { currentUser, partners, addPartner } = useStore();
  const companyId = currentUser?.type === "company" ? currentUser.companyId : "";

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const companyPartners = partners.filter((p) => p.company_id === companyId);

  function handleAddPartner(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    addPartner({ name, contactName, contactPhone });
    setName("");
    setContactName("");
    setContactPhone("");
    setShowForm(false);
  }

  function shareLink(partnerId: string) {
    return `${baseUrl}/request/${companyId}?partner=${partnerId}`;
  }

  function copyLink(partnerId: string) {
    navigator.clipboard.writeText(shareLink(partnerId));
    setCopiedId(partnerId);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">連携工務店管理</h1>
          <p className="text-slate-500 mt-1">取引のある工務店ごとに、案件登録用の共有リンクを発行できます。</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary !px-4 !py-3 !text-base">
          <Plus size={20} />
          追加
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddPartner} className="card p-5 space-y-3">
          <div>
            <label className="label-lg">工務店名</label>
            <input className="input-lg" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-lg">担当者名</label>
              <input className="input-lg" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div>
              <label className="label-lg">電話番号</label>
              <input className="input-lg" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">登録する</button>
        </form>
      )}

      <div className="space-y-3">
        {companyPartners.length === 0 && (
          <div className="empty-state">
            <Users size={28} className="text-slate-300" />
            まだ登録された工務店はありません
          </div>
        )}
        {companyPartners.map((p) => (
          <div key={p.id} className="card p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              <Building2 size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{p.name}</p>
              <p className="text-sm text-slate-500 truncate">
                {p.contact_name} {p.contact_phone}
              </p>
              <p className="text-xs text-slate-400 truncate mt-1">{shareLink(p.id)}</p>
            </div>
            <button
              onClick={() => copyLink(p.id)}
              className="btn-secondary !px-3 !py-2 !text-sm shrink-0"
            >
              {copiedId === p.id ? <Check size={18} /> : <Copy size={18} />}
              {copiedId === p.id ? "コピー済み" : "リンク"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
