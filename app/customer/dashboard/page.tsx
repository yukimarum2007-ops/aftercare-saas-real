"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";
import {
  AFFILIATION_STATUS_LABEL,
  AFFILIATION_STATUS_COLOR,
} from "@/lib/types";
import { Building, Home as HomeIcon, PlusCircle, Link2 } from "lucide-react";

export default function CustomerDashboardPage() {
  const { currentUser, customerConnections, companies, houseMakers, requests } = useStore();
  const customerId = currentUser?.type === "customer" ? currentUser.customerId : "";

  const myConnection = useMemo(
    () => customerConnections.find((c) => c.customer_id === customerId) ?? null,
    [customerConnections, customerId]
  );

  const linkedCompany = myConnection?.company_id ? companies.find((c) => c.id === myConnection.company_id) : null;
  const linkedHouseMaker = myConnection?.house_maker_id
    ? houseMakers.find((hm) => hm.id === myConnection.house_maker_id)
    : null;

  const myRequests = useMemo(
    () =>
      requests
        .filter((r) => r.customer_id === customerId)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [requests, customerId]
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">マイページ</h1>
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

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
            <HomeIcon size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400">ハウスメーカー</p>
            {linkedHouseMaker ? (
              <p className="font-bold text-slate-800">{linkedHouseMaker.name}</p>
            ) : (
              <p className="text-slate-400 text-sm">未選択</p>
            )}
          </div>
          {myConnection?.house_maker_id && (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${AFFILIATION_STATUS_COLOR[myConnection.house_maker_status]}`}
            >
              {AFFILIATION_STATUS_LABEL[myConnection.house_maker_status]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
            <Building size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400">アフター会社</p>
            {linkedCompany ? (
              <p className="font-bold text-slate-800">{linkedCompany.name}</p>
            ) : (
              <p className="text-slate-400 text-sm">未選択</p>
            )}
          </div>
          {myConnection?.company_id && (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${AFFILIATION_STATUS_COLOR[myConnection.company_status]}`}
            >
              {AFFILIATION_STATUS_LABEL[myConnection.company_status]}
            </span>
          )}
        </div>

        {!myConnection && (
          <p className="text-sm text-slate-400">
            ハウスメーカー・アフター会社との連携は登録されていません。依頼はどのアフター会社にも行えます。
          </p>
        )}
      </div>

      {/* 自分の依頼した案件 */}
      <div className="card p-5">
        <p className="font-bold text-slate-700 mb-4">依頼した案件</p>
        <div className="space-y-2">
          {myRequests.length === 0 && (
            <p className="text-slate-400 text-sm py-8 text-center">まだ依頼はありません</p>
          )}
          {myRequests.map((r) => {
            const company = companies.find((c) => c.id === r.company_id);
            return (
              <div key={r.id} className="rounded-xl border border-slate-200 p-4">
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
