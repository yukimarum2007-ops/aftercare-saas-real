"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";
import {
  AFFILIATION_STATUS_LABEL,
  AFFILIATION_STATUS_COLOR,
  BUILDER_TYPE_LABEL,
} from "@/lib/types";
import { Building, Home as HomeIcon, PlusCircle, Link2, Check, X, Inbox, Phone, Unlink, User } from "lucide-react";
import DashboardHero from "@/components/DashboardHero";

export default function CustomerDashboardPage() {
  const {
    currentUser,
    customerOrgLinks,
    companies,
    houseMakers,
    requests,
    requestCustomerOrgLink,
    updateCustomerOrgLinkStatus,
    removeCustomerOrgLink,
  } = useStore();
  const customerId = currentUser?.type === "customer" ? currentUser.customerId : "";

  const [newCompanyId, setNewCompanyId] = useState("");
  const [newHouseMakerId, setNewHouseMakerId] = useState("");
  const [linkError, setLinkError] = useState("");

  const myLinks = useMemo(
    () =>
      customerOrgLinks
        .filter((l) => l.customer_id === customerId)
        .map((l) => {
          const company = l.org_type === "company" ? companies.find((c) => c.id === l.org_id) : undefined;
          const houseMaker = l.org_type === "house_maker" ? houseMakers.find((hm) => hm.id === l.org_id) : undefined;
          return {
            ...l,
            orgName: l.org_type === "company" ? company?.name : houseMaker?.name,
            orgPhone: l.org_type === "company" ? company?.phone : houseMaker?.phone,
            builderType: houseMaker?.builder_type,
          };
        })
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [customerOrgLinks, customerId, companies, houseMakers]
  );

  const linkedOrExcludedCompanyIds = useMemo(
    () =>
      new Set(
        customerOrgLinks
          .filter((l) => l.customer_id === customerId && l.org_type === "company" && l.status !== "rejected")
          .map((l) => l.org_id)
      ),
    [customerOrgLinks, customerId]
  );
  const linkedOrExcludedHouseMakerIds = useMemo(
    () =>
      new Set(
        customerOrgLinks
          .filter((l) => l.customer_id === customerId && l.org_type === "house_maker" && l.status !== "rejected")
          .map((l) => l.org_id)
      ),
    [customerOrgLinks, customerId]
  );

  const availableCompanies = companies.filter((c) => !linkedOrExcludedCompanyIds.has(c.id));
  const availableHouseMakers = houseMakers.filter((hm) => !linkedOrExcludedHouseMakerIds.has(hm.id));

  const myRequests = useMemo(
    () =>
      requests
        .filter((r) => r.customer_id === customerId)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [requests, customerId]
  );

  function handleRequestCompanyLink() {
    setLinkError("");
    if (!newCompanyId) return;
    const result = requestCustomerOrgLink("company", newCompanyId);
    if (!result.ok) {
      setLinkError(result.message ?? "申請に失敗しました。");
      return;
    }
    setNewCompanyId("");
  }

  function handleRequestHouseMakerLink() {
    setLinkError("");
    if (!newHouseMakerId) return;
    const result = requestCustomerOrgLink("house_maker", newHouseMakerId);
    if (!result.ok) {
      setLinkError(result.message ?? "申請に失敗しました。");
      return;
    }
    setNewHouseMakerId("");
  }

  function handleRemoveLink(id: string, name: string) {
    if (window.confirm(`${name} との連携を解除しますか？`)) {
      removeCustomerOrgLink(id);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <DashboardHero
        eyebrow="居住者様マイページ"
        title={`${currentUser && currentUser.type === "customer" ? currentUser.fullName : ""} 様`}
        description="連携状況の確認や、アフター会社への依頼がここから行えます。"
        icon={<User className="text-white" size={26} />}
      />
      <div className="flex justify-end">
        <Link href="/customer/dashboard/new-request" className="btn-primary !px-4 !py-3 !text-base">
          <PlusCircle size={20} />
          依頼する
        </Link>
      </div>

      {/* 連携状況 */}
      <div className="card p-5 space-y-4">
        <p className="font-bold text-slate-700 flex items-center gap-2">
          <Link2 size={18} />
          連携状況
        </p>

        {myLinks.length === 0 && (
          <p className="text-sm text-slate-400">
            ハウスメーカー・工務店・アフター会社との連携はまだありません。依頼はどのアフター会社にも直接行えます。
          </p>
        )}

        {myLinks.map((l) => (
          <div key={l.id} className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              {l.org_type === "company" ? <Building size={20} /> : <HomeIcon size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">
                {l.org_type === "company" ? "アフター会社" : l.builderType ? BUILDER_TYPE_LABEL[l.builderType] : "ハウスメーカー・工務店"}
              </p>
              <p className="font-bold text-slate-800 truncate">{l.orgName ?? "―"}</p>
            </div>
            {l.status === "pending" && l.requested_by === "org" ? (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => updateCustomerOrgLinkStatus(l.id, "approved")}
                  className="btn-primary !px-3 !py-2 !text-sm !rounded-lg"
                >
                  <Check size={16} />
                  承認
                </button>
                <button
                  onClick={() => updateCustomerOrgLinkStatus(l.id, "rejected")}
                  className="btn-secondary !px-3 !py-2 !text-sm !rounded-lg !border-slate-200 !text-slate-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                {l.status === "approved" && l.orgPhone && (
                  <a
                    href={`tel:${l.orgPhone}`}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title="電話をかける"
                    aria-label="電話をかける"
                  >
                    <Phone size={16} />
                  </a>
                )}
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${AFFILIATION_STATUS_COLOR[l.status]}`}
                >
                  {l.status === "pending" ? "先方の承認待ち" : AFFILIATION_STATUS_LABEL[l.status]}
                </span>
                <button
                  onClick={() => handleRemoveLink(l.id, l.orgName ?? "この連携先")}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
                  title={l.status === "approved" ? "連携を解除" : "申請を取り消す"}
                  aria-label={l.status === "approved" ? "連携を解除" : "申請を取り消す"}
                >
                  <Unlink size={16} />
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-xs font-bold text-slate-400">新しく連携申請を送る</p>
          {linkError && <p className="text-sm font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2">{linkError}</p>}

          {availableCompanies.length > 0 && (
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
              <button onClick={handleRequestCompanyLink} disabled={!newCompanyId} className="btn-secondary !px-4 !py-2.5 !text-sm">
                申請
              </button>
            </div>
          )}

          {availableHouseMakers.length > 0 && (
            <div className="flex gap-2">
              <select
                className="input-lg !py-2.5 !text-base flex-1"
                value={newHouseMakerId}
                onChange={(e) => setNewHouseMakerId(e.target.value)}
              >
                <option value="">ハウスメーカー・工務店を選択</option>
                {availableHouseMakers.map((hm) => (
                  <option key={hm.id} value={hm.id}>
                    {hm.name}（{BUILDER_TYPE_LABEL[hm.builder_type]}）
                  </option>
                ))}
              </select>
              <button
                onClick={handleRequestHouseMakerLink}
                disabled={!newHouseMakerId}
                className="btn-secondary !px-4 !py-2.5 !text-sm"
              >
                申請
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 自分の依頼した案件 */}
      <div className="card p-5">
        <p className="font-bold text-slate-700 mb-4">依頼した案件</p>
        <div className="space-y-2">
          {myRequests.length === 0 && (
            <div className="empty-state">
              <Inbox size={28} className="text-slate-300" />
              まだ依頼はありません
            </div>
          )}
          {myRequests.map((r) => {
            const company = companies.find((c) => c.id === r.company_id);
            return (
              <div key={r.id} className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-200">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-800 truncate">{company?.name ?? "―"}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm text-slate-500 mt-1">{r.request_category}</p>
                <p className="text-xs text-slate-400 mt-1">
                  希望日: {r.preferred_date ?? "未指定"} {r.preferred_slot === "am" ? "午前" : r.preferred_slot === "pm" ? "午後" : ""}
                  {r.preferred_time ? ` ${r.preferred_time}〜` : ""}
                </p>
                <p className="text-xs text-slate-400 mt-1">受付ID: {r.tracking_code}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
