export default function HouseIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 340"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd68a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffd68a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f2ecdf" />
        </linearGradient>
        <radialGradient id="windowGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#ffe6a3" />
          <stop offset="100%" stopColor="#ffc659" />
        </radialGradient>
        <linearGradient id="doorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a5a3b" />
          <stop offset="100%" stopColor="#6b4128" />
        </linearGradient>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe3c0" />
          <stop offset="100%" stopColor="#9fd2a3" />
        </linearGradient>
      </defs>

      {/* 太陽の光 */}
      <circle cx="320" cy="70" r="90" fill="url(#sunGlow)" />
      <circle cx="320" cy="70" r="26" fill="#ffcf6b" />

      {/* 地面 */}
      <path d="M0 300 Q200 270 400 300 V340 H0 Z" fill="url(#groundGrad)" />

      {/* 木 */}
      <rect x="52" y="230" width="10" height="45" rx="3" fill="#8a5a3b" />
      <circle cx="57" cy="215" r="28" fill="#5fae72" />
      <circle cx="40" cy="230" r="20" fill="#6bc17f" />
      <circle cx="76" cy="228" r="20" fill="#6bc17f" />

      {/* 低木 */}
      <ellipse cx="330" cy="288" rx="34" ry="18" fill="#6bc17f" />
      <ellipse cx="300" cy="292" rx="22" ry="14" fill="#5fae72" />

      {/* 玄関アプローチ */}
      <path d="M175 300 L185 340 H225 L235 300 Z" fill="#e7ddc9" />

      {/* 家本体：壁 */}
      <rect x="120" y="170" width="180" height="130" rx="6" fill="url(#wallGrad)" />
      <rect x="120" y="170" width="180" height="130" rx="6" fill="none" stroke="#e2d8c3" strokeWidth="2" />

      {/* 屋根 */}
      <path d="M100 178 L210 100 L320 178 Z" fill="url(#roofGrad)" />
      <path d="M100 178 L210 100 L320 178 L320 190 L210 114 L100 190 Z" fill="#173a8a" opacity="0.5" />

      {/* 煙突 */}
      <rect x="255" y="120" width="18" height="40" fill="#9aa3ad" />
      <rect x="252" y="114" width="24" height="10" rx="2" fill="#7c8590" />

      {/* 玄関ドア */}
      <rect x="192" y="228" width="46" height="72" rx="4" fill="url(#doorGrad)" />
      <circle cx="228" cy="264" r="3" fill="#ffd68a" />
      <path d="M192 228 Q215 214 238 228" fill="none" stroke="#6b4128" strokeWidth="4" />

      {/* 窓（左） */}
      <rect x="138" y="196" width="34" height="34" rx="4" fill="url(#windowGlow)" />
      <rect x="138" y="196" width="34" height="34" rx="4" fill="none" stroke="#c98f3a" strokeWidth="3" />
      <line x1="155" y1="196" x2="155" y2="230" stroke="#c98f3a" strokeWidth="2" />
      <line x1="138" y1="213" x2="172" y2="213" stroke="#c98f3a" strokeWidth="2" />

      {/* 窓（右） */}
      <rect x="256" y="196" width="34" height="34" rx="4" fill="url(#windowGlow)" />
      <rect x="256" y="196" width="34" height="34" rx="4" fill="none" stroke="#c98f3a" strokeWidth="3" />
      <line x1="273" y1="196" x2="273" y2="230" stroke="#c98f3a" strokeWidth="2" />
      <line x1="256" y1="213" x2="290" y2="213" stroke="#c98f3a" strokeWidth="2" />

      {/* 小窓（バルコニー風の装飾） */}
      <rect x="150" y="250" width="20" height="20" rx="3" fill="url(#windowGlow)" opacity="0.85" />
      <rect x="258" y="250" width="20" height="20" rx="3" fill="url(#windowGlow)" opacity="0.85" />
    </svg>
  );
}
