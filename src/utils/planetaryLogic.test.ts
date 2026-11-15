import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeStrataOffsets,
  computeTelemetrySnapshot,
  filterLogbookEntries,
  getAdjacentLogbookIndex,
  validateInquiryForm,
  type LogbookEntry,
} from './planetaryLogic';

test('computeTelemetrySnapshot returns physically consistent planetary metrics', () => {
  const snap = computeTelemetrySnapshot(Date.UTC(2026, 10, 15, 12, 0, 0));
  assert.ok(snap.timestampUtc.endsWith('UTC'));
  assert.equal(snap.planets.earth.gravityMs2, 9.81);
  assert.equal(snap.planets.moon.gravityMs2, 1.62);
  assert.equal(snap.planets.mars.gravityMs2, 3.72);
  assert.ok(snap.earthMarsLightDelayMin > 8 && snap.earthMarsLightDelayMin < 15);
  assert.ok(snap.planets.mars.surfaceTempC < 0);
  assert.ok(snap.planets.moon.pressurePa < 1e-6);
  assert.equal(
    Number((snap.planets.earth.surfaceTempC + 273.15).toFixed(1)),
    snap.planets.earth.surfaceTempK,
  );
});

test('computeStrataOffsets expands Moon upward and Earth downward symmetrically', () => {
  const compact = computeStrataOffsets(0, 'all');
  const exploded = computeStrataOffsets(100, 'all');
  assert.ok(exploded.moonY > compact.moonY);
  assert.ok(exploded.earthY < compact.earthY);
  assert.equal(compact.marsY, 0);
  assert.equal(exploded.marsY, 0);
  assert.ok(exploded.coreGap > compact.coreGap);

  const clampedHigh = computeStrataOffsets(200, 'all');
  assert.equal(clampedHigh.moonY, exploded.moonY);
});

test('filterLogbookEntries filters cleanly by category and preserves All Entries', () => {
  const sample: LogbookEntry[] = [
    {
      id: '1',
      entryCode: 'LOG // 041',
      title: 'Lunar Pole',
      category: 'Lunar Surface',
      coordinates: '89° S',
      captureDate: '2026-10-01',
      instrument: 'LRO NAC',
      imageSrc: '/a.jpg',
      imageAlt: 'Lunar pole',
      summary: 'Summary',
      expeditionNotes: 'Notes',
      spectralTags: ['750nm'],
    },
    {
      id: '2',
      entryCode: 'LOG // 042',
      title: 'Jezero Delta',
      category: 'Martian Terrain',
      coordinates: '18° N',
      captureDate: '2026-10-02',
      instrument: 'HiRISE',
      imageSrc: '/b.jpg',
      imageAlt: 'Jezero',
      summary: 'Summary',
      expeditionNotes: 'Notes',
      spectralTags: ['IR'],
    },
  ];

  assert.equal(filterLogbookEntries(sample, 'All Entries').length, 2);
  assert.equal(filterLogbookEntries(sample, 'Lunar Surface').length, 1);
  assert.equal(filterLogbookEntries(sample, 'Earth Analogues').length, 0);
});

test('getAdjacentLogbookIndex wraps circularly across bounds', () => {
  assert.equal(getAdjacentLogbookIndex(0, 'prev', 5), 4);
  assert.equal(getAdjacentLogbookIndex(4, 'next', 5), 0);
  assert.equal(getAdjacentLogbookIndex(2, 'next', 5), 3);
  assert.equal(getAdjacentLogbookIndex(0, 'next', 0), -1);
});

test('validateInquiryForm rejects invalid inputs and accepts complete briefs', () => {
  const bad = validateInquiryForm({
    name: '',
    institution: 'A',
    email: 'not-an-email',
    interest: '',
    brief: 'too short',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.name);
  assert.ok(bad.errors.institution);
  assert.ok(bad.errors.email);
  assert.ok(bad.errors.interest);
  assert.ok(bad.errors.brief);

  const good = validateInquiryForm({
    name: 'Dr. Elena Vance',
    institution: 'Jet Propulsion Laboratory',
    email: 'elena.vance@jpl.nasa.gov',
    interest: 'Earth-Mars Analogue Fieldwork',
    brief: 'Requesting spectral baseline data for Atacama-Jezero biosignature parity.',
  });
  assert.equal(good.valid, true);
  assert.deepEqual(good.errors, {});
});
