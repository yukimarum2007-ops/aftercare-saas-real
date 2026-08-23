"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { LogOut } from "lucide-react";

export default function SignOutButton({
  compact = false,
  redirectTo = "/login",
}: {
  compact?: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { logout } = useStore();

  function handleSignOut() {
    logout();
    router.push(redirectTo);
  }

  if (compact) {
    return (
      <button onClick={handleSignOut} className="text-slate-500" aria-label="ログアウト">
        <LogOut size={22} />
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 font-bold hover:bg-slate-100 mt-2"
    >
      <LogOut size={20} />
      ログアウト
    </button>
  );
}
