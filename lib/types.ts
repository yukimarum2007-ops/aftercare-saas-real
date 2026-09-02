export type RequestStatus = "new" | "confirmed" | "completed";
export type PreferredSlot = "am" | "pm";
export type RequestSource = "homeowner" | "house_maker" | "partner";

export interface Company {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
}

export interface Partner {
  id: string;
  company_id: string;
  name: string;
  contact_name: string | null;
  contact_phone: string | null;
  share_token: string;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  company_id: string;
  slot_date: string;
  am_available: boolean;
  pm_available: boolean;
}

export interface ServiceRequest {
  id: string;
  company_id: string;
  partner_id: string | null;
  house_maker_id: string | null;
  source: RequestSource;
  tracking_code: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  request_category: string;
  description: string | null;
  photo_urls: string[];
  preferred_date: string | null;
  preferred_slot: PreferredSlot | null;
  preferred_time: string | null;
  status: RequestStatus;
  staff_note: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
  partners?: { name: string } | null;
  house_makers?: { name: string } | null;
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "新規受付",
  confirmed: "日程確定",
  completed: "対応完了",
};

export const SOURCE_LABEL: Record<RequestSource, string> = {
  homeowner: "施主直接",
  house_maker: "ハウスメーカー・工務店経由",
  partner: "工務店経由",
};

export const STATUS_COLOR: Record<RequestStatus, string> = {
  new: "bg-amber-100 text-amber-800 border-amber-300",
  confirmed: "bg-brand-100 text-brand-800 border-brand-300",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export type AffiliationStatus = "pending" | "approved" | "rejected";

// ハウスメーカーと工務店は、アフター会社から見ると「連携先」として同じ立場・
// 同じ機能（提携申請の承認、案件の代理登録、施主様との連携）を持つため、
// 同一のテーブル（house_makers）を共有し、builder_type で表示上の種別のみ分ける。
export type BuilderType = "house_maker" | "contractor";

export const BUILDER_TYPE_LABEL: Record<BuilderType, string> = {
  house_maker: "ハウスメーカー",
  contractor: "工務店",
};

export interface HouseMaker {
  id: string;
  name: string;
  slug: string;
  builder_type: BuilderType;
  phone: string | null;
  created_at: string;
}

export type AffiliationRequester = "company" | "house_maker";

export interface CompanyAffiliation {
  id: string;
  company_id: string;
  house_maker_id: string;
  status: AffiliationStatus;
  requested_by: AffiliationRequester; // どちらが提携を申請したか（申請していない側が承認する）
  created_at: string;
  updated_at: string;
  companies?: { name: string };
  house_makers?: { name: string; builder_type?: BuilderType };
}

export const AFFILIATION_STATUS_LABEL: Record<AffiliationStatus, string> = {
  pending: "承認待ち",
  approved: "承認済み",
  rejected: "却下",
};

export const AFFILIATION_STATUS_COLOR: Record<AffiliationStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
  rejected: "bg-slate-100 text-slate-500 border-slate-300",
};

export const CATEGORY_OPTIONS = [
  "給湯器の不具合",
  "水回り（キッチン・浴室・トイレ）",
  "建具・ドア・窓の不具合",
  "外壁・屋根",
  "電気設備",
  "その他",
];

// 午前(9:00-12:00) / 午後(13:00-16:00) の30分刻み時間選択肢
export const AM_TIME_OPTIONS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
export const PM_TIME_OPTIONS = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30"];

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  created_at: string;
}

// 施主 ⇔ アフター会社 / ハウスメーカー・工務店 の連携申請
// どちらの側からでも申請でき（requested_by）、申請していない側が承認する。
export type OrgType = "company" | "house_maker";
export type LinkRequester = "customer" | "org";

export interface CustomerOrgLink {
  id: string;
  customer_id: string;
  org_type: OrgType;
  org_id: string;
  status: AffiliationStatus;
  requested_by: LinkRequester;
  created_at: string;
  updated_at: string;
  customers?: { name: string; phone?: string };
  companies?: { name: string };
  house_makers?: { name: string; builder_type?: BuilderType };
}

// 予約(依頼)完了時に、関係する3者（施主・アフター会社・ハウスメーカー/工務店）の
// 登録メールアドレス宛に送られる通知。実際のメール送信は行わず、各アカウントの
// 「通知」画面で確認できるモック実装。
export interface NotificationRecord {
  id: string;
  email: string;
  recipient_label: string; // "施主様" / "アフター会社" / "ハウスメーカー" / "工務店"
  subject: string;
  body: string;
  request_id: string;
  created_at: string;
}
