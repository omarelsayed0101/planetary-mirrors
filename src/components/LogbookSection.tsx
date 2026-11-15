import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { LOGBOOK_ENTRIES } from '../data/observatoryData';
import {
  filterLogbookEntries,
  getAdjacentLogbookIndex,
  type LogbookCategory,
} from '../utils/planetaryLogic';

const FILTER_CATEGORIES: LogbookCategory[] = [
  'All Entries',
  'Lunar Surface',
  'Martian Terrain',
  'Earth Analogues',
  'Orbital Scans',
];

export function LogbookSection() {
  const [selectedCategory, setSelectedCategory] = useState<LogbookCategory>('All Entries');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visibleEntries = filterLogbookEntries(LOGBOOK_ENTRIES, selectedCategory);
  const activeEntry =
    lightboxIndex !== null && visibleEntries[lightboxIndex]
      ? visibleEntries[lightboxIndex]
      : null;

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : getAdjacentLogbookIndex(prev, 'next', visibleEntries.length),
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : getAdjacentLogbookIndex(prev, 'prev', visibleEntries.length),
        );
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, visibleEntries.length]);

  return (
    <section
      id="logbook"
      className="relative scroll-mt-16 border-t border-[#94A3B8]/20 bg-[#060B19] py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header + Filter Bar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-tabular text-xs tracking-[0.22em] text-[#23A9F2] uppercase">
              04 · Expedition Archive
            </p>
            <h2
              className="font-display mt-2 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[0.06em] text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              The Logbook
            </h2>
          </div>

          {/* Interactive Category Filter Buttons (NASA Cobalt active state) */}
          <div
            role="group"
            aria-label="Filter logbook entries by surface category"
            className="flex flex-wrap items-center gap-2"
          >
            {FILTER_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setLightboxIndex(null);
                  }}
                  aria-pressed={active}
                  className={`min-h-[40px] rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-[#23A9F2] bg-[#0B3D91] text-[#F8FAFC] shadow-[0_0_16px_rgba(11,61,145,0.55)]'
                      : 'border-[#94A3B8]/25 bg-[#102347]/45 text-[#94A3B8] hover:border-[#23A9F2]/60 hover:text-[#F8FAFC]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Archival Gallery Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleEntries.map((entry, idx) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-[#94A3B8]/20 bg-[#102347]/55 text-left transition-all duration-300 hover:border-[#23A9F2] hover:shadow-[0_0_24px_rgba(35,169,242,0.18)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#23A9F2]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#060B19]">
                <img
                  src={entry.imageSrc}
                  alt={entry.imageAlt}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060B19]/90 via-transparent to-transparent" />
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#94A3B8]/30 bg-[#060B19]/75 text-[#F8FAFC] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Maximize2 className="h-3.5 w-3.5 text-[#23A9F2]" aria-hidden="true" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono-tabular text-[11px]">
                  <span className="font-semibold text-[#23A9F2]">{entry.entryCode}</span>
                  <span className="text-[#94A3B8]">{entry.coordinates}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <p className="font-mono-tabular text-[11px] text-[#94A3B8]">
                    {entry.category} · {entry.captureDate}
                  </p>
                  <h3 className="mt-1.5 font-semibold text-base text-[#F8FAFC] group-hover:text-[#23A9F2] transition-colors">
                    {entry.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#94A3B8] line-clamp-2">
                    {entry.summary}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Luxury Nebula Navy Lightbox Modal */}
      {activeEntry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeEntry.entryCode} ${activeEntry.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#060B19]/90 p-4 sm:p-6"
          style={{ backdropFilter: 'blur(12px)' }}
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#23A9F2]/40 bg-[#102347] shadow-[0_24px_80px_rgba(0,0,0,0.75)] lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Stage */}
            <div className="relative flex-1 bg-[#060B19] min-h-[260px] lg:min-h-[520px]">
              <img
                src={activeEntry.imageSrc}
                alt={activeEntry.imageAlt}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 rounded-md bg-[#060B19]/85 px-3 py-1.5 font-mono-tabular text-xs text-[#23A9F2] border border-[#94A3B8]/20">
                {activeEntry.entryCode} · {activeEntry.coordinates}
              </div>
            </div>

            {/* Expedition Dossier Sidebar */}
            <div className="flex w-full flex-col justify-between p-6 sm:p-8 lg:w-[380px] overflow-y-auto">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono-tabular text-xs uppercase tracking-[0.18em] text-[#23A9F2]">
                      {activeEntry.category}
                    </p>
                    <h3 className="font-display mt-1.5 text-2xl font-semibold text-[#F8FAFC]">
                      {activeEntry.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(null)}
                    aria-label="Close expedition lightbox"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#94A3B8]/25 bg-[#060B19]/60 text-[#F8FAFC] transition-colors hover:border-[#23A9F2] cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-4 font-mono-tabular text-xs text-[#94A3B8]">
                  {activeEntry.instrument} · {activeEntry.captureDate}
                </p>

                <p className="mt-5 text-sm leading-relaxed text-[#F8FAFC]">
                  {activeEntry.summary}
                </p>

                <div className="mt-5 border-t border-[#94A3B8]/20 pt-5">
                  <p className="font-mono-tabular text-[11px] uppercase tracking-[0.18em] text-[#F4A938]">
                    Comparative Field Notes
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                    {activeEntry.expeditionNotes}
                  </p>
                </div>

                {/* Unboxed Spectral Tags */}
                <div className="mt-5 border-t border-[#94A3B8]/20 pt-4 font-mono-tabular text-xs text-[#23A9F2]">
                  {activeEntry.spectralTags.join(' · ')}
                </div>
              </div>

              {/* Next / Previous Navigation */}
              <div className="mt-6 flex items-center justify-between border-t border-[#94A3B8]/20 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === null
                        ? 0
                        : getAdjacentLogbookIndex(prev, 'prev', visibleEntries.length),
                    )
                  }
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#94A3B8]/30 bg-[#060B19]/60 px-3.5 py-2 text-xs font-medium text-[#F8FAFC] transition-colors hover:border-[#23A9F2] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Previous</span>
                </button>

                <span className="font-mono-tabular text-xs text-[#94A3B8]">
                  {(lightboxIndex ?? 0) + 1} / {visibleEntries.length}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === null
                        ? 0
                        : getAdjacentLogbookIndex(prev, 'next', visibleEntries.length),
                    )
                  }
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#94A3B8]/30 bg-[#060B19]/60 px-3.5 py-2 text-xs font-medium text-[#F8FAFC] transition-colors hover:border-[#23A9F2] cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
