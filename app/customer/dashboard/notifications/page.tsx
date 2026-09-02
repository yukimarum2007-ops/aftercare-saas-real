"use client";

import { useStore } from "@/lib/store";
import NotificationsList from "@/components/NotificationsList";

export default function CustomerNotificationsPage() {
  const { currentUser, customers } = useStore();
  const customerId = currentUser?.type === "customer" ? currentUser.customerId : "";
  const customer = customers.find((c) => c.id === customerId);
  return <NotificationsList email={customer?.email} />;
}
