"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Building, LayoutDashboard, FilePlus2 } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default function MakerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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
  const houseMakerName = houseMaker?.name ?? "ハウスメーカー";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Building size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">ハウスメーカー</p>
            <p className="font-bold text-slate-800">{houseMakerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/maker/dashboard"
            className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600"
          >
            <LayoutDashboard size={18} />
            提携申請
          </Link>
          <Link
            href="/maker/dashboard/new-request"
            className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600"
          >
            <FilePlus2 size={18} />
            案件登録
          </Link>
          <SignOutButton compact redirectTo="/maker/login" />
        </div>
      </header>

      {/* モバイル用サブナビ */}
      <div className="md:hidden bg-white border-b border-slate-200 flex">
        <Link href="/maker/dashboard" className="flex-1 text-center py-3 text-sm font-bold text-slate-600">
          提携申請
        </Link>
        <Link href="/maker/dashboard/new-request" className="flex-1 text-center py-3 text-sm font-bold text-slate-600">
          案件登録
        </Link>
      </div>

      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
