import { ReactNode } from "react";
import HouseSkyline from "./HouseSkyline";

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
    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-brand-600/25">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(135deg, #2f7bff 0%, #2570f5 45%, #16327f 100%)",
        }}
      />
      {/* 装飾的な幾何学パターン（ハウスメーカーサイト風のアクセント） */}
      <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/10" />
      <div className="absolute -right-4 bottom-[-3rem] w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute right-16 top-6 w-16 h-16 rounded-2xl bg-white/10 rotate-12" />
      <HouseSkyline className="hero-skyline" />

      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
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
