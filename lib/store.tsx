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
  RequestSource,
  Customer,
  CustomerConnection,
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
  initialCustomerConnections,
} from "./mock-data";

// ------------------------------------------------------------
// このアプリはSupabase等の外部バックエンドを一切使用しません。
// すべてのデータはブラウザのメモリ（Reactの状態）で管理される
// モック（ダミー）データです。ページを再読み込みすると初期状態に
// 戻ります。本番のデータベースに接続する際は、この store.tsx の
// 各関数を実際のAPI呼び出しに置き換えてください。
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
      .replace(/(^-|-$)/g, "") || "company"
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
  customerConnections: CustomerConnection[];

  login: (email: string, password: string) => { ok: boolean; message?: string; redirectTo?: string };
  logout: () => void;
  signupCompany: (input: {
    companyName: string;
    fullName: string;
    email: string;
    password: string;
    houseMakerId: string;
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
  updateAffiliationStatus: (affiliationId: string, status: AffiliationStatus) => void;
  updateCustomerConnectionStatus: (
    connectionId: string,
    side: "company" | "house_maker",
    status: AffiliationStatus
  ) => void;
  getRequestByTrackingCode: (code: string) => ServiceRequest | null;
}

const StoreContext = createContext<StoreState | null>(null);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [houseMakers] = useState<HouseMaker[]>(initialHouseMakers);
  const [accounts, setAccounts] = useState<MockAccount[]>(initialAccounts);
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [availabilitySlots, setAvailabilitySlots] = useState<Record<string, AvailabilitySlot>>(
    initialAvailabilitySlots
  );
  const [affiliations, setAffiliations] = useState<CompanyAffiliation[]>(initialAffiliations);
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [customerAccounts, setCustomerAccounts] = useState<MockCustomerAccount[]>(initialCustomerAccounts);
  const [customerConnections, setCustomerConnections] = useState<CustomerConnection[]>(
    initialCustomerConnections
  );

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

  const signupCompany = useCallback(
    (input: { companyName: string; fullName: string; email: string; password: string; houseMakerId: string }) => {
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

      // 会社・ハウスメーカーのどちらも選択されなかった場合は連携レコードを作らない
      if (input.companyId || input.houseMakerId) {
        const newConnection: CustomerConnection = {
          id: randomId("cc"),
          customer_id: customerId,
          company_id: input.companyId || null,
          house_maker_id: input.houseMakerId || null,
          company_status: input.companyId ? "pending" : "approved",
          house_maker_status: input.houseMakerId ? "pending" : "approved",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCustomerConnections((prev) => [...prev, newConnection]);
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
      return { ok: true, trackingCode: req.tracking_code };
    },
    [companies, createRequest]
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
      return { ok: true, trackingCode: req.tracking_code };
    },
    [currentUser, affiliations, createRequest]
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
      return { ok: true, trackingCode: req.tracking_code };
    },
    [currentUser, companies, customers, createRequest]
  );

  const updateRequestStatus = useCallback((requestId: string, status: RequestStatus, note: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status, staff_note: note, updated_at: new Date().toISOString() } : r
      )
    );
  }, []);

  const updateAffiliationStatus = useCallback((affiliationId: string, status: AffiliationStatus) => {
    setAffiliations((prev) =>
      prev.map((a) => (a.id === affiliationId ? { ...a, status, updated_at: new Date().toISOString() } : a))
    );
  }, []);

  const updateCustomerConnectionStatus = useCallback(
    (connectionId: string, side: "company" | "house_maker", status: AffiliationStatus) => {
      setCustomerConnections((prev) =>
        prev.map((c) =>
          c.id === connectionId
            ? {
                ...c,
                company_status: side === "company" ? status : c.company_status,
                house_maker_status: side === "house_maker" ? status : c.house_maker_status,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      );
    },
    []
  );

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
      customerConnections,
      login,
      logout,
      signupCompany,
      signupCustomer,
      updateCustomerProfile,
      addPartner,
      toggleSlot,
      getSlot,
      submitPublicRequest,
      submitHouseMakerRequest,
      submitCustomerRequest,
      updateRequestStatus,
      updateAffiliationStatus,
      updateCustomerConnectionStatus,
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
      customerConnections,
      login,
      logout,
      signupCompany,
      signupCustomer,
      updateCustomerProfile,
      addPartner,
      toggleSlot,
      getSlot,
      submitPublicRequest,
      submitHouseMakerRequest,
      submitCustomerRequest,
      updateRequestStatus,
      updateAffiliationStatus,
      updateCustomerConnectionStatus,
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
