export type StratumLayerId = 'all' | 'moon' | 'mars' | 'earth';

export type LogbookCategory =
  | 'All Entries'
  | 'Lunar Surface'
  | 'Martian Terrain'
  | 'Earth Analogues'
  | 'Orbital Scans';

export interface TelemetryPlanetReading {
  id: 'earth' | 'moon' | 'mars';
  name: string;
  station: string;
  coordinates: string;
  surfaceTempC: number;
  surfaceTempK: number;
  pressurePa: number;
  solarFluxWm2: number;
  gravityMs2: number;
  lightDelayMin: number;
  dustOpacityTau?: number;
  albedo: number;
  statusLabel: string;
}

export interface TelemetrySnapshot {
  timestampUtc: string;
  earthMarsDistanceMkm: number;
  earthMarsLightDelayMin: number;
  earthMoonLightDelaySec: number;
  planets: {
    earth: TelemetryPlanetReading;
    moon: TelemetryPlanetReading;
    mars: TelemetryPlanetReading;
  };
}

export interface StrataOffsets {
  moonY: number;
  marsY: number;
  earthY: number;
  coreGap: number;
}

export interface LogbookEntry {
  id: string;
  entryCode: string;
  title: string;
  category: Exclude<LogbookCategory, 'All Entries'>;
  coordinates: string;
  captureDate: string;
  instrument: string;
  imageSrc: string;
  imageAlt: string;
  summary: string;
  expeditionNotes: string;
  spectralTags: string[];
}

export interface InquiryFormInput {
  name: string;
  institution: string;
  email: string;
  interest: string;
  brief: string;
}

export type InquiryFieldErrors = Partial<Record<keyof InquiryFormInput, string>>;

export interface InquiryValidationResult {
  valid: boolean;
  errors: InquiryFieldErrors;
}

const SPEED_OF_LIGHT_KM_PER_S = 299792.458;

/**
 * Computes deterministic, physically grounded telemetry readings for Earth (Atacama Base),
 * Moon (Lunar Gateway / Shackleton Rim), and Mars (Jezero Crater) at a given epoch timestamp.
 */
export function computeTelemetrySnapshot(epochMs: number): TelemetrySnapshot {
  const sec = epochMs / 1000;
  // Subtle harmonic oscillations representing diurnal thermal drift & sensor cadence
  const waveFast = Math.sin(sec * 0.35);
  const waveMed = Math.cos(sec * 0.14);
  const waveSlow = Math.sin(sec * 0.045);

  // Synodic Earth-Mars distance oscillation (~54.6M km to 401M km; realistic current window ~184M km)
  const earthMarsDistanceKm = 184_200_000 + waveSlow * 120_000 + waveMed * 8_500;
  const earthMarsLightDelayMin = Number(
    (earthMarsDistanceKm / SPEED_OF_LIGHT_KM_PER_S / 60).toFixed(2),
  );
  const earthMoonDistanceKm = 384_400 + waveMed * 420;
  const earthMoonLightDelaySec = Number(
    (earthMoonDistanceKm / SPEED_OF_LIGHT_KM_PER_S).toFixed(3),
  );

  const earthTempC = Number((18.4 + waveFast * 0.3 + waveMed * 0.8).toFixed(1));
  const moonTempC = Number((-128.6 + waveFast * 0.2 + waveSlow * 1.4).toFixed(1));
  const marsTempC = Number((-63.2 + waveFast * 0.4 + waveMed * 1.1).toFixed(1));

  const toKelvin = (c: number) => Number((c + 273.15).toFixed(1));

  return {
    timestampUtc: new Date(epochMs).toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    earthMarsDistanceMkm: Number((earthMarsDistanceKm / 1_000_000).toFixed(2)),
    earthMarsLightDelayMin,
    earthMoonLightDelaySec,
    planets: {
      earth: {
        id: 'earth',
        name: 'Earth',
        station: 'Atacama Base Reference',
        coordinates: '23.8634° S, 69.1328° W',
        surfaceTempC: earthTempC,
        surfaceTempK: toKelvin(earthTempC),
        pressurePa: Math.round(76420 + waveMed * 38),
        solarFluxWm2: Math.round(1042 + waveFast * 6),
        gravityMs2: 9.81,
        lightDelayMin: 0.0,
        albedo: 0.31,
        statusLabel: 'Reference Nominal',
      },
      moon: {
        id: 'moon',
        name: 'The Moon',
        station: 'Lunar Gateway · Shackleton Rim',
        coordinates: '89.54° S, 129.78° E',
        surfaceTempC: moonTempC,
        surfaceTempK: toKelvin(moonTempC),
        pressurePa: 0.0000000003,
        solarFluxWm2: Math.round(1361 + waveSlow * 3),
        gravityMs2: 1.62,
        lightDelayMin: Number((earthMoonLightDelaySec / 60).toFixed(3)),
        albedo: 0.12,
        statusLabel: 'Cryo Rim Illuminated',
      },
      mars: {
        id: 'mars',
        name: 'Mars',
        station: 'Jezero Crater · Perseverance Sector',
        coordinates: '18.38° N, 77.58° E',
        surfaceTempC: marsTempC,
        surfaceTempK: toKelvin(marsTempC),
        pressurePa: Math.round(638 + waveMed * 11),
        solarFluxWm2: Math.round(586 + waveFast * 5),
        gravityMs2: 3.72,
        lightDelayMin: earthMarsLightDelayMin,
        dustOpacityTau: Number((0.48 + (waveMed + 1) * 0.09).toFixed(2)),
        albedo: 0.25,
        statusLabel: 'Aeolian Dust Moderate',
      },
    },
  };
}

/**
 * Computes vertical Y offsets for the stacked Moon / Mars / Earth 3D cross-sections
 * based on explode slider percentage (0..100) and focused stratum layer.
 */
export function computeStrataOffsets(
  explodePercent: number,
  focusedLayer: StratumLayerId,
): StrataOffsets {
  const clamped = Math.max(0, Math.min(100, explodePercent)) / 100;
  // Base compact stack positions match the Planetary Mirrors medallion spacing
  const baseMoonY = 1.18;
  const baseMarsY = 0.0;
  const baseEarthY = -1.18;

  const extraGap = clamped * 1.15;
  const focusShiftMoon = focusedLayer === 'moon' ? 0.18 : 0;
  const focusShiftEarth = focusedLayer === 'earth' ? -0.18 : 0;

  return {
    moonY: Number((baseMoonY + extraGap + focusShiftMoon).toFixed(3)),
    marsY: baseMarsY,
    earthY: Number((baseEarthY - extraGap + focusShiftEarth).toFixed(3)),
    coreGap: Number((clamped * 0.42).toFixed(3)),
  };
}

/**
 * Filters logbook archive entries by selected category.
 */
export function filterLogbookEntries(
  entries: LogbookEntry[],
  category: LogbookCategory,
): LogbookEntry[] {
  if (category === 'All Entries') {
    return entries;
  }
  return entries.filter((entry) => entry.category === category);
}

/**
 * Wraps lightbox index safely when stepping forward or backward.
 */
export function getAdjacentLogbookIndex(
  currentIndex: number,
  direction: 'prev' | 'next',
  total: number,
): number {
  if (total <= 0) return -1;
  if (direction === 'next') {
    return (currentIndex + 1) % total;
  }
  return (currentIndex - 1 + total) % total;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates the Research Inquiry portal form strictly without substituting fallback defaults.
 */
export function validateInquiryForm(input: InquiryFormInput): InquiryValidationResult {
  const errors: InquiryFieldErrors = {};

  if (!input.name.trim() || input.name.trim().length < 2) {
    errors.name = 'Enter your full name or principal investigator title.';
  }

  if (!input.institution.trim() || input.institution.trim().length < 2) {
    errors.institution = 'Specify your research institution, observatory, or agency.';
  }

  if (!input.email.trim() || !EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = 'Provide a valid institutional or mission email address.';
  }

  if (!input.interest.trim()) {
    errors.interest = 'Select a comparative research domain.';
  }

  if (!input.brief.trim() || input.brief.trim().length < 15) {
    errors.brief = 'Include a brief mission objective (at least 15 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
