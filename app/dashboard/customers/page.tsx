"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  AffiliationStatus,
  AFFILIATION_STATUS_LABEL,
  AFFILIATION_STATUS_COLOR,
} from "@/lib/types";
import { Check, X, User, Phone, MapPin } from "lucide-react";

export default function CompanyCustomersPage() {
  const { currentUser, customerConnections, customers, updateCustomerConnectionStatus } = useStore();
  const companyId = currentUser?.type === "company" ? currentUser.companyId : "";

  const [filter, setFilter] = useState<AffiliationStatus | "all">("pending");

  const myConnections = useMemo(
    () =>
      customerConnections
        .filter((c) => c.company_id === companyId)
        .map((c) => ({ ...c, customers: customers.find((cu) => cu.id === c.customer_id) }))
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [customerConnections, companyId, customers]
  );

  const counts = useMemo(() => {
    const c: Record<AffiliationStatus, number> = { pending: 0, approved: 0, rejected: 0 };
    myConnections.forEach((conn) => c[conn.company_status]++);
    return c;
  }, [myConnections]);

  const filtered = useMemo(
    () => (filter === "all" ? myConnections : myConnections.filter((c) => c.company_status === filter)),
    [myConnections, filter]
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">施主様の管理</h1>
        <p className="text-slate-500 mt-1">新規会員登録された施主様からの連携申請を確認・承認できます。</p>
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
          <p className="text-slate-400 text-sm py-10 text-center">該当する施主様はいません</p>
        )}
        {filtered.map((c) => (
          <div key={c.id} className="card p-4 md:p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              <User size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{c.customers?.name ?? "―"} 様</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {c.customers?.phone}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={12} /> {c.customers?.address}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 mt-2 rounded-full border px-2.5 py-0.5 text-xs font-bold ${AFFILIATION_STATUS_COLOR[c.company_status]}`}
              >
                {AFFILIATION_STATUS_LABEL[c.company_status]}
              </span>
            </div>
            {c.company_status === "pending" && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => updateCustomerConnectionStatus(c.id, "company", "approved")}
                  className="btn-primary !px-4 !py-2.5 !text-sm !rounded-xl"
                >
                  <Check size={18} />
                  承認
                </button>
                <button
                  onClick={() => updateCustomerConnectionStatus(c.id, "company", "rejected")}
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
