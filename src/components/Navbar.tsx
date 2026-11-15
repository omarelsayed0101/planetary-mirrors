import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onInitiateInquiry: () => void;
}

const NAV_ITEMS = [
  { label: 'The Models', href: '#models' },
  { label: 'Telemetry', href: '#telemetry' },
  { label: 'Planetary Parallels', href: '#parallels' },
  { label: 'Logbook', href: '#logbook' },
];

export function Navbar({ onInitiateInquiry }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#94A3B8]/20"
      style={{
        background: 'rgba(16, 35, 71, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Emblem & Single-line Wordmark */}
        <a
          href="#hero"
          className="group flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#23A9F2]"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#23A9F2]/50 bg-[#060B19] shadow-[0_0_14px_rgba(35,169,242,0.22)]">
            <img
              src="/assets/aistudio/Logo_d1845c0a.jpeg"
              alt="Planetary Mirrors orbital emblem"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover scale-[1.55] transition-transform duration-300 group-hover:scale-[1.68]"
            />
          </div>
          <span className="font-display text-base sm:text-lg font-semibold tracking-[0.14em] text-[#F8FAFC] uppercase whitespace-nowrap">
            Planetary Mirrors
          </span>
        </a>

        {/* Zone 2: Clean Spaced Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative py-1.5 text-sm font-medium tracking-wide text-[#94A3B8] transition-colors duration-200 hover:text-[#F8FAFC] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#23A9F2]"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#23A9F2] transition-transform duration-200 ease-out group-hover:scale-x-100"
              />
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onInitiateInquiry}
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#F4A938] px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-[#060B19] uppercase transition-all duration-200 hover:bg-[#f7b959] hover:shadow-[0_0_20px_rgba(244,169,56,0.35)] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A938]"
          >
            Initiate Inquiry
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex lg:hidden h-11 w-11 items-center justify-center rounded-lg border border-[#94A3B8]/25 bg-[#060B19]/70 text-[#F8FAFC] transition-colors hover:border-[#23A9F2] cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-[#94A3B8]/20 bg-[#060B19]/95 px-5 py-4"
        >
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className="flex min-h-[44px] items-center justify-between border-b border-[#94A3B8]/10 py-2 text-sm font-medium text-[#F8FAFC] hover:text-[#23A9F2]"
              >
                <span>{item.label}</span>
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onInitiateInquiry();
              }}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#F4A938] px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-[#060B19] uppercase cursor-pointer"
            >
              Initiate Inquiry
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
