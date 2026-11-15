interface NasaBadgeProps {
  compact?: boolean;
}

export function NasaBadge({ compact = false }: NasaBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-3 border border-[#94A3B8]/25 bg-[#102347]/75 px-3.5 py-2 rounded-lg ${
        compact ? 'text-xs' : 'text-xs sm:text-sm'
      }`}
    >
      {/* Crisp vector orbital vector-chevron insignia */}
      <svg
        width={compact ? 26 : 32}
        height={compact ? 26 : 32}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="32" cy="32" r="29" fill="#0B3D91" stroke="#23A9F2" strokeWidth="1.75" />
        <ellipse
          cx="32"
          cy="32"
          rx="22"
          ry="9"
          transform="rotate(-24 32 32)"
          stroke="#F8FAFC"
          strokeWidth="1.5"
          strokeOpacity="0.85"
        />
        <path
          d="M11 41C23 28 41 21 55 18"
          stroke="#D95A2B"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M32 14L35.5 27.5L49 31L35.5 34.5L32 48L28.5 34.5L15 31L28.5 27.5L32 14Z"
          fill="#F8FAFC"
        />
        <circle cx="48" cy="19" r="2.2" fill="#F4A938" />
      </svg>
      <div className="h-6 w-px bg-[#94A3B8]/30 shrink-0" aria-hidden="true" />
      <div className="flex flex-col leading-tight">
        <span className="font-display text-[11px] font-bold tracking-[0.18em] text-[#F8FAFC] uppercase whitespace-nowrap">
          NASA Space Apps
        </span>
        <span className="font-mono-tabular text-[10px] tracking-[0.14em] text-[#94A3B8] uppercase whitespace-nowrap">
          Challenge Partner
        </span>
      </div>
    </div>
  );
}
