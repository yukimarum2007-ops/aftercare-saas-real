"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { User } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <User size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">施主様マイページ</p>
            <p className="font-bold text-slate-800">{currentUser.fullName} 様</p>
          </div>
        </div>
        <SignOutButton compact redirectTo="/customer/login" />
      </header>

      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
