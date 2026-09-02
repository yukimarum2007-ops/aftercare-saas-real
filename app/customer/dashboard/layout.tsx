"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { User, Settings2, Bell } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser } = useStore();

  useEffect(() => {
    if (!currentUser) {
      router.replace("/customer/login");
    } else if (currentUser.type !== "customer") {
      router.replace("/");
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.type !== "customer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/70 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-600/25 flex items-center justify-center shrink-0">
            <User className="text-white" size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">施主様マイページ</p>
            <p className="font-bold text-slate-800">{currentUser.fullName} 様</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/customer/dashboard/notifications"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-brand-600"
            aria-label="通知"
          >
            <Bell size={22} />
          </Link>
          <Link
            href="/customer/dashboard/profile"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-brand-600"
            aria-label="プロフィール編集"
          >
            <Settings2 size={22} />
          </Link>
          <SignOutButton compact redirectTo="/customer/login" />
        </div>
      </header>

      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
