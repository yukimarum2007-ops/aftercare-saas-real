"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Building, LayoutDashboard, FilePlus2, UserCog, Bell, Settings2 } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import { BUILDER_TYPE_LABEL } from "@/lib/types";

export default function MakerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, houseMakers } = useStore();

  useEffect(() => {
    if (!currentUser) {
      router.replace("/maker/login");
    } else if (currentUser.type !== "house_maker") {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.type !== "house_maker") {
    return null;
  }

  const houseMaker = houseMakers.find((hm) => hm.id === currentUser.houseMakerId);
  const houseMakerName = houseMaker?.name ?? "ハウスメーカー・工務店";
  const builderTypeLabel = houseMaker ? BUILDER_TYPE_LABEL[houseMaker.builder_type] : "ハウスメーカー・工務店";

  const navItems = [
    { href: "/maker/dashboard", label: "提携申請", icon: LayoutDashboard },
    { href: "/maker/dashboard/new-request", label: "案件登録", icon: FilePlus2 },
    { href: "/maker/dashboard/customers", label: "居住者様管理", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/70 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-600/25 flex items-center justify-center shrink-0">
            <Building className="text-white" size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">{builderTypeLabel}</p>
            <p className="font-bold text-slate-800">{houseMakerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`hidden md:flex items-center gap-2 text-sm font-bold transition-colors ${
                  active ? "text-brand-600" : "text-slate-500 hover:text-brand-600"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/maker/dashboard/notifications"
            className={`p-2 rounded-xl transition-colors ${
              pathname === "/maker/dashboard/notifications" ? "text-brand-600 bg-brand-50" : "text-slate-500 hover:bg-slate-100"
            }`}
            aria-label="通知"
          >
            <Bell size={20} />
          </Link>
          <Link
            href="/maker/dashboard/profile"
            className={`p-2 rounded-xl transition-colors ${
              pathname === "/maker/dashboard/profile" ? "text-brand-600 bg-brand-50" : "text-slate-500 hover:bg-slate-100"
            }`}
            aria-label="会社情報"
          >
            <Settings2 size={20} />
          </Link>
          <SignOutButton compact redirectTo="/maker/login" />
        </div>
      </header>

      {/* モバイル用サブナビ */}
      <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-slate-200/70 flex">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center py-3 text-sm font-bold ${
                active ? "text-brand-600" : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
