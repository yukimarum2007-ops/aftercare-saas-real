"use client";

import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Package, CalendarCheck2, CheckCircle2 } from "lucide-react";
import { RequestStatus } from "@/lib/types";

const STEPS: { key: RequestStatus; label: string; icon: any }[] = [
  { key: "new", label: "手配中", icon: Package },
  { key: "confirmed", label: "日程確定", icon: CalendarCheck2 },
  { key: "completed", label: "対応完了", icon: CheckCircle2 },
];

export default function StatusResultPage() {
  const params = useParams();
  const code = params.code as string;
  const { getRequestByTrackingCode, companies } = useStore();

  const result = getRequestByTrackingCode(code);
  const company = result ? companies.find((c) => c.id === result.company_id) : null;
  const currentStepIndex = result ? STEPS.findIndex((s) => s.key === result.status) : -1;

  if (!result) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center px-6 text-center">
        <div className="max-w-sm w-full card p-8">
          <p className="text-slate-600 font-bold">該当する受付情報が見つかりませんでした。</p>
          <p className="text-slate-400 text-sm mt-2">受付IDをご確認の上、再度お試しください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full card p-8 space-y-8">
        <div className="text-center space-y-1">
          <p className="text-sm text-slate-400">{company?.name}</p>
          <h1 className="text-lg font-bold text-slate-800">受付ID: {result.tracking_code}</h1>
        </div>

        <div className="space-y-0">
          {STEPS.map((step, i) => {
            const done = i <= currentStepIndex;
            const isLast = i === STEPS.length - 1;
            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full p-3 ${
                      done ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-300"
                    }`}
                  >
                    <step.icon size={22} />
                  </div>
                  {!isLast && <div className={`w-0.5 flex-1 my-1 ${i < currentStepIndex ? "bg-brand-600" : "bg-slate-200"}`} />}
                </div>
                <div className="pb-8">
                  <p className={`font-bold ${done ? "text-slate-800" : "text-slate-300"}`}>{step.label}</p>
                  {step.key === "confirmed" && result.preferred_date && done && (
                    <p className="text-sm text-slate-500 mt-1">
                      {result.preferred_date} {result.preferred_slot === "am" ? "午前" : "午後"}
                      {result.preferred_time ? ` ${result.preferred_time}〜` : ""} 訪問予定
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
