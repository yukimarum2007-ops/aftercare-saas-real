"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  AffiliationStatus,
  AFFILIATION_STATUS_LABEL,
  AFFILIATION_STATUS_COLOR,
} from "@/lib/types";
import { Check, X, Clock, Building2, Send, Unlink, Inbox } from "lucide-react";

export default function MakerDashboardPage() {
  const { currentUser, affiliations, companies, updateAffiliationStatus, requestAffiliation, removeAffiliation } =
    useStore();
  const houseMakerId = currentUser?.type === "house_maker" ? currentUser.houseMakerId : "";

  const [filter, setFilter] = useState<AffiliationStatus | "all">("pending");
  const [newCompanyId, setNewCompanyId] = useState("");
  const [requestError, setRequestError] = useState("");

  const myAffiliations = useMemo(
    () =>
      affiliations
        .filter((a) => a.house_maker_id === houseMakerId)
        .map((a) => ({ ...a, companies: companies.find((c) => c.id === a.company_id) }))
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [affiliations, houseMakerId, companies]
  );

  const linkedCompanyIds = useMemo(
    () => new Set(myAffiliations.filter((a) => a.status !== "rejected").map((a) => a.company_id)),
    [myAffiliations]
  );
  const availableCompanies = companies.filter((c) => !linkedCompanyIds.has(c.id));

  const counts = useMemo(() => {
    const c: Record<AffiliationStatus, number> = { pending: 0, approved: 0, rejected: 0 };
    myAffiliations.forEach((a) => c[a.status]++);
    return c;
  }, [myAffiliations]);

  const filtered = useMemo(
    () => (filter === "all" ? myAffiliations : myAffiliations.filter((a) => a.status === filter)),
    [myAffiliations, filter]
  );

  function handleRequest() {
    setRequestError("");
    if (!newCompanyId) return;
    const result = requestAffiliation(newCompanyId);
    if (!result.ok) {
      setRequestError(result.message ?? "申請に失敗しました。");
      return;
    }
    setNewCompanyId("");
  }

  function handleRemoveAffiliation(id: string, name: string) {
    if (window.confirm(`${name} との提携を解除しますか？`)) {
      removeAffiliation(id);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">提携アフター会社の管理</h1>
        <p className="text-slate-500 mt-1">アフター会社からの提携申請の確認・承認、または自分から新しく申請を送れます。</p>
      </div>

      {availableCompanies.length > 0 && (
        <div className="card p-5 space-y-3">
          <p className="font-bold text-slate-700 flex items-center gap-2">
            <Send size={18} />
            新しく提携を申請する
          </p>
          <div className="flex gap-2">
            <select
              className="input-lg !py-2.5 !text-base flex-1"
              value={newCompanyId}
              onChange={(e) => setNewCompanyId(e.target.value)}
            >
              <option value="">アフター会社を選択</option>
              {availableCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button onClick={handleRequest} disabled={!newCompanyId} className="btn-primary !px-5 !py-2.5 !text-sm">
              申請を送る
            </button>
          </div>
          {requestError && <p className="text-sm font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2">{requestError}</p>}
        </div>
      )}

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
            <Inbox size={28} className="text-slate-300" />
            該当する申請はありません
          </div>
        )}
        {filtered.map((a) => (
          <div key={a.id} className="card p-4 md:p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              <Building2 size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{a.companies?.name ?? "―"}</p>
              <span
                className={`inline-flex items-center gap-1 mt-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${AFFILIATION_STATUS_COLOR[a.status]}`}
              >
                <Clock size={12} />
                {a.status === "pending" && a.requested_by === "house_maker" ? "先方の承認待ち" : AFFILIATION_STATUS_LABEL[a.status]}
              </span>
            </div>
            {a.status === "pending" && a.requested_by === "company" ? (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => updateAffiliationStatus(a.id, "approved")}
                  className="btn-primary !px-4 !py-2.5 !text-sm !rounded-xl"
                >
                  <Check size={18} />
                  承認
                </button>
                <button
                  onClick={() => updateAffiliationStatus(a.id, "rejected")}
                  className="btn-secondary !px-4 !py-2.5 !text-sm !rounded-xl !border-slate-200 !text-slate-500"
                >
                  <X size={18} />
                  却下
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleRemoveAffiliation(a.id, a.companies?.name ?? "この提携先")}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors shrink-0"
                title={a.status === "approved" ? "提携を解除" : "申請を取り消す"}
                aria-label={a.status === "approved" ? "提携を解除" : "申請を取り消す"}
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
