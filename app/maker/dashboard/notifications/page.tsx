"use client";

import { useStore } from "@/lib/store";
import NotificationsList from "@/components/NotificationsList";

export default function MakerNotificationsPage() {
  const { currentUser, accounts } = useStore();
  const houseMakerId = currentUser?.type === "house_maker" ? currentUser.houseMakerId : "";
  const account = accounts.find((a) => a.type === "house_maker" && a.refId === houseMakerId);
  return <NotificationsList email={account?.email} />;
}
