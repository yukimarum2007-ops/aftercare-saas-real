import { ReactNode } from "react";

export default function DashboardHero({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="app-header-band rounded-2xl p-6 md:p-8 shadow-lg shadow-brand-600/25">
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wide text-white/70 uppercase">{eyebrow}</p>
          <h1 className="text-xl md:text-2xl font-bold truncate">{title}</h1>
          <p className="text-sm text-white/80 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}
