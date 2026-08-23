"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { getMonthGrid, toDateKey, formatMonthLabel, WEEKDAY_LABELS } from "@/lib/date";
import { ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";

export default function CalendarSettingsPage() {
  const { currentUser, getSlot, toggleSlot } = useStore();
  const companyId = currentUser?.type === "company" ? currentUser.companyId : "";

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const grid = getMonthGrid(cursor.year, cursor.month);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">カレンダー空き枠設定</h1>
        <p className="text-slate-500 mt-1">日付ごとに「午前」「午後」の受付可否をタップで切り替えられます。</p>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))
            }
            className="p-3 rounded-full hover:bg-slate-100"
          >
            <ChevronLeft size={22} />
          </button>
          <p className="font-bold text-lg text-slate-700">{formatMonthLabel(cursor.year, cursor.month)}</p>
          <button
            onClick={() =>
              setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))
            }
            className="p-3 rounded-full hover:bg-slate-100"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {grid.map((cell, i) => {
            if (!cell.date) return <div key={i} />;
            const key = toDateKey(cell.date);
            const { am, pm } = getSlot(companyId, key);
            const isPast = cell.date < new Date(new Date().toDateString());
            return (
              <div key={i} className={`rounded-lg border border-slate-100 p-1 ${isPast ? "opacity-40" : ""}`}>
                <p className="text-center text-xs text-slate-500 mb-1">{cell.date.getDate()}</p>
                <button
                  disabled={isPast}
                  onClick={() => toggleSlot(companyId, key, "am_available")}
                  className={`w-full flex items-center justify-center gap-0.5 rounded py-1.5 mb-1 text-[11px] font-bold ${
                    am ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400 line-through"
                  }`}
                >
                  <Sun size={12} /> 午前
                </button>
                <button
                  disabled={isPast}
                  onClick={() => toggleSlot(companyId, key, "pm_available")}
                  className={`w-full flex items-center justify-center gap-0.5 rounded py-1.5 text-[11px] font-bold ${
                    pm ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400 line-through"
                  }`}
                >
                  <Moon size={12} /> 午後
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand-100 inline-block" />受付可</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-100 inline-block" />受付不可</span>
        </div>
      </div>
    </div>
  );
}
