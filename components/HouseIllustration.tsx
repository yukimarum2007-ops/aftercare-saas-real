export default function HouseIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 340"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef2f8" />
          <stop offset="100%" stopColor="#fdf3e7" />
        </linearGradient>
        <linearGradient id="wallGradA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#faf8f4" />
          <stop offset="100%" stopColor="#eee8dc" />
        </linearGradient>
        <linearGradient id="wallGradB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b4552" />
          <stop offset="100%" stopColor="#2a323d" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="100%" stopColor="#333b46" />
        </linearGradient>
        <linearGradient id="woodGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b98a5e" />
          <stop offset="100%" stopColor="#9c7048" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3d6" />
          <stop offset="100%" stopColor="#ffdd94" />
        </linearGradient>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9e4d6" />
          <stop offset="100%" stopColor="#ddd6c3" />
        </linearGradient>
      </defs>

      {/* 背景の空 */}
      <rect x="0" y="0" width="420" height="340" fill="url(#skyGrad)" />

      {/* 地面 */}
      <rect x="0" y="286" width="420" height="54" fill="url(#groundGrad)" />
      <rect x="0" y="286" width="420" height="4" fill="#cfc6ac" opacity="0.6" />

      {/* 背後のフラットな塀・アクセント壁 */}
      <rect x="30" y="196" width="150" height="90" fill="url(#wallGradB)" />

      {/* メインボリューム（白い壁の箱） */}
      <rect x="150" y="140" width="220" height="146" fill="url(#wallGradA)" />
      {/* 陸屋根の縁 */}
      <rect x="146" y="134" width="228" height="10" fill="url(#roofGrad)" />

      {/* 木質のキューブ（玄関側） */}
      <rect x="150" y="196" width="90" height="90" fill="url(#woodGrad)" />
      <line x1="150" y1="214" x2="240" y2="214" stroke="#7c5535" strokeWidth="1.5" opacity="0.5" />
      <line x1="150" y1="232" x2="240" y2="232" stroke="#7c5535" strokeWidth="1.5" opacity="0.5" />
      <line x1="150" y1="250" x2="240" y2="250" stroke="#7c5535" strokeWidth="1.5" opacity="0.5" />
      <line x1="150" y1="268" x2="240" y2="268" stroke="#7c5535" strokeWidth="1.5" opacity="0.5" />

      {/* 玄関ドア */}
      <rect x="196" y="228" width="34" height="58" fill="#2a323d" />
      <circle cx="223" cy="258" r="1.6" fill="#e8d9b8" />

      {/* 大きな窓（リビング面・格子入り） */}
      <rect x="256" y="170" width="98" height="70" fill="url(#glassGrad)" opacity="0.9" />
      <rect x="256" y="170" width="98" height="70" fill="none" stroke="#333b46" strokeWidth="2" />
      <line x1="305" y1="170" x2="305" y2="240" stroke="#333b46" strokeWidth="1.5" />
      <line x1="256" y1="205" x2="354" y2="205" stroke="#333b46" strokeWidth="1.5" />

      {/* 縦長サブ窓（塀側の壁） */}
      <rect x="60" y="220" width="22" height="50" fill="url(#glassGrad)" opacity="0.85" />
      <rect x="60" y="220" width="22" height="50" fill="none" stroke="#1c222a" strokeWidth="1.5" />
      <rect x="96" y="220" width="22" height="50" fill="url(#glassGrad)" opacity="0.6" />
      <rect x="96" y="220" width="22" height="50" fill="none" stroke="#1c222a" strokeWidth="1.5" />

      {/* 屋根の張り出し（庇） */}
      <rect x="150" y="188" width="90" height="6" fill="url(#roofGrad)" />

      {/* ウッドデッキ */}
      <rect x="150" y="286" width="224" height="10" fill="url(#woodGrad)" opacity="0.9" />

      {/* シンプルな植栽（丸くない、細い葉のオーナメンタルグラス） */}
      <g stroke="#7c9473" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M392 286 C 390 265, 396 250, 393 232" />
        <path d="M400 286 C 399 262, 404 244, 402 226" />
        <path d="M408 286 C 405 268, 412 252, 410 236" />
      </g>
      <g stroke="#7c9473" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6">
        <path d="M20 286 C 18 270, 24 258, 21 244" />
        <path d="M28 286 C 27 268, 32 254, 30 240" />
      </g>

      {/* 遠景の細いアクセントライン（水平のミニマルな地平線） */}
      <line x1="0" y1="286" x2="420" y2="286" stroke="#c9c0a8" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
