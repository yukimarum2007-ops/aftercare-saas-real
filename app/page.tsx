import Link from "next/link";
import {
  ClipboardCheck,
  Search,
  Building,
  UserPlus,
  User,
  Wrench,
  ChevronRight,
} from "lucide-react";

const MENU_GROUPS: {
  label: string;
  items: { href: string; icon: any; title: string; subtitle: string }[];
}[] = [
  {
    label: "アフター会社の方",
    items: [
      { href: "/login", icon: ClipboardCheck, title: "ログイン", subtitle: "担当者アカウントでログイン" },
      { href: "/signup", icon: UserPlus, title: "新規会員登録", subtitle: "アフター会社としてはじめる" },
    ],
  },
  {
    label: "ハウスメーカー・工務店の方",
    items: [
      { href: "/maker/login", icon: Building, title: "ログイン", subtitle: "担当者アカウントでログイン" },
      { href: "/maker/signup", icon: UserPlus, title: "新規会員登録", subtitle: "種別を選んではじめる" },
    ],
  },
  {
    label: "居住者様",
    items: [
      { href: "/customer/login", icon: User, title: "ログイン", subtitle: "マイページにログイン" },
      { href: "/customer/signup", icon: UserPlus, title: "新規会員登録", subtitle: "かんたん登録ではじめる" },
      { href: "/status", icon: Search, title: "対応状況を確認する", subtitle: "受付IDで確認" },
    ],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen app-shell-bg flex flex-col">
      <div className="app-header-band px-6 pt-14 pb-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
          <Wrench size={26} />
        </div>
        <h1 className="text-2xl font-bold leading-snug">アフターメンテナンス管理システム</h1>
        <p className="text-sm text-white/75 mt-2 max-w-xs mx-auto leading-relaxed">
          住宅設備のアフターサービスを、みんなでかんたんに。
        </p>
      </div>

      <div className="flex-1 px-4 md:px-6 pt-8 pb-10">
        <div className="max-w-md mx-auto space-y-6">
          {MENU_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-bold text-slate-400 px-2 mb-2">{group.label}</p>
              <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 divide-y divide-slate-100 overflow-hidden">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.subtitle}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="card p-4 text-left text-sm text-slate-500 space-y-1">
            <p className="section-eyebrow mb-1">デモ用ログイン情報</p>
            <p>アフター会社: company@example.com / password123</p>
            <p>ハウスメーカー: maker@example.com / password123</p>
            <p>工務店: contractor@example.com / password123</p>
            <p>居住者様: customer@example.com / password123</p>
            <p className="text-xs text-slate-400 pt-1">
              ※本アプリはダミーデータで動作するデモ版です。データはブラウザのメモリ上のみで保持され、再読み込みでリセットされます。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
