import { useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { PLANETARY_ANALOGUES, type PlanetaryAnaloguePair } from '../data/observatoryData';

export function ParallelsSection() {
  const [selectedId, setSelectedId] = useState<string>(PLANETARY_ANALOGUES[0].id);
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const comparatorRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<boolean>(false);

  const activePair: PlanetaryAnaloguePair =
    PLANETARY_ANALOGUES.find((p) => p.id === selectedId) ?? PLANETARY_ANALOGUES[0];

  const updateSplitFromClientX = (clientX: number) => {
    const el = comparatorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setSplitPercent(Math.max(4, Math.min(96, Math.round(raw))));
  };

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - activePair.similarityIndex / 100);

  return (
    <section
      id="parallels"
      className="relative scroll-mt-16 border-t border-[#94A3B8]/20 bg-[#060B19] py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-tabular text-xs tracking-[0.22em] text-[#23A9F2] uppercase">
              03 · Planetary Parallels
            </p>
            <h2
              className="font-display mt-2 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[0.06em] text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              Earth &amp; Mars Geological Analogues
            </h2>
          </div>
          <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[#94A3B8]">
            Wipe across orbital satellite captures to compare terrestrial extreme environments with
            their Martian morphological twins.
          </p>
        </div>

        {/* Interactive Location Selector Tabs */}
        <div
          role="tablist"
          aria-label="Earth and Mars analogue pairs"
          className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PLANETARY_ANALOGUES.map((pair) => {
            const active = pair.id === activePair.id;
            return (
              <button
                key={pair.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => {
                  setSelectedId(pair.id);
                  setSplitPercent(50);
                }}
                className={`flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-all duration-200 cursor-pointer ${
                  active
                    ? 'border-[#23A9F2] bg-[#102347] text-[#F8FAFC] shadow-[0_0_20px_rgba(35,169,242,0.16)]'
                    : 'border-[#94A3B8]/20 bg-[#102347]/35 text-[#94A3B8] hover:border-[#23A9F2]/50 hover:text-[#F8FAFC]'
                }`}
              >
                <span className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#23A9F2]">
                  {pair.similarityIndex}% Match
                </span>
                <span className="mt-1 font-semibold text-sm text-[#F8FAFC]">{pair.tabTitle}</span>
                <span className="mt-1 text-xs text-[#94A3B8] line-clamp-1">{pair.shortThesis}</span>
              </button>
            );
          })}
        </div>

        {/* Main Split Comparator + Similarity Index Panel */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Interactive Before / After Orbital Wipe Frame (8 cols) */}
          <div className="lg:col-span-8 flex flex-col rounded-xl border border-[#94A3B8]/20 bg-[#102347]/50 overflow-hidden">
            <div
              ref={comparatorRef}
              onPointerDown={(e) => {
                draggingRef.current = true;
                updateSplitFromClientX(e.clientX);
              }}
              onPointerMove={(e) => {
                if (draggingRef.current) {
                  updateSplitFromClientX(e.clientX);
                }
              }}
              onPointerUp={() => {
                draggingRef.current = false;
              }}
              onPointerCancel={() => {
                draggingRef.current = false;
              }}
              onPointerLeave={() => {
                draggingRef.current = false;
              }}
              className="relative h-[320px] sm:h-[440px] lg:h-[480px] w-full select-none overflow-hidden cursor-ew-resize"
            >
              {/* Base Layer: Mars Twin */}
              <img
                src={activePair.marsImage}
                alt={`${activePair.marsLocation} orbital terrain`}
                referrerPolicy="no-referrer"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Clipped Overlay Layer: Earth Analogue */}
              <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - splitPercent}% 0 0)` }}
              >
                <img
                  src={activePair.earthImage}
                  alt={`${activePair.earthLocation} satellite view`}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>

              {/* Scrims & Coordinate Labels */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-[#060B19]/90 via-[#060B19]/50 to-transparent px-4 py-3.5">
                <div className="max-w-[44%] font-mono-tabular text-xs leading-snug">
                  <span className="block text-[10px] font-semibold tracking-wider text-[#23A9F2]">
                    EARTH ANALOGUE
                  </span>
                  <span className="mt-0.5 hidden sm:block truncate text-[#F8FAFC]">
                    {activePair.earthLocation} · {activePair.earthCoords}
                  </span>
                </div>
                <div className="max-w-[44%] font-mono-tabular text-xs leading-snug text-right">
                  <span className="block text-[10px] font-semibold tracking-wider text-[#D95A2B]">
                    MARTIAN TWIN
                  </span>
                  <span className="mt-0.5 hidden sm:block truncate text-[#F8FAFC]">
                    {activePair.marsLocation} · {activePair.marsCoords}
                  </span>
                </div>
              </div>

              {/* Vertical Wipe Divider Line & Handle */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-[#23A9F2] shadow-[0_0_14px_#23A9F2]"
                style={{ left: `${splitPercent}%` }}
              >
                <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#23A9F2] bg-[#060B19]/95 text-[#F8FAFC] shadow-[0_0_16px_rgba(35,169,242,0.5)]">
                  <MoveHorizontal className="h-4 w-4 text-[#23A9F2]" />
                </div>
              </div>
            </div>

            {/* Accessible Keyboard Scrubber Bar */}
            <div className="flex items-center gap-4 border-t border-[#94A3B8]/20 bg-[#102347] px-5 py-3.5">
              <label
                htmlFor="orbital-wipe-slider"
                className="font-mono-tabular text-xs uppercase tracking-wider text-[#94A3B8] whitespace-nowrap"
              >
                Orbital Wipe
              </label>
              <input
                id="orbital-wipe-slider"
                type="range"
                min={4}
                max={96}
                value={splitPercent}
                onChange={(e) => setSplitPercent(Number(e.target.value))}
                className="pm-slider w-full"
              />
              <span className="font-mono-tabular text-xs text-[#F8FAFC] whitespace-nowrap">
                {splitPercent}% Earth / {100 - splitPercent}% Mars
              </span>
            </div>
          </div>

          {/* Similarity Index Gauge & Comparative Specs (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-[#94A3B8]/20 bg-[#102347]/70 p-6">
            <div>
              {/* Radial Solar Gold Gauge */}
              <div className="flex items-center gap-5 border-b border-[#94A3B8]/20 pb-5">
                <div className="relative h-24 w-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.2)"
                      strokeWidth="7"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke="#F4A938"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono-tabular text-lg font-bold text-[#F4A938]">
                      {activePair.similarityIndex}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-mono-tabular text-[11px] uppercase tracking-[0.18em] text-[#F4A938]">
                    Similarity Index
                  </p>
                  <h3 className="font-display mt-1 text-lg font-semibold text-[#F8FAFC]">
                    Geological Match
                  </h3>
                  <p className="mt-1 text-xs text-[#94A3B8]">{activePair.shortThesis}</p>
                </div>
              </div>

              {/* Scientific Insight */}
              <p className="mt-5 text-sm leading-relaxed text-[#94A3B8]">
                {activePair.scientificInsight}
              </p>
            </div>

            {/* Parity Comparison Table */}
            <div className="mt-6 space-y-3 border-t border-[#94A3B8]/20 pt-5">
              {activePair.parityMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-[#94A3B8]/15 bg-[#060B19]/65 p-3"
                >
                  <p className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#94A3B8]">
                    {metric.label}
                  </p>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 font-mono-tabular text-xs">
                    <div>
                      <span className="block text-[10px] text-[#23A9F2]">EARTH</span>
                      <span className="text-[#F8FAFC]">{metric.earthValue}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#D95A2B]">MARS</span>
                      <span className="text-[#F8FAFC]">{metric.marsValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
