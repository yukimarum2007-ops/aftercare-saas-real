"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { LayoutDashboard, CalendarDays, Users } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, companies } = useStore();

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    } else if (currentUser.type !== "company") {
      router.replace("/maker/dashboard");
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.type !== "company") {
    return null;
  }

  const company = companies.find((c) => c.id === currentUser.companyId);
  const companyName = company?.name ?? "アフター会社";

  const navItems = [
    { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
    { href: "/dashboard/calendar", label: "空き枠設定", icon: CalendarDays },
    { href: "/dashboard/partners", label: "連携工務店", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* サイドナビ（PC） */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-white border-r border-slate-200 p-5">
        <div className="mb-8">
          <p className="text-xs font-bold text-slate-400">アフター会社</p>
          <p className="text-lg font-bold text-slate-800 truncate">{companyName}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 font-bold hover:bg-brand-50 hover:text-brand-700"
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
        <SignOutButton redirectTo="/login" />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* ヘッダー（モバイル） */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <p className="font-bold text-slate-800 truncate">{companyName}</p>
          <SignOutButton compact redirectTo="/login" />
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>

        {/* ボトムナビ（モバイル） */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex z-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-0.5 py-3 text-slate-500 font-bold text-xs"
            >
              <item.icon size={22} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
