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
  status: RequestStatus;
  staff_note: string | null;
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
  house_maker: "ハウスメーカー経由",
  partner: "工務店経由",
};

export const STATUS_COLOR: Record<RequestStatus, string> = {
  new: "bg-amber-100 text-amber-800 border-amber-300",
  confirmed: "bg-brand-100 text-brand-800 border-brand-300",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export type AffiliationStatus = "pending" | "approved" | "rejected";

export interface HouseMaker {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface CompanyAffiliation {
  id: string;
  company_id: string;
  house_maker_id: string;
  status: AffiliationStatus;
  created_at: string;
  updated_at: string;
  companies?: { name: string };
  house_makers?: { name: string };
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
