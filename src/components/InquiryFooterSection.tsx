import { useEffect, useState } from 'react';
import { NasaBadge } from './NasaBadge';

export function InquiryFooterSection() {
  const [utcTime, setUtcTime] = useState<string>(() =>
    new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setUtcTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer id="footer" className="border-t border-[#94A3B8]/20 bg-[#060B19] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Brand + NASA Space Apps Badge */}
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-[#23A9F2]/40 bg-[#060B19]">
                <img
                  src="/assets/aistudio/Logo_d1845c0a.jpeg"
                  alt="Planetary Mirrors emblem"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover scale-[1.55]"
                />
              </div>
              <div>
                <span className="font-display block text-sm font-semibold tracking-[0.14em] text-[#F8FAFC] uppercase">
                  Planetary Mirrors
                </span>
                <span className="font-mono-tabular text-[11px] text-[#94A3B8]">
                  Orbital Comparative Observatory
                </span>
              </div>
            </div>
            <NasaBadge compact />
          </div>

          {/* Quick Navigation Links */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#94A3B8]"
          >
            <a href="#models" className="hover:text-[#23A9F2] transition-colors">
              The Models
            </a>
            <a href="#telemetry" className="hover:text-[#23A9F2] transition-colors">
              Telemetry
            </a>
            <a href="#parallels" className="hover:text-[#23A9F2] transition-colors">
              Planetary Parallels
            </a>
            <a href="#logbook" className="hover:text-[#23A9F2] transition-colors">
              Logbook
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#94A3B8]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#94A3B8]">
            © {new Date().getUTCFullYear()} Planetary Mirrors Observatory Consortium. All rights
            reserved.
          </p>
          <p className="font-mono-tabular text-xs text-[#94A3B8]">
            COSMIC CLOCK · <span className="text-[#23A9F2]">{utcTime}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
