import { useEffect, useRef } from 'react';
import { ArrowDown, Layers } from 'lucide-react';
import { NasaBadge } from './NasaBadge';

interface HeroSectionProps {
  onEnterObservatory: () => void;
  onExploreStack: () => void;
}

export function HeroSection({ onEnterObservatory, onExploreStack }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const veil = veilRef.current;
    const halo = haloRef.current;
    const reticle = reticleRef.current;
    if (!section || !veil || !halo) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchOnly = window.matchMedia('(hover: none)').matches;

    let targetX = 0.5;
    let targetY = 0.44;
    let currentX = 0.5;
    let currentY = 0.44;
    let pointerActive = false;
    let rafId = 0;
    let startTime = performance.now();

    const applyPosition = (normX: number, normY: number) => {
      const pctX = `${(normX * 100).toFixed(2)}%`;
      const pctY = `${(normY * 100).toFixed(2)}%`;
      veil.style.setProperty('--mouse-x', pctX);
      veil.style.setProperty('--mouse-y', pctY);
      halo.style.setProperty('--mouse-y', pctY);
      halo.style.setProperty('--mouse-x', pctX);

      if (reticle) {
        reticle.style.left = pctX;
        reticle.style.top = pctY;
        reticle.style.transform = 'translate3d(-50%, -50%, 0)';
        reticle.style.opacity = pointerActive ? '1' : '0';
      }
    };

    const tick = (now: number) => {
      const elapsed = (now - startTime) * 0.001;

      if (!pointerActive && !prefersReducedMotion) {
        // Gentle orbital figure-eight sweep on mobile/touch or prior to mouse interaction
        targetX = 0.5 + Math.sin(elapsed * 0.48) * (isTouchOnly ? 0.24 : 0.18);
        targetY = 0.46 + Math.sin(elapsed * 0.96) * 0.12;
      }

      const ease = prefersReducedMotion ? 1 : 0.14;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      applyPosition(currentX, currentY);
      rafId = requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const rect = section.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerActive = true;
      targetX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      targetY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#060B19] pt-20 pb-24"
    >
      {/* High-resolution Deep Space Starfield Background */}
      <img
        src="/assets/aistudio/Hero_Background_Image_eabef50f.jpg"
        alt="Deep space Milky Way starfield observed through the Planetary Mirrors aperture"
        referrerPolicy="no-referrer"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center select-none"
      />

      {/* Near-pitch-black 96% opacity veil with mouse-tracking radial spotlight */}
      <div
        ref={veilRef}
        aria-hidden="true"
        className="hero-flashlight-veil pointer-events-none absolute inset-0"
      />

      {/* Subtle Electric Cyan outer illumination halo */}
      <div
        ref={haloRef}
        aria-hidden="true"
        className="hero-flashlight-halo pointer-events-none absolute inset-0"
      />

      {/* Precision Electric Cyan Optical Reticle tracking pointer on desktop */}
      <div
        ref={reticleRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden md:block h-28 w-28 rounded-full border border-[#23A9F2]/35 transition-opacity duration-300"
        style={{ opacity: 0, transform: 'translate3d(-50%, -50%, 0)' }}
      >
        <div className="absolute inset-4 rounded-full border border-[#23A9F2]/20" />
        <div className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-[#23A9F2]/60" />
        <div className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-[#23A9F2]/60" />
        <div className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-[#23A9F2]/60" />
        <div className="absolute right-0 top-1/2 h-px w-2 -translate-y-1/2 bg-[#23A9F2]/60" />
      </div>

      {/* Crisp Foreground Editorial Content */}
      <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <p className="font-mono-tabular mb-5 text-xs sm:text-sm tracking-[0.26em] text-[#94A3B8] uppercase">
          ORBITAL COMPARATIVE OBSERVATORY
        </p>

        <h1
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[0.12em] uppercase leading-[1.08]"
          style={{
            textWrap: 'balance',
            background: 'linear-gradient(180deg, #F8FAFC 25%, #CBD5E1 68%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 8px 32px rgba(6, 11, 25, 0.85))',
          }}
        >
          PLANETARY MIRRORS
        </h1>

        <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#94A3B8]">
          Exploring the geological twins of our solar system—where Earth&apos;s extreme frontiers
          reflect the mysteries of the Moon and Mars.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onEnterObservatory}
            className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#F4A938] px-7 py-3 text-sm font-bold tracking-[0.06em] text-[#060B19] uppercase transition-all duration-200 hover:bg-[#f7b959] hover:shadow-[0_0_26px_rgba(244,169,56,0.4)] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A938]"
          >
            <span>Enter the Observatory</span>
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onExploreStack}
            className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full border border-[#23A9F2] bg-[#102347]/65 px-7 py-3 text-sm font-semibold tracking-[0.06em] text-[#F8FAFC] uppercase transition-all duration-200 hover:bg-[#23A9F2]/15 hover:shadow-[0_0_22px_rgba(35,169,242,0.28)] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23A9F2]"
          >
            <Layers className="h-4 w-4 text-[#23A9F2]" aria-hidden="true" />
            <span>Explore the Stack</span>
          </button>
        </div>

        {/* Subtle interaction hint */}
        <p className="mt-8 hidden sm:block font-mono-tabular text-[11px] tracking-[0.18em] text-[#94A3B8]/80 uppercase">
          Sweep cursor to illuminate deep-field sky · Scroll to inspect planetary strata
        </p>
        <p className="mt-7 sm:hidden font-mono-tabular text-[11px] tracking-[0.16em] text-[#94A3B8]/80 uppercase">
          Orbital aperture active · Scroll to explore
        </p>
      </div>

      {/* Bottom-Right Official NASA Space Apps Challenge Insignia */}
      <div className="absolute bottom-6 right-6 z-20">
        <NasaBadge />
      </div>
    </section>
  );
}
