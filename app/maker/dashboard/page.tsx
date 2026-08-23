"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  AffiliationStatus,
  AFFILIATION_STATUS_LABEL,
  AFFILIATION_STATUS_COLOR,
} from "@/lib/types";
import { Check, X, Clock, Building2 } from "lucide-react";

export default function MakerDashboardPage() {
  const { currentUser, affiliations, companies, updateAffiliationStatus } = useStore();
  const houseMakerId = currentUser?.type === "house_maker" ? currentUser.houseMakerId : "";

  const [filter, setFilter] = useState<AffiliationStatus | "all">("pending");

  const myAffiliations = useMemo(
    () =>
      affiliations
        .filter((a) => a.house_maker_id === houseMakerId)
        .map((a) => ({ ...a, companies: companies.find((c) => c.id === a.company_id) }))
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [affiliations, houseMakerId, companies]
  );

  const counts = useMemo(() => {
    const c: Record<AffiliationStatus, number> = { pending: 0, approved: 0, rejected: 0 };
    myAffiliations.forEach((a) => c[a.status]++);
    return c;
  }, [myAffiliations]);

  const filtered = useMemo(
    () => (filter === "all" ? myAffiliations : myAffiliations.filter((a) => a.status === filter)),
    [myAffiliations, filter]
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">提携アフター会社の管理</h1>
        <p className="text-slate-500 mt-1">新規登録されたアフター会社からの提携申請を確認・承認できます。</p>
      </div>

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
          <p className="text-slate-400 text-sm py-10 text-center">該当する申請はありません</p>
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
                {AFFILIATION_STATUS_LABEL[a.status]}
              </span>
            </div>
            {a.status === "pending" && (
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
