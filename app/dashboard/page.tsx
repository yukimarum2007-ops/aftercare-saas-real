"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  ServiceRequest,
  RequestStatus,
  STATUS_LABEL,
  SOURCE_LABEL,
  AFFILIATION_STATUS_LABEL,
  AFFILIATION_STATUS_COLOR,
} from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import RequestModal from "@/components/RequestModal";
import { getMonthGrid, toDateKey, formatMonthLabel, WEEKDAY_LABELS } from "@/lib/date";
import { Inbox, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const { currentUser, requests, affiliations, houseMakers } = useStore();
  const companyId = currentUser?.type === "company" ? currentUser.companyId : "";

  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const companyRequests = useMemo(
    () => requests.filter((r) => r.company_id === companyId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [requests, companyId]
  );

  const companyAffiliations = useMemo(
    () =>
      affiliations
        .filter((a) => a.company_id === companyId)
        .map((a) => ({ ...a, house_makers: houseMakers.find((hm) => hm.id === a.house_maker_id) })),
    [affiliations, companyId, houseMakers]
  );

  const counts = useMemo(() => {
    const c: Record<RequestStatus, number> = { new: 0, confirmed: 0, completed: 0 };
    companyRequests.forEach((r) => c[r.status]++);
    return c;
  }, [companyRequests]);

  const filtered = useMemo(
    () => (filter === "all" ? companyRequests : companyRequests.filter((r) => r.status === filter)),
    [companyRequests, filter]
  );

  const grid = getMonthGrid(cursor.year, cursor.month);
  const requestsByDate = useMemo(() => {
    const map: Record<string, ServiceRequest[]> = {};
    companyRequests.forEach((r) => {
      if (!r.preferred_date) return;
      map[r.preferred_date] = map[r.preferred_date] ?? [];
      map[r.preferred_date].push(r);
    });
    return map;
  }, [companyRequests]);

  // selected は requests 更新後も最新の内容を参照する
  const selectedLive = selected ? companyRequests.find((r) => r.id === selected.id) ?? null : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800">ダッシュボード</h1>

      {companyAffiliations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {companyAffiliations.map((a) => (
            <span
              key={a.id}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${AFFILIATION_STATUS_COLOR[a.status]}`}
            >
              {a.house_makers?.name}: {AFFILIATION_STATUS_LABEL[a.status]}
            </span>
          ))}
        </div>
      )}

      {/* ステータスサマリー */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <SummaryCard
          icon={Inbox}
          label={STATUS_LABEL.new}
          count={counts.new}
          active={filter === "new"}
          onClick={() => setFilter(filter === "new" ? "all" : "new")}
          color="text-amber-600 bg-amber-50"
        />
        <SummaryCard
          icon={CalendarClock}
          label={STATUS_LABEL.confirmed}
          count={counts.confirmed}
          active={filter === "confirmed"}
          onClick={() => setFilter(filter === "confirmed" ? "all" : "confirmed")}
          color="text-brand-600 bg-brand-50"
        />
        <SummaryCard
          icon={CheckCircle2}
          label={STATUS_LABEL.completed}
          count={counts.completed}
          active={filter === "completed"}
          onClick={() => setFilter(filter === "completed" ? "all" : "completed")}
          color="text-emerald-600 bg-emerald-50"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* カレンダー表示 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() =>
                setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))
              }
              className="p-2 rounded-full hover:bg-slate-100"
            >
              <ChevronLeft size={20} />
            </button>
            <p className="font-bold text-slate-700">{formatMonthLabel(cursor.year, cursor.month)}</p>
            <button
              onClick={() =>
                setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))
              }
              className="p-2 rounded-full hover:bg-slate-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-1">
            {WEEKDAY_LABELS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell, i) => {
              if (!cell.date) return <div key={i} />;
              const key = toDateKey(cell.date);
              const dayRequests = requestsByDate[key] ?? [];
              return (
                <div
                  key={i}
                  className="aspect-square rounded-lg border border-slate-100 flex flex-col items-center justify-center gap-0.5 text-sm"
                >
                  <span className="text-slate-600">{cell.date.getDate()}</span>
                  {dayRequests.length > 0 && (
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 rounded-full px-1.5">
                      {dayRequests.length}件
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 案件一覧 */}
        <div className="card p-5">
          <p className="font-bold text-slate-700 mb-4">
            案件一覧 {filter !== "all" && `（${STATUS_LABEL[filter]}）`}
          </p>
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {filtered.length === 0 && <p className="text-slate-400 text-sm py-8 text-center">案件はありません</p>}
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className="w-full text-left rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/40 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-800 truncate">{r.customer_name} 様</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm text-slate-500 mt-1 truncate">{r.request_category}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-400">
                    希望日: {r.preferred_date ?? "未指定"} {r.preferred_slot === "am" ? "午前" : r.preferred_slot === "pm" ? "午後" : ""}
                  </p>
                  <span className="text-xs font-bold text-slate-400">{SOURCE_LABEL[r.source]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedLive && <RequestModal request={selectedLive} onClose={() => setSelected(null)} />}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  count,
  active,
  onClick,
  color,
}: {
  icon: any;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`card p-4 md:p-5 text-left transition ${active ? "ring-2 ring-brand-500" : ""}`}
    >
      <div className={`inline-flex p-2 rounded-xl mb-2 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-slate-800">{count}</p>
      <p className="text-xs md:text-sm text-slate-500 font-bold">{label}</p>
    </button>
  );
}
