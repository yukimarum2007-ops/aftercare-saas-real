"use client";

import { useState } from "react";
import { X, Phone, MapPin, Calendar, User2, Tag, MessageSquare } from "lucide-react";
import { useStore } from "@/lib/store";
import { ServiceRequest, RequestStatus, STATUS_LABEL, SOURCE_LABEL } from "@/lib/types";
import StatusBadge from "./StatusBadge";

export default function RequestModal({
  request,
  onClose,
}: {
  request: ServiceRequest;
  onClose: () => void;
}) {
  const { updateRequestStatus } = useStore();
  const [note, setNote] = useState(request.staff_note ?? "");

  function changeStatus(status: RequestStatus) {
    updateRequestStatus(request.id, status, note);
  }

  function saveNote() {
    updateRequestStatus(request.id, request.status, note);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">案件詳細</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700" aria-label="閉じる">
            <X size={24} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <StatusBadge status={request.status} />
            <span className="text-xs text-slate-400">受付ID: {request.tracking_code}</span>
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
            経路: {SOURCE_LABEL[request.source]}
          </span>

          <div className="space-y-3 text-slate-700">
            <div className="flex items-start gap-3">
              <User2 size={20} className="text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">お客様名</p>
                <p className="font-bold">{request.customer_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={20} className="text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">連絡先</p>
                <a href={`tel:${request.customer_phone}`} className="font-bold underline">
                  {request.customer_phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">住所</p>
                <p className="font-bold">{request.customer_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Tag size={20} className="text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">依頼内容</p>
                <p className="font-bold">{request.request_category}</p>
                {request.description && (
                  <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{request.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">希望日時</p>
                <p className="font-bold">
                  {request.preferred_date ?? "未指定"}{" "}
                  {request.preferred_slot === "am" ? "午前" : request.preferred_slot === "pm" ? "午後" : ""}
                  {request.preferred_time ? ` ${request.preferred_time}〜` : ""}
                </p>
              </div>
            </div>
          </div>

          {request.photo_urls?.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">添付写真</p>
              <div className="grid grid-cols-3 gap-2">
                {request.photo_urls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="現場写真" className="rounded-lg object-cover w-full h-24 border border-slate-200" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <MessageSquare size={16} /> 社内メモ
            </label>
            <textarea
              className="input-lg text-base"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={saveNote}
              placeholder="対応履歴や引継ぎ事項を記入"
            />
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2">ステータス変更</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
                <button
                  key={s}
                  disabled={request.status === s}
                  onClick={() => changeStatus(s)}
                  className={`rounded-xl py-3 font-bold text-sm border-2 transition ${
                    request.status === s
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-400"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
