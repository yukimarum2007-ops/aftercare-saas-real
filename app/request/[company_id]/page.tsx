"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { CATEGORY_OPTIONS, PreferredSlot, AM_TIME_OPTIONS, PM_TIME_OPTIONS } from "@/lib/types";
import { toDateKey, WEEKDAY_LABELS } from "@/lib/date";
import { Camera, ImagePlus, X, Loader2, CheckCircle2, Sun, Moon } from "lucide-react";
import Link from "next/link";

export default function PublicRequestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = params.company_id as string;
  const partnerId = searchParams.get("partner");

  const { companies, getSlot, submitPublicRequest } = useStore();
  const company = companies.find((c) => c.id === companyId) ?? null;

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [preferredDate, setPreferredDate] = useState<string>("");
  const [preferredSlot, setPreferredSlot] = useState<PreferredSlot | "">("");
  const [preferredTime, setPreferredTime] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  // 今日から14日分の候補日を生成（会社が「不可」に設定した枠は除外。未設定は「可」扱い）
  const candidateDays = useMemo(() => {
    const days: { key: string; label: string; am: boolean; pm: boolean }[] = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const key = toDateKey(d);
      const { am, pm } = getSlot(companyId, key);
      if (!am && !pm) continue;
      days.push({ key, label: `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAY_LABELS[d.getDay()]}）`, am, pm });
    }
    return days;
  }, [companyId, getSlot]);

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const arr = Array.from(newFiles).slice(0, 5 - files.length);
    setFiles((prev) => [...prev, ...arr]);
    setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!customerName || !phone || !address) {
      setError("お名前・電話番号・住所を入力してください。");
      return;
    }
    setSubmitting(true);

    // モック版のため写真はアップロードせず、ブラウザ内のプレビューURLをそのまま利用します
    const result = submitPublicRequest({
      companyId,
      partnerId,
      customerName,
      customerPhone: phone,
      customerAddress: address,
      requestCategory: category,
      description,
      photoUrls: previews,
      preferredDate: preferredDate || null,
      preferredSlot: preferredSlot || null,
      preferredTime: preferredTime || null,
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.message ?? "送信に失敗しました。");
      return;
    }
    setTrackingCode(result.trackingCode ?? null);
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <p className="text-slate-500">指定されたページが見つかりませんでした。URLをご確認ください。</p>
      </div>
    );
  }

  if (trackingCode) {
    return (
      <div className="min-h-screen warm-bg flex items-center justify-center px-6">
        <div className="max-w-sm w-full card p-8 text-center space-y-5">
          <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
          <div>
            <h1 className="text-xl font-bold text-slate-800">受付が完了しました</h1>
            <p className="text-slate-500 mt-2">担当者よりご連絡いたします。今しばらくお待ちください。</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400">受付ID（お問い合わせの際にお伝えください）</p>
            <p className="text-2xl font-bold tracking-widest text-brand-700 mt-1">{trackingCode}</p>
          </div>
          <Link href={`/status/${trackingCode}`} className="btn-primary w-full">
            対応状況を確認する
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen warm-bg px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-brand-600">{company.name}</p>
          <h1 className="text-2xl font-bold text-slate-800">アフターサービス受付フォーム</h1>
          <p className="text-slate-500 text-sm">必要事項をご入力の上、送信してください</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-5 md:p-6 space-y-5">
          <div>
            <label className="label-lg">お名前</label>
            <input className="input-lg" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>
          <div>
            <label className="label-lg">電話番号</label>
            <input
              type="tel"
              className="input-lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090-1234-5678"
              required
            />
          </div>
          <div>
            <label className="label-lg">ご住所</label>
            <input className="input-lg" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>

          <div>
            <label className="label-lg">依頼内容</label>
            <select className="input-lg" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <textarea
              className="input-lg mt-2"
              rows={3}
              placeholder="型番や症状など、詳しい状況をご記入ください"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="label-lg">型番・状況の写真（最大5枚）</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={src} className="w-full h-full object-cover rounded-lg border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 bg-white rounded-full shadow border border-slate-200 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            {files.length < 5 && (
              <div className="grid grid-cols-2 gap-3">
                <label className="btn-secondary !py-6 cursor-pointer">
                  <Camera size={22} />
                  写真を撮る
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                </label>
                <label className="btn-secondary !py-6 cursor-pointer">
                  <ImagePlus size={22} />
                  写真を選ぶ
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="label-lg">ご希望の訪問日時</label>
            {candidateDays.length === 0 && (
              <p className="text-sm text-slate-400">現在、選択可能な日程がありません。担当者からのご連絡をお待ちください。</p>
            )}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {candidateDays.map((day) => (
                <div key={day.key} className="flex items-center gap-2">
                  <span className="w-28 text-sm font-bold text-slate-600 shrink-0">{day.label}</span>
                  <button
                    type="button"
                    disabled={!day.am}
                    onClick={() => {
                      setPreferredDate(day.key);
                      setPreferredSlot("am");
                      setPreferredTime("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2.5 text-sm font-bold border-2 disabled:opacity-30 ${
                      preferredDate === day.key && preferredSlot === "am"
                        ? "bg-brand-600 text-white border-brand-600"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <Sun size={16} /> 午前
                  </button>
                  <button
                    type="button"
                    disabled={!day.pm}
                    onClick={() => {
                      setPreferredDate(day.key);
                      setPreferredSlot("pm");
                      setPreferredTime("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2.5 text-sm font-bold border-2 disabled:opacity-30 ${
                      preferredDate === day.key && preferredSlot === "pm"
                        ? "bg-brand-600 text-white border-brand-600"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <Moon size={16} /> 午後
                  </button>
                </div>
              ))}
            </div>

            {preferredDate && preferredSlot && (
              <div className="mt-3">
                <label className="label-lg">ご希望のお時間</label>
                <div className="grid grid-cols-3 gap-2">
                  {(preferredSlot === "am" ? AM_TIME_OPTIONS : PM_TIME_OPTIONS).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPreferredTime(t)}
                      className={`rounded-lg py-2.5 text-sm font-bold border-2 ${
                        preferredTime === t
                          ? "bg-brand-600 text-white border-brand-600"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 className="animate-spin" size={22} /> : null}
            この内容で送信する
          </button>
        </form>
      </div>
    </div>
  );
}
