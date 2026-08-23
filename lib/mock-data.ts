import {
  Company,
  HouseMaker,
  Partner,
  AvailabilitySlot,
  CompanyAffiliation,
  ServiceRequest,
} from "./types";

// ------------------------------------------------------------
// このアプリはSupabase等の外部DBに接続せず、すべてブラウザのメモリ上
// （Reactの状態）でデータを保持するモック版です。
// ページを再読み込みすると内容は初期状態にリセットされます。
// ------------------------------------------------------------

export interface MockAccount {
  id: string;
  email: string;
  password: string;
  type: "company" | "house_maker";
  refId: string; // companyId または houseMakerId
  fullName: string;
}

export const initialCompanies: Company[] = [
  {
    id: "c1",
    name: "サンプル住設アフターサービス株式会社",
    slug: "sample-after",
    phone: "03-1234-5678",
    address: "東京都渋谷区1-1-1",
  },
];

export const initialHouseMakers: HouseMaker[] = [
  {
    id: "hm1",
    name: "サンプルハウスメーカー株式会社",
    slug: "sample-housemaker",
    created_at: new Date().toISOString(),
  },
  {
    id: "hm2",
    name: "みらい住宅株式会社",
    slug: "mirai-jutaku",
    created_at: new Date().toISOString(),
  },
];

export const initialAccounts: MockAccount[] = [
  {
    id: "u1",
    email: "company@example.com",
    password: "password123",
    type: "company",
    refId: "c1",
    fullName: "山田 太郎",
  },
  {
    id: "u2",
    email: "maker@example.com",
    password: "password123",
    type: "house_maker",
    refId: "hm1",
    fullName: "鈴木 花子",
  },
];

export const initialPartners: Partner[] = [
  {
    id: "p1",
    company_id: "c1",
    name: "サンプル工務店",
    contact_name: "佐藤 次郎",
    contact_phone: "03-9999-0000",
    share_token: "token-p1",
    created_at: new Date().toISOString(),
  },
];

export const initialAvailabilitySlots: Record<string, AvailabilitySlot> = {};

export const initialAffiliations: CompanyAffiliation[] = [
  {
    id: "af1",
    company_id: "c1",
    house_maker_id: "hm1",
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "af2",
    company_id: "c1",
    house_maker_id: "hm2",
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const initialRequests: ServiceRequest[] = [
  {
    id: "r1",
    company_id: "c1",
    partner_id: null,
    house_maker_id: null,
    source: "homeowner",
    tracking_code: "DEMO0001",
    customer_name: "田中 一郎",
    customer_phone: "090-1111-2222",
    customer_address: "東京都世田谷区2-2-2",
    request_category: "給湯器の不具合",
    description: "お湯が出なくなりました。型番はRUX-A1616W-Eです。",
    photo_urls: [],
    preferred_date: daysFromNow(3),
    preferred_slot: "am",
    status: "new",
    staff_note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "r2",
    company_id: "c1",
    partner_id: "p1",
    house_maker_id: null,
    source: "partner",
    tracking_code: "DEMO0002",
    customer_name: "鈴木 幸子",
    customer_phone: "090-3333-4444",
    customer_address: "東京都目黒区3-3-3",
    request_category: "水回り（キッチン・浴室・トイレ）",
    description: "キッチンの排水がつまり気味です。",
    photo_urls: [],
    preferred_date: daysFromNow(5),
    preferred_slot: "pm",
    status: "confirmed",
    staff_note: "訪問日程を電話で確認済み",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "r3",
    company_id: "c1",
    partner_id: null,
    house_maker_id: "hm1",
    source: "house_maker",
    tracking_code: "DEMO0003",
    customer_name: "高橋 美咲",
    customer_phone: "090-5555-6666",
    customer_address: "東京都杉並区4-4-4",
    request_category: "建具・ドア・窓の不具合",
    description: "玄関ドアの鍵の調子が悪いです。",
    photo_urls: [],
    preferred_date: null,
    preferred_slot: null,
    status: "completed",
    staff_note: "調整対応完了",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
