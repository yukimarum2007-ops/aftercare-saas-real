"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Mail, Bell } from "lucide-react";

export default function NotificationsList({ email }: { email: string | undefined }) {
  const { notifications } = useStore();

  const myNotifications = useMemo(
    () =>
      notifications
        .filter((n) => n.email === email)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [notifications, email]
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Bell size={24} />
          通知
        </h1>
        <p className="text-slate-500 mt-1">
          予約(依頼)完了時のお知らせをここで確認できます。実際のメール送信は行わないデモ表示です。
        </p>
      </div>

      <div className="space-y-3">
        {myNotifications.length === 0 && (
          <div className="empty-state">
            <Mail size={28} className="text-slate-300" />
            通知はまだありません
          </div>
        )}
        {myNotifications.map((n) => (
          <div key={n.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600 shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800">{n.subject}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    宛先: {n.email}（{n.recipient_label}）
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 shrink-0">
                {new Date(n.created_at).toLocaleString("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
