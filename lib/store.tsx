"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  Company,
  HouseMaker,
  Partner,
  AvailabilitySlot,
  CompanyAffiliation,
  ServiceRequest,
  RequestStatus,
  AffiliationStatus,
  AffiliationRequester,
  RequestSource,
  Customer,
  CustomerOrgLink,
  OrgType,
  BuilderType,
  BUILDER_TYPE_LABEL,
  NotificationRecord,
} from "./types";
import {
  MockAccount,
  MockCustomerAccount,
  initialCompanies,
  initialHouseMakers,
  initialAccounts,
  initialPartners,
  initialAvailabilitySlots,
  initialAffiliations,
  initialRequests,
  initialCustomers,
  initialCustomerAccounts,
  initialCustomerOrgLinks,
  initialNotifications,
} from "./mock-data";

// ------------------------------------------------------------
// このアプリはSupabase等の外部バックエンドを一切使用しません。
// すべてのデータはブラウザのメモリ（Reactの状態）で管理される
// モック（ダミー）データです。ページを再読み込みすると初期状態に
// 戻ります。本番のデータベースに接続する際は、この store.tsx の
// 各関数を実際のAPI呼び出しに置き換えてください。
//
// ハウスメーカーと工務店は、アフター会社・居住者様どちらから見ても
// 「連携先」として同じ立場・同じ機能を持つため、house_maker という
// 型名/アカウント種別を共有し、HouseMaker.builder_type で表示上の
// 種別（ハウスメーカー / 工務店）のみを分けています。
// ------------------------------------------------------------

type CurrentUser =
  | { type: "company"; companyId: string; fullName: string }
  | { type: "house_maker"; houseMakerId: string; fullName: string }
  | { type: "customer"; customerId: string; fullName: string }
  | null;

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "org"
  ) + "-" + Math.random().toString(36).slice(2, 8);
}

function trackingCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

interface StoreState {
  currentUser: CurrentUser;
  companies: Company[];
  houseMakers: HouseMaker[];
  accounts: MockAccount[];
  partners: Partner[];
  availabilitySlots: Record<string, AvailabilitySlot>;
  affiliations: CompanyAffiliation[];
  requests: ServiceRequest[];
  customers: Customer[];
  customerOrgLinks: CustomerOrgLink[];
  notifications: NotificationRecord[];

  login: (email: string, password: string) => { ok: boolean; message?: string; redirectTo?: string };
  logout: () => void;

  signupCompany: (input: {
    companyName: string;
    fullName: string;
    email: string;
    password: string;
    houseMakerId: string;
  }) => { ok: boolean; message?: string };

  signupHouseMaker: (input: {
    orgName: string;
    fullName: string;
    email: string;
    password: string;
    builderType: BuilderType;
    companyId?: string; // 空文字/未指定なら提携申請なし
  }) => { ok: boolean; message?: string };

  signupCustomer: (input: {
    name: string;
    phone: string;
    address: string;
    email: string;
    password: string;
    companyId?: string; // 空文字/未指定なら「連携なし」
    houseMakerId?: string; // 空文字/未指定なら「連携なし」
  }) => { ok: boolean; message?: string };

  updateCustomerProfile: (input: {
    name: string;
    phone: string;
    address: string;
    email: string;
    newPassword?: string;
  }) => { ok: boolean; message?: string };

  updateCompanyProfile: (input: {
    companyName: string;
    phone: string;
    address: string;
    fullName: string;
    email: string;
    newPassword?: string;
  }) => { ok: boolean; message?: string };

  updateHouseMakerProfile: (input: {
    orgName: string;
    phone: string;
    fullName: string;
    email: string;
    newPassword?: string;
  }) => { ok: boolean; message?: string };

  addPartner: (input: { name: string; contactName: string; contactPhone: string }) => Partner | null;
  toggleSlot: (companyId: string, dateKey: string, field: "am_available" | "pm_available") => void;
  getSlot: (companyId: string, dateKey: string) => { am: boolean; pm: boolean };

  submitPublicRequest: (input: {
    companyId: string;
    partnerId?: string | null;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    requestCategory: string;
    description: string;
    photoUrls: string[];
    preferredDate: string | null;
    preferredSlot: "am" | "pm" | null;
    preferredTime?: string | null;
  }) => { ok: boolean; trackingCode?: string; message?: string };

  submitHouseMakerRequest: (input: {
    companyId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    requestCategory: string;
    description: string;
    photoUrls: string[];
    preferredDate: string | null;
    preferredSlot: "am" | "pm" | null;
    preferredTime?: string | null;
  }) => { ok: boolean; trackingCode?: string; message?: string };

  submitCustomerRequest: (input: {
    companyId: string;
    requestCategory: string;
    description: string;
    photoUrls: string[];
    preferredDate: string | null;
    preferredSlot: "am" | "pm" | null;
    preferredTime?: string | null;
  }) => { ok: boolean; trackingCode?: string; message?: string };

  updateRequestStatus: (requestId: string, status: RequestStatus, note: string) => void;

  // アフター会社 ⇔ ハウスメーカー/工務店 の提携申請
  // targetId には「相手側」のID（自分が会社なら houseMakerId、自分がハウスメーカー/
  // 工務店なら companyId）を渡す。どちらからでも申請でき、申請していない側が承認する。
  requestAffiliation: (targetId: string) => { ok: boolean; message?: string };
  updateAffiliationStatus: (affiliationId: string, status: AffiliationStatus) => void;
  // 提携の解除・申請の取り消し（承認済み/申請中どちらの状態でも、どちらの側からでも削除できる）
  removeAffiliation: (affiliationId: string) => void;

  // 居住者様 ⇔ アフター会社/ハウスメーカー・工務店 の連携
  // 会社・ハウスメーカー/工務店側が電話番号で居住者様を検索して招待する
  inviteCustomerByPhone: (phone: string) => { ok: boolean; message?: string };
  // 居住者様側が自分で連携申請を送る（新規登録後、マイページからいつでも）
  requestCustomerOrgLink: (orgType: OrgType, orgId: string) => { ok: boolean; message?: string };
  // 申請されていない側が承認/却下する
  updateCustomerOrgLinkStatus: (linkId: string, status: AffiliationStatus) => void;
  // 連携の解除（承認済み/申請中どちらの状態でも、居住者様・会社・ハウスメーカー/工務店の
  // どちらからでも削除できる）
  removeCustomerOrgLink: (linkId: string) => void;

  getRequestByTrackingCode: (code: string) => ServiceRequest | null;
}

const StoreContext = createContext<StoreState | null>(null);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [houseMakers, setHouseMakers] = useState<HouseMaker[]>(initialHouseMakers);
  const [accounts, setAccounts] = useState<MockAccount[]>(initialAccounts);
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [availabilitySlots, setAvailabilitySlots] = useState<Record<string, AvailabilitySlot>>(
    initialAvailabilitySlots
  );
  const [affiliations, setAffiliations] = useState<CompanyAffiliation[]>(initialAffiliations);
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [customerAccounts, setCustomerAccounts] = useState<MockCustomerAccount[]>(initialCustomerAccounts);
  const [customerOrgLinks, setCustomerOrgLinks] = useState<CustomerOrgLink[]>(initialCustomerOrgLinks);
  const [notifications, setNotifications] = useState<NotificationRecord[]>(initialNotifications);

  const login = useCallback(
    (email: string, password: string) => {
      const account = accounts.find((a) => a.email === email && a.password === password);
      if (account) {
        if (account.type === "company") {
          setCurrentUser({ type: "company", companyId: account.refId, fullName: account.fullName });
          return { ok: true, redirectTo: "/dashboard" };
        }
        setCurrentUser({ type: "house_maker", houseMakerId: account.refId, fullName: account.fullName });
        return { ok: true, redirectTo: "/maker/dashboard" };
      }
      const customerAccount = customerAccounts.find((a) => a.email === email && a.password === password);
      if (customerAccount) {
        const customer = customers.find((c) => c.id === customerAccount.customerId);
        setCurrentUser({
          type: "customer",
          customerId: customerAccount.customerId,
          fullName: customer?.name ?? "",
        });
        return { ok: true, redirectTo: "/customer/dashboard" };
      }
      return { ok: false, message: "メールアドレスまたはパスワードが正しくありません。" };
    },
    [accounts, customerAccounts, customers]
  );

  const logout = useCallback(() => setCurrentUser(null), []);

  const signupCompany = useCallback<StoreState["signupCompany"]>(
    (input) => {
      if (accounts.some((a) => a.email === input.email)) {
        return { ok: false, message: "このメールアドレスは既に登録されています。" };
      }
      const companyId = randomId("c");
      const newCompany: Company = {
        id: companyId,
        name: input.companyName,
        slug: slugify(input.companyName),
        phone: null,
        address: null,
      };
      const newAccount: MockAccount = {
        id: randomId("u"),
        email: input.email,
        password: input.password,
        type: "company",
        refId: companyId,
        fullName: input.fullName,
      };
      const newAffiliation: CompanyAffiliation = {
        id: randomId("af"),
        company_id: companyId,
        house_maker_id: input.houseMakerId,
        status: "pending",
        requested_by: "company",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCompanies((prev) => [...prev, newCompany]);
      setAccounts((prev) => [...prev, newAccount]);
      setAffiliations((prev) => [...prev, newAffiliation]);
      return { ok: true };
    },
    [accounts]
  );

  const signupHouseMaker = useCallback<StoreState["signupHouseMaker"]>(
    (input) => {
      if (accounts.some((a) => a.email === input.email)) {
        return { ok: false, message: "このメールアドレスは既に登録されています。" };
      }
      const houseMakerId = randomId("hm");
      const newHouseMaker: HouseMaker = {
        id: houseMakerId,
        name: input.orgName,
        slug: slugify(input.orgName),
        builder_type: input.builderType,
        phone: null,
        created_at: new Date().toISOString(),
      };
      const newAccount: MockAccount = {
        id: randomId("u"),
        email: input.email,
        password: input.password,
        type: "house_maker",
        refId: houseMakerId,
        fullName: input.fullName,
      };
      setHouseMakers((prev) => [...prev, newHouseMaker]);
      setAccounts((prev) => [...prev, newAccount]);

      if (input.companyId) {
        const newAffiliation: CompanyAffiliation = {
          id: randomId("af"),
          company_id: input.companyId,
          house_maker_id: houseMakerId,
          status: "pending",
          requested_by: "house_maker",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setAffiliations((prev) => [...prev, newAffiliation]);
      }
      return { ok: true };
    },
    [accounts]
  );

  const signupCustomer = useCallback<StoreState["signupCustomer"]>(
    (input) => {
      if (customerAccounts.some((a) => a.email === input.email)) {
        return { ok: false, message: "このメールアドレスは既に登録されています。" };
      }
      const customerId = randomId("cu");
      const newCustomer: Customer = {
        id: customerId,
        name: input.name,
        phone: input.phone,
        address: input.address,
        email: input.email,
        created_at: new Date().toISOString(),
      };
      const newAccount: MockCustomerAccount = {
        id: randomId("cua"),
        email: input.email,
        password: input.password,
        customerId,
      };
      setCustomers((prev) => [...prev, newCustomer]);
      setCustomerAccounts((prev) => [...prev, newAccount]);

      const newLinks: CustomerOrgLink[] = [];
      if (input.companyId) {
        newLinks.push({
          id: randomId("col"),
          customer_id: customerId,
          org_type: "company",
          org_id: input.companyId,
          status: "pending",
          requested_by: "customer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      if (input.houseMakerId) {
        newLinks.push({
          id: randomId("col"),
          customer_id: customerId,
          org_type: "house_maker",
          org_id: input.houseMakerId,
          status: "pending",
          requested_by: "customer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      if (newLinks.length > 0) {
        setCustomerOrgLinks((prev) => [...prev, ...newLinks]);
      }
      return { ok: true };
    },
    [customerAccounts]
  );

  const updateCustomerProfile = useCallback<StoreState["updateCustomerProfile"]>(
    (input) => {
      if (!currentUser || currentUser.type !== "customer") {
        return { ok: false, message: "ログインが必要です。" };
      }
      const emailTaken = customerAccounts.some(
        (a) => a.email === input.email && a.customerId !== currentUser.customerId
      );
      if (emailTaken) {
        return { ok: false, message: "このメールアドレスは既に使用されています。" };
      }
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === currentUser.customerId
            ? { ...c, name: input.name, phone: input.phone, address: input.address, email: input.email }
            : c
        )
      );
      setCustomerAccounts((prev) =>
        prev.map((a) =>
          a.customerId === currentUser.customerId
            ? { ...a, email: input.email, password: input.newPassword ? input.newPassword : a.password }
            : a
        )
      );
      setCurrentUser((prev) => (prev && prev.type === "customer" ? { ...prev, fullName: input.name } : prev));
      return { ok: true };
    },
    [currentUser, customerAccounts]
  );

  const updateCompanyProfile = useCallback<StoreState["updateCompanyProfile"]>(
    (input) => {
      if (!currentUser || currentUser.type !== "company") {
        return { ok: false, message: "ログインが必要です。" };
      }
      const emailTaken = accounts.some((a) => a.email === input.email && a.refId !== currentUser.companyId);
      if (emailTaken) {
        return { ok: false, message: "このメールアドレスは既に使用されています。" };
      }
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === currentUser.companyId
            ? { ...c, name: input.companyName, phone: input.phone || null, address: input.address || null }
            : c
        )
      );
      setAccounts((prev) =>
        prev.map((a) =>
          a.type === "company" && a.refId === currentUser.companyId
            ? {
                ...a,
                email: input.email,
                fullName: input.fullName,
                password: input.newPassword ? input.newPassword : a.password,
              }
            : a
        )
      );
      return { ok: true };
    },
    [currentUser, accounts]
  );

  const updateHouseMakerProfile = useCallback<StoreState["updateHouseMakerProfile"]>(
    (input) => {
      if (!currentUser || currentUser.type !== "house_maker") {
        return { ok: false, message: "ログインが必要です。" };
      }
      const emailTaken = accounts.some((a) => a.email === input.email && a.refId !== currentUser.houseMakerId);
      if (emailTaken) {
        return { ok: false, message: "このメールアドレスは既に使用されています。" };
      }
      setHouseMakers((prev) =>
        prev.map((hm) =>
          hm.id === currentUser.houseMakerId ? { ...hm, name: input.orgName, phone: input.phone || null } : hm
        )
      );
      setAccounts((prev) =>
        prev.map((a) =>
          a.type === "house_maker" && a.refId === currentUser.houseMakerId
            ? {
                ...a,
                email: input.email,
                fullName: input.fullName,
                password: input.newPassword ? input.newPassword : a.password,
              }
            : a
        )
      );
      setCurrentUser((prev) => (prev && prev.type === "house_maker" ? { ...prev, fullName: input.fullName } : prev));
      return { ok: true };
    },
    [currentUser, accounts]
  );

  const addPartner = useCallback(
    (input: { name: string; contactName: string; contactPhone: string }) => {
      if (!currentUser || currentUser.type !== "company") return null;
      const newPartner: Partner = {
        id: randomId("p"),
        company_id: currentUser.companyId,
        name: input.name,
        contact_name: input.contactName || null,
        contact_phone: input.contactPhone || null,
        share_token: randomId("token"),
        created_at: new Date().toISOString(),
      };
      setPartners((prev) => [newPartner, ...prev]);
      return newPartner;
    },
    [currentUser]
  );

  const toggleSlot = useCallback(
    (companyId: string, dateKey: string, field: "am_available" | "pm_available") => {
      setAvailabilitySlots((prev) => {
        const key = `${companyId}__${dateKey}`;
        const current = prev[key];
        const am = current ? current.am_available : true;
        const pm = current ? current.pm_available : true;
        const next: AvailabilitySlot = {
          id: key,
          company_id: companyId,
          slot_date: dateKey,
          am_available: field === "am_available" ? !am : am,
          pm_available: field === "pm_available" ? !pm : pm,
        };
        return { ...prev, [key]: next };
      });
    },
    []
  );

  const getSlot = useCallback(
    (companyId: string, dateKey: string) => {
      const slot = availabilitySlots[`${companyId}__${dateKey}`];
      return { am: slot ? slot.am_available : true, pm: slot ? slot.pm_available : true };
    },
    [availabilitySlots]
  );

  const createRequest = useCallback(
    (input: {
      companyId: string;
      partnerId?: string | null;
      houseMakerId?: string | null;
      customerId?: string | null;
      source: RequestSource;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      requestCategory: string;
      description: string;
      photoUrls: string[];
      preferredDate: string | null;
      preferredSlot: "am" | "pm" | null;
      preferredTime?: string | null;
    }) => {
      const newRequest: ServiceRequest = {
        id: randomId("r"),
        company_id: input.companyId,
        partner_id: input.partnerId ?? null,
        house_maker_id: input.houseMakerId ?? null,
        customer_id: input.customerId ?? null,
        source: input.source,
        tracking_code: trackingCode(),
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        customer_address: input.customerAddress,
        request_category: input.requestCategory,
        description: input.description || null,
        photo_urls: input.photoUrls,
        preferred_date: input.preferredDate,
        preferred_slot: input.preferredSlot,
        preferred_time: input.preferredTime ?? null,
        status: "new",
        staff_note: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setRequests((prev) => [newRequest, ...prev]);
      return newRequest;
    },
    []
  );

  const notifyRequestCreated = useCallback(
    (request: ServiceRequest) => {
      const newNotifications: NotificationRecord[] = [];
      const dateLabel = request.preferred_date
        ? `${request.preferred_date}${request.preferred_slot === "am" ? " 午前" : request.preferred_slot === "pm" ? " 午後" : ""}${request.preferred_time ? ` ${request.preferred_time}〜` : ""}`
        : "未指定";

      const push = (email: string | undefined | null, label: string) => {
        if (!email) return;
        newNotifications.push({
          id: randomId("ntf"),
          email,
          recipient_label: label,
          subject: `【受付ID: ${request.tracking_code}】ご予約が完了しました`,
          body: `${request.customer_name} 様よりご依頼を受け付けました。\n依頼内容: ${request.request_category}\n希望日時: ${dateLabel}\n受付ID: ${request.tracking_code}`,
          request_id: request.id,
          created_at: new Date().toISOString(),
        });
      };

      // アフター会社
      const companyAccount = accounts.find((a) => a.type === "company" && a.refId === request.company_id);
      push(companyAccount?.email, "アフター会社");

      // 居住者様（アカウントを持っている場合のみ）
      if (request.customer_id) {
        const custAccount = customerAccounts.find((a) => a.customerId === request.customer_id);
        push(custAccount?.email, "居住者様");
      }

      // 案件を登録したハウスメーカー/工務店
      const notifiedHouseMakerIds = new Set<string>();
      if (request.house_maker_id) {
        const hmAccount = accounts.find((a) => a.type === "house_maker" && a.refId === request.house_maker_id);
        const hm = houseMakers.find((h) => h.id === request.house_maker_id);
        push(hmAccount?.email, hm ? BUILDER_TYPE_LABEL[hm.builder_type] : "ハウスメーカー・工務店");
        notifiedHouseMakerIds.add(request.house_maker_id);
      }

      // 居住者様が承認済みで連携しているハウスメーカー/工務店にもお知らせする
      if (request.customer_id) {
        customerOrgLinks
          .filter(
            (l) =>
              l.customer_id === request.customer_id &&
              l.org_type === "house_maker" &&
              l.status === "approved" &&
              !notifiedHouseMakerIds.has(l.org_id)
          )
          .forEach((l) => {
            const hmAccount = accounts.find((a) => a.type === "house_maker" && a.refId === l.org_id);
            const hm = houseMakers.find((h) => h.id === l.org_id);
            push(hmAccount?.email, hm ? BUILDER_TYPE_LABEL[hm.builder_type] : "ハウスメーカー・工務店");
            notifiedHouseMakerIds.add(l.org_id);
          });
      }

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...newNotifications, ...prev]);
      }
    },
    [accounts, customerAccounts, customerOrgLinks, houseMakers]
  );

  const submitPublicRequest = useCallback<StoreState["submitPublicRequest"]>(
    (input) => {
      const company = companies.find((c) => c.id === input.companyId);
      if (!company) return { ok: false, message: "会社が見つかりませんでした。" };
      const req = createRequest({
        companyId: input.companyId,
        partnerId: input.partnerId ?? null,
        houseMakerId: null,
        source: input.partnerId ? "partner" : "homeowner",
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        requestCategory: input.requestCategory,
        description: input.description,
        photoUrls: input.photoUrls,
        preferredDate: input.preferredDate,
        preferredSlot: input.preferredSlot,
        preferredTime: input.preferredTime,
      });
      notifyRequestCreated(req);
      return { ok: true, trackingCode: req.tracking_code };
    },
    [companies, createRequest, notifyRequestCreated]
  );

  const submitHouseMakerRequest = useCallback<StoreState["submitHouseMakerRequest"]>(
    (input) => {
      if (!currentUser || currentUser.type !== "house_maker") {
        return { ok: false, message: "ログインが必要です。" };
      }
      const approved = affiliations.some(
        (a) =>
          a.company_id === input.companyId &&
          a.house_maker_id === currentUser.houseMakerId &&
          a.status === "approved"
      );
      if (!approved) {
        return { ok: false, message: "このアフター会社との提携が承認されていません。" };
      }
      const req = createRequest({
        companyId: input.companyId,
        partnerId: null,
        houseMakerId: currentUser.houseMakerId,
        source: "house_maker",
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        requestCategory: input.requestCategory,
        description: input.description,
        photoUrls: input.photoUrls,
        preferredDate: input.preferredDate,
        preferredSlot: input.preferredSlot,
        preferredTime: input.preferredTime,
      });
      notifyRequestCreated(req);
      return { ok: true, trackingCode: req.tracking_code };
    },
    [currentUser, affiliations, createRequest, notifyRequestCreated]
  );

  const submitCustomerRequest = useCallback<StoreState["submitCustomerRequest"]>(
    (input) => {
      if (!currentUser || currentUser.type !== "customer") {
        return { ok: false, message: "ログインが必要です。" };
      }
      const company = companies.find((c) => c.id === input.companyId);
      if (!company) return { ok: false, message: "会社が見つかりませんでした。" };
      const customer = customers.find((c) => c.id === currentUser.customerId);
      if (!customer) return { ok: false, message: "アカウント情報が見つかりませんでした。" };
      const req = createRequest({
        companyId: input.companyId,
        partnerId: null,
        houseMakerId: null,
        customerId: currentUser.customerId,
        source: "homeowner",
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        requestCategory: input.requestCategory,
        description: input.description,
        photoUrls: input.photoUrls,
        preferredDate: input.preferredDate,
        preferredSlot: input.preferredSlot,
        preferredTime: input.preferredTime,
      });
      notifyRequestCreated(req);
      return { ok: true, trackingCode: req.tracking_code };
    },
    [currentUser, companies, customers, createRequest, notifyRequestCreated]
  );

  const updateRequestStatus = useCallback((requestId: string, status: RequestStatus, note: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status, staff_note: note, updated_at: new Date().toISOString() } : r
      )
    );
  }, []);

  const requestAffiliation = useCallback<StoreState["requestAffiliation"]>(
    (targetId) => {
      if (!currentUser) return { ok: false, message: "ログインが必要です。" };
      let companyId: string;
      let houseMakerId: string;
      let requestedBy: AffiliationRequester;
      if (currentUser.type === "company") {
        companyId = currentUser.companyId;
        houseMakerId = targetId;
        requestedBy = "company";
      } else if (currentUser.type === "house_maker") {
        houseMakerId = currentUser.houseMakerId;
        companyId = targetId;
        requestedBy = "house_maker";
      } else {
        return { ok: false, message: "この操作を行う権限がありません。" };
      }

      const existing = affiliations.find((a) => a.company_id === companyId && a.house_maker_id === houseMakerId);
      if (existing) {
        if (existing.status === "approved") return { ok: false, message: "すでに提携済みです。" };
        if (existing.status === "pending") return { ok: false, message: "すでに申請中です。" };
        setAffiliations((prev) =>
          prev.map((a) =>
            a.id === existing.id
              ? { ...a, status: "pending", requested_by: requestedBy, updated_at: new Date().toISOString() }
              : a
          )
        );
        return { ok: true };
      }

      const newAffiliation: CompanyAffiliation = {
        id: randomId("af"),
        company_id: companyId,
        house_maker_id: houseMakerId,
        status: "pending",
        requested_by: requestedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAffiliations((prev) => [...prev, newAffiliation]);
      return { ok: true };
    },
    [currentUser, affiliations]
  );

  const updateAffiliationStatus = useCallback((affiliationId: string, status: AffiliationStatus) => {
    setAffiliations((prev) =>
      prev.map((a) => (a.id === affiliationId ? { ...a, status, updated_at: new Date().toISOString() } : a))
    );
  }, []);

  const removeAffiliation = useCallback((affiliationId: string) => {
    setAffiliations((prev) => prev.filter((a) => a.id !== affiliationId));
  }, []);

  const inviteCustomerByPhone = useCallback<StoreState["inviteCustomerByPhone"]>(
    (phone) => {
      if (!currentUser || (currentUser.type !== "company" && currentUser.type !== "house_maker")) {
        return { ok: false, message: "ログインが必要です。" };
      }
      const orgType: OrgType = currentUser.type === "company" ? "company" : "house_maker";
      const orgId = currentUser.type === "company" ? currentUser.companyId : currentUser.houseMakerId;

      const customer = customers.find((c) => c.phone === phone);
      if (!customer) {
        return { ok: false, message: "この電話番号でご登録の居住者様が見つかりませんでした。" };
      }

      const existing = customerOrgLinks.find(
        (l) => l.customer_id === customer.id && l.org_type === orgType && l.org_id === orgId
      );
      if (existing) {
        if (existing.status === "approved") return { ok: false, message: "すでに連携済みです。" };
        if (existing.status === "pending") return { ok: false, message: "すでに申請中です。" };
        setCustomerOrgLinks((prev) =>
          prev.map((l) =>
            l.id === existing.id
              ? { ...l, status: "pending", requested_by: "org", updated_at: new Date().toISOString() }
              : l
          )
        );
        return { ok: true, message: `${customer.name} 様に連携申請を送りました。` };
      }

      const newLink: CustomerOrgLink = {
        id: randomId("col"),
        customer_id: customer.id,
        org_type: orgType,
        org_id: orgId,
        status: "pending",
        requested_by: "org",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCustomerOrgLinks((prev) => [...prev, newLink]);
      return { ok: true, message: `${customer.name} 様に連携申請を送りました。` };
    },
    [currentUser, customers, customerOrgLinks]
  );

  const requestCustomerOrgLink = useCallback<StoreState["requestCustomerOrgLink"]>(
    (orgType, orgId) => {
      if (!currentUser || currentUser.type !== "customer") {
        return { ok: false, message: "ログインが必要です。" };
      }
      const existing = customerOrgLinks.find(
        (l) => l.customer_id === currentUser.customerId && l.org_type === orgType && l.org_id === orgId
      );
      if (existing) {
        if (existing.status === "approved") return { ok: false, message: "すでに連携済みです。" };
        if (existing.status === "pending") return { ok: false, message: "すでに申請中です。" };
        setCustomerOrgLinks((prev) =>
          prev.map((l) =>
            l.id === existing.id
              ? { ...l, status: "pending", requested_by: "customer", updated_at: new Date().toISOString() }
              : l
          )
        );
        return { ok: true };
      }

      const newLink: CustomerOrgLink = {
        id: randomId("col"),
        customer_id: currentUser.customerId,
        org_type: orgType,
        org_id: orgId,
        status: "pending",
        requested_by: "customer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCustomerOrgLinks((prev) => [...prev, newLink]);
      return { ok: true };
    },
    [currentUser, customerOrgLinks]
  );

  const updateCustomerOrgLinkStatus = useCallback((linkId: string, status: AffiliationStatus) => {
    setCustomerOrgLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, status, updated_at: new Date().toISOString() } : l))
    );
  }, []);

  const removeCustomerOrgLink = useCallback((linkId: string) => {
    setCustomerOrgLinks((prev) => prev.filter((l) => l.id !== linkId));
  }, []);

  const getRequestByTrackingCode = useCallback(
    (code: string) => requests.find((r) => r.tracking_code === code.toUpperCase()) ?? null,
    [requests]
  );

  const value = useMemo<StoreState>(
    () => ({
      currentUser,
      companies,
      houseMakers,
      accounts,
      partners,
      availabilitySlots,
      affiliations,
      requests,
      customers,
      customerOrgLinks,
      notifications,
      login,
      logout,
      signupCompany,
      signupHouseMaker,
      signupCustomer,
      updateCustomerProfile,
      updateCompanyProfile,
      updateHouseMakerProfile,
      addPartner,
      toggleSlot,
      getSlot,
      submitPublicRequest,
      submitHouseMakerRequest,
      submitCustomerRequest,
      updateRequestStatus,
      requestAffiliation,
      updateAffiliationStatus,
      removeAffiliation,
      inviteCustomerByPhone,
      requestCustomerOrgLink,
      updateCustomerOrgLinkStatus,
      removeCustomerOrgLink,
      getRequestByTrackingCode,
    }),
    [
      currentUser,
      companies,
      houseMakers,
      accounts,
      partners,
      availabilitySlots,
      affiliations,
      requests,
      customers,
      customerOrgLinks,
      notifications,
      login,
      logout,
      signupCompany,
      signupHouseMaker,
      signupCustomer,
      updateCustomerProfile,
      updateCompanyProfile,
      updateHouseMakerProfile,
      addPartner,
      toggleSlot,
      getSlot,
      submitPublicRequest,
      submitHouseMakerRequest,
      submitCustomerRequest,
      updateRequestStatus,
      requestAffiliation,
      updateAffiliationStatus,
      removeAffiliation,
      inviteCustomerByPhone,
      requestCustomerOrgLink,
      updateCustomerOrgLinkStatus,
      removeCustomerOrgLink,
      getRequestByTrackingCode,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within MockDataProvider");
  return ctx;
}
