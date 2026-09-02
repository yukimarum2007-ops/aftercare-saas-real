export default function HouseSkyline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 奥の家並み（薄め） */}
      <g opacity="0.35" fill="currentColor">
        <path d="M0 220V150l60-30 60 30v70z" />
        <path d="M120 220V130l70-35 70 35v90z" />
        <path d="M260 220V160l50-25 50 25v60z" />
        <path d="M420 220V140l65-32 65 32v80z" />
        <path d="M600 220V155l55-28 55 28v65z" />
        <path d="M760 220V135l70-35 70 35v85z" />
        <path d="M950 220V160l50-25 50 25v60z" />
        <path d="M1100 220V145l60-30 60 30v75z" />
        <path d="M1260 220V155l60-28 60 28v65h-120z" />
      </g>
      {/* 手前の家並み（濃いめ、屋根と窓） */}
      <g fill="currentColor">
        <path d="M-20 220V165l90-45 90 45v55z" />
        <rect x="45" y="180" width="16" height="20" rx="2" fill="white" fillOpacity="0.55" />
        <path d="M180 220V150l100-50 100 50v70z" />
        <rect x="255" y="175" width="18" height="22" rx="2" fill="white" fillOpacity="0.6" />
        <rect x="290" y="175" width="18" height="22" rx="2" fill="white" fillOpacity="0.4" />
        <path d="M420 220V175l70-35 70 35v45z" />
        <rect x="475" y="195" width="14" height="18" rx="2" fill="white" fillOpacity="0.5" />
        <path d="M620 220V160l85-42 85 42v60z" />
        <rect x="685" y="182" width="16" height="20" rx="2" fill="white" fillOpacity="0.55" />
        <path d="M850 220V170l75-38 75 38v50z" />
        <rect x="905" y="190" width="15" height="19" rx="2" fill="white" fillOpacity="0.45" />
        <path d="M1060 220V155l90-45 90 45v65z" />
        <rect x="1130" y="178" width="18" height="22" rx="2" fill="white" fillOpacity="0.6" />
        <rect x="1165" y="178" width="18" height="22" rx="2" fill="white" fillOpacity="0.4" />
        <path d="M1300 220V172l70-35 70 35v48z" />
        <rect x="1355" y="192" width="14" height="18" rx="2" fill="white" fillOpacity="0.5" />
      </g>
    </svg>
  );
}
