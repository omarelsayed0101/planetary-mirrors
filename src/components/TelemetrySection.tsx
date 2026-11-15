import { useEffect, useMemo, useState } from 'react';
import { computeTelemetrySnapshot, type TelemetrySnapshot } from '../utils/planetaryLogic';

function buildSparklinePoints(baseValues: number[], width: number, height: number): string {
  const min = Math.min(...baseValues);
  const max = Math.max(...baseValues);
  const span = max - min || 1;
  return baseValues
    .map((val, idx) => {
      const x = (idx / Math.max(1, baseValues.length - 1)) * width;
      const y = height - ((val - min) / span) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function TelemetrySection() {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [historyTick, setHistoryTick] = useState<number>(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
      setHistoryTick((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const snapshot: TelemetrySnapshot = useMemo(() => computeTelemetrySnapshot(nowMs), [nowMs]);

  // Deterministic 14-point rolling telemetry series for crisp SVG wave visualizers
  const series = useMemo(() => {
    const earthFlux: number[] = [];
    const moonTemp: number[] = [];
    const marsThermal: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const past = computeTelemetrySnapshot(nowMs - i * 4000);
      earthFlux.push(past.planets.earth.solarFluxWm2);
      moonTemp.push(past.planets.moon.surfaceTempC);
      marsThermal.push(past.planets.mars.surfaceTempC);
    }
    return { earthFlux, moonTemp, marsThermal };
  }, [nowMs, historyTick]);

  const earthCards = [
    snapshot.planets.earth,
    snapshot.planets.moon,
    snapshot.planets.mars,
  ];

  return (
    <section
      id="telemetry"
      className="relative scroll-mt-16 border-t border-[#94A3B8]/20 bg-[#060B19] py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Row + Live Stream Status Indicator */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-tabular text-xs tracking-[0.22em] text-[#23A9F2] uppercase">
              02 · Mission Control Telemetry
            </p>
            <h2
              className="font-display mt-2 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[0.06em] text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              Real-Time Planetary Conditions
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-2.5 rounded-lg border border-[#23A9F2]/35 bg-[#102347]/80 px-3.5 py-2">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#23A9F2] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#23A9F2]" />
              </span>
              <span className="font-mono-tabular text-xs font-semibold tracking-[0.14em] text-[#F8FAFC] uppercase">
                LIVE TELEMETRY STREAM
              </span>
            </div>
            <span className="font-mono-tabular text-xs text-[#94A3B8]">
              {snapshot.timestampUtc}
            </span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Top 3 Planetary Columns */}
          {earthCards.map((planet) => {
            const isMars = planet.id === 'mars';
            const accentColor = isMars ? '#D95A2B' : '#23A9F2';
            const sparkData =
              planet.id === 'earth'
                ? series.earthFlux
                : planet.id === 'moon'
                ? series.moonTemp
                : series.marsThermal;
            const sparkPoints = buildSparklinePoints(sparkData, 260, 44);

            return (
              <article
                key={planet.id}
                className={`lg:col-span-4 flex flex-col justify-between rounded-xl border bg-[#102347]/70 p-6 transition-colors duration-200 ${
                  isMars
                    ? 'border-[#D95A2B]/40 hover:border-[#D95A2B]'
                    : 'border-[#94A3B8]/25 hover:border-[#23A9F2]'
                }`}
              >
                <div>
                  {/* Card Title & Coordinates */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#94A3B8]/15 pb-4">
                    <div>
                      <p
                        className="font-mono-tabular text-[11px] uppercase tracking-[0.18em]"
                        style={{ color: accentColor }}
                      >
                        {planet.station}
                      </p>
                      <h3 className="font-display mt-1 text-2xl font-semibold text-[#F8FAFC]">
                        {planet.name}
                      </h3>
                    </div>
                    <span className="font-mono-tabular text-[11px] text-[#94A3B8]">
                      {planet.coordinates}
                    </span>
                  </div>

                  {/* Primary Metric: Surface Temperature */}
                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <p className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#94A3B8]">
                        Surface Temperature
                      </p>
                      <p className="font-mono-tabular mt-1 text-3xl font-bold text-[#F8FAFC]">
                        {planet.surfaceTempC > 0 ? `+${planet.surfaceTempC}` : planet.surfaceTempC}
                        <span className="ml-1 text-sm font-normal text-[#94A3B8]">°C</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#94A3B8]">
                        Absolute
                      </p>
                      <p className="font-mono-tabular mt-1 text-lg font-semibold text-[#94A3B8]">
                        {planet.surfaceTempK} <span className="text-xs">K</span>
                      </p>
                    </div>
                  </div>

                  {/* Live Telemetry Waveform */}
                  <div className="mt-4 rounded-lg border border-[#94A3B8]/15 bg-[#060B19]/65 p-3">
                    <div className="mb-1.5 flex items-center justify-between font-mono-tabular text-[10px] uppercase tracking-wider text-[#94A3B8]">
                      <span>
                        {planet.id === 'earth'
                          ? 'Irradiance Stability'
                          : planet.id === 'moon'
                          ? 'Rim Thermal Profile'
                          : 'Diurnal Thermal Drift'}
                      </span>
                      <span style={{ color: accentColor }}>{planet.statusLabel}</span>
                    </div>
                    <svg
                      viewBox="0 0 260 44"
                      className="h-11 w-full overflow-visible"
                      aria-hidden="true"
                    >
                      <polyline
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={sparkPoints}
                      />
                    </svg>
                  </div>

                  {/* Key Telemetry Matrix */}
                  <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[#94A3B8]/15 pt-4">
                    <div>
                      <dt className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#94A3B8]">
                        Atm. Pressure
                      </dt>
                      <dd className="font-mono-tabular mt-1 text-base font-semibold text-[#F8FAFC]">
                        {planet.pressurePa < 0.01
                          ? `${planet.pressurePa.toExponential(1)} Pa`
                          : `${planet.pressurePa.toLocaleString()} Pa`}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#94A3B8]">
                        Solar Flux
                      </dt>
                      <dd className="font-mono-tabular mt-1 text-base font-semibold text-[#F8FAFC]">
                        {planet.solarFluxWm2} <span className="text-xs text-[#94A3B8]">W/m²</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#94A3B8]">
                        Local Gravity
                      </dt>
                      <dd className="font-mono-tabular mt-1 text-base font-semibold text-[#F8FAFC]">
                        {planet.gravityMs2.toFixed(2)}{' '}
                        <span className="text-xs text-[#94A3B8]">m/s²</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#94A3B8]">
                        {isMars ? 'Dust Opacity (τ)' : 'Bond Albedo'}
                      </dt>
                      <dd
                        className="font-mono-tabular mt-1 text-base font-semibold"
                        style={{ color: isMars ? '#D95A2B' : '#23A9F2' }}
                      >
                        {isMars ? `${planet.dustOpacityTau} τ` : planet.albedo.toFixed(2)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>
            );
          })}

          {/* Bottom Bento Row: Earth-Mars Signal Light Delay & Comparative Gravity Bar */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-[#23A9F2]/30 bg-[#102347]/65 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="font-mono-tabular text-xs uppercase tracking-[0.18em] text-[#23A9F2]">
                  Deep Space Optical Link
                </p>
                <h3 className="font-display mt-1 text-xl font-semibold text-[#F8FAFC]">
                  Earth–Mars One-Way Light Delay
                </h3>
              </div>
              <div className="text-right">
                <span className="font-mono-tabular text-3xl font-bold text-[#F4A938]">
                  {snapshot.earthMarsLightDelayMin.toFixed(2)}
                </span>
                <span className="ml-1.5 font-mono-tabular text-xs uppercase text-[#94A3B8]">
                  Minutes
                </span>
              </div>
            </div>

            {/* Orbital Distance Visual Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between font-mono-tabular text-xs text-[#94A3B8]">
                <span>EARTH (0.00 min)</span>
                <span>MOON ({snapshot.earthMoonLightDelaySec.toFixed(3)} sec)</span>
                <span className="text-[#D95A2B]">
                  MARS ({snapshot.earthMarsDistanceMkm}M km)
                </span>
              </div>
              <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[#060B19] border border-[#94A3B8]/20">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '68%',
                    background: 'linear-gradient(90deg, #23A9F2 0%, #F4A938 65%, #D95A2B 100%)',
                  }}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#94A3B8]">
                Photonic telemetry latency computed from instantaneous synodic orbital separation.
                Round-trip command verification to Jezero Crater currently requires{' '}
                <span className="font-mono-tabular text-[#F8FAFC]">
                  {(snapshot.earthMarsLightDelayMin * 2).toFixed(2)} min
                </span>
                .
              </p>
            </div>
          </div>

          {/* Right Bento Span: Atmospheric Pressure Scale Contrast */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#94A3B8]/20 bg-[#102347]/65 p-6">
            <div>
              <p className="font-mono-tabular text-xs uppercase tracking-[0.18em] text-[#D95A2B]">
                Barometric Parity Contrast
              </p>
              <h3 className="font-display mt-1 text-xl font-semibold text-[#F8FAFC]">
                Surface Pressure Ratio
              </h3>
            </div>

            <div className="mt-5 space-y-3.5">
              {[
                {
                  label: 'Earth · Atacama Altiplano',
                  pct: '75%',
                  val: `${snapshot.planets.earth.pressurePa.toLocaleString()} Pa`,
                  color: '#23A9F2',
                },
                {
                  label: 'Mars · Jezero Floor (0.8% Earth)',
                  pct: '9%',
                  val: `${snapshot.planets.mars.pressurePa} Pa`,
                  color: '#D95A2B',
                },
                {
                  label: 'Moon · Exospheric Vacuum',
                  pct: '1.5%',
                  val: '3.0×10⁻¹⁰ Pa',
                  color: '#94A3B8',
                },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between font-mono-tabular text-xs">
                    <span className="text-[#94A3B8]">{bar.label}</span>
                    <span className="font-semibold text-[#F8FAFC]">{bar.val}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-[#060B19]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: bar.pct, backgroundColor: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
