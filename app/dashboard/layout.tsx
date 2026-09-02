"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { LayoutDashboard, CalendarDays, Users, UserCog, Wrench, Bell, Settings2 } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
    { href: "/dashboard/customers", label: "居住者様管理", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 md:flex">
      {/* サイドナビ（PC） */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-white/95 backdrop-blur-sm border-r border-slate-200/70 p-5">
        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-600/25 flex items-center justify-center shrink-0">
            <Wrench className="text-white" size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400">アフター会社</p>
            <p className="text-sm font-bold text-slate-800 truncate">{companyName}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-brand-700"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1 mb-2">
          <Link
            href="/dashboard/notifications"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-brand-700"
          >
            <Bell size={18} />
            通知
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-brand-700"
          >
            <Settings2 size={18} />
            会社情報
          </Link>
        </div>
        <SignOutButton redirectTo="/login" />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* ヘッダー（モバイル） */}
        <header className="md:hidden bg-white/95 backdrop-blur-sm border-b border-slate-200/70 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <p className="font-bold text-slate-800 truncate">{companyName}</p>
          <div className="flex items-center gap-1">
            <Link href="/dashboard/notifications" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100" aria-label="通知">
              <Bell size={20} />
            </Link>
            <Link href="/dashboard/profile" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100" aria-label="会社情報">
              <Settings2 size={20} />
            </Link>
            <SignOutButton compact redirectTo="/login" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>

        {/* ボトムナビ（モバイル） */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/70 flex z-10">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 font-bold text-xs ${
                  active ? "text-brand-600" : "text-slate-500"
                }`}
              >
                <item.icon size={22} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
