"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  AffiliationStatus,
  AFFILIATION_STATUS_LABEL,
  AFFILIATION_STATUS_COLOR,
} from "@/lib/types";
import { Check, X, User, Phone, MapPin, UserPlus, Users, Unlink } from "lucide-react";

export default function MakerCustomersPage() {
  const { currentUser, customerOrgLinks, customers, updateCustomerOrgLinkStatus, inviteCustomerByPhone, removeCustomerOrgLink } =
    useStore();
  const houseMakerId = currentUser?.type === "house_maker" ? currentUser.houseMakerId : "";

  const [filter, setFilter] = useState<AffiliationStatus | "all">("pending");
  const [phone, setPhone] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  const myLinks = useMemo(
    () =>
      customerOrgLinks
        .filter((l) => l.org_type === "house_maker" && l.org_id === houseMakerId)
        .map((l) => ({ ...l, customer: customers.find((cu) => cu.id === l.customer_id) }))
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [customerOrgLinks, houseMakerId, customers]
  );

  const counts = useMemo(() => {
    const c: Record<AffiliationStatus, number> = { pending: 0, approved: 0, rejected: 0 };
    myLinks.forEach((l) => c[l.status]++);
    return c;
  }, [myLinks]);

  const filtered = useMemo(
    () => (filter === "all" ? myLinks : myLinks.filter((l) => l.status === filter)),
    [myLinks, filter]
  );

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");
    setInviteMessage("");
    if (!phone) return;
    const result = inviteCustomerByPhone(phone);
    if (!result.ok) {
      setInviteError(result.message ?? "招待に失敗しました。");
      return;
    }
    setInviteMessage(result.message ?? "招待を送りました。");
    setPhone("");
  }

  function handleRemoveLink(id: string, name: string) {
    if (window.confirm(`${name} 様との連携を解除しますか？`)) {
      removeCustomerOrgLink(id);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">施主様の管理</h1>
        <p className="text-slate-500 mt-1">施主様からの連携申請の確認・承認や、電話番号での招待ができます。</p>
      </div>

      <form onSubmit={handleInvite} className="card p-5 space-y-3">
        <p className="font-bold text-slate-700 flex items-center gap-2">
          <UserPlus size={18} />
          電話番号で施主様を招待する
        </p>
        <div className="flex gap-2">
          <input
            type="tel"
            className="input-lg !py-2.5 !text-base flex-1"
            placeholder="090-1111-2222"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit" className="btn-primary !px-5 !py-2.5 !text-sm">
            招待を送る
          </button>
        </div>
        <p className="text-xs text-slate-400">
          すでにアプリに会員登録している施主様の電話番号を入力すると、連携の承認依頼を送れます。
        </p>
        {inviteError && <p className="text-sm font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2">{inviteError}</p>}
        {inviteMessage && (
          <p className="text-sm font-bold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{inviteMessage}</p>
        )}
      </form>

      <div className="grid grid-cols-3 gap-3">
        {(["pending", "approved", "rejected"] as AffiliationStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={`card p-4 text-left transition ${filter === s ? "ring-2 ring-brand-500" : ""}`}
          >
            <p className="text-2xl font-bold text-slate-800">{counts[s]}</p>
            <p className="text-sm text-slate-500 font-bold">{AFFILIATION_STATUS_LABEL[s]}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="empty-state">
            <Users size={28} className="text-slate-300" />
            該当する施主様はいません
          </div>
        )}
        {filtered.map((l) => (
          <div key={l.id} className="card p-4 md:p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              <User size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{l.customer?.name ?? "―"} 様</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {l.customer?.phone}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={12} /> {l.customer?.address}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 mt-2 rounded-full border px-2.5 py-0.5 text-xs font-bold ${AFFILIATION_STATUS_COLOR[l.status]}`}
              >
                {l.status === "pending" && l.requested_by === "org" ? "施主様の承認待ち" : AFFILIATION_STATUS_LABEL[l.status]}
              </span>
            </div>
            {l.status === "pending" && l.requested_by === "customer" ? (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => updateCustomerOrgLinkStatus(l.id, "approved")}
                  className="btn-primary !px-4 !py-2.5 !text-sm !rounded-xl"
                >
                  <Check size={18} />
                  承認
                </button>
                <button
                  onClick={() => updateCustomerOrgLinkStatus(l.id, "rejected")}
                  className="btn-secondary !px-4 !py-2.5 !text-sm !rounded-xl !border-slate-200 !text-slate-500"
                >
                  <X size={18} />
                  却下
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleRemoveLink(l.id, l.customer?.name ?? "この施主様")}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors shrink-0"
                title={l.status === "approved" ? "連携を解除" : "申請を取り消す"}
                aria-label={l.status === "approved" ? "連携を解除" : "申請を取り消す"}
              >
                <Unlink size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
