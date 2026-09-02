"use client";

import { useStore } from "@/lib/store";
import NotificationsList from "@/components/NotificationsList";

export default function CompanyNotificationsPage() {
  const { currentUser, accounts } = useStore();
  const companyId = currentUser?.type === "company" ? currentUser.companyId : "";
  const account = accounts.find((a) => a.type === "company" && a.refId === companyId);
  return <NotificationsList email={account?.email} />;
}
