import earthAtacamaImg from '../assets/images/earth_atacama_delta_1794775579216.jpg';
import marsJezeroImg from '../assets/images/mars_jezero_delta_1794775579546.jpg';
import earthDevonImg from '../assets/images/earth_devon_arctic_1794775580313.jpg';
import marsGaleImg from '../assets/images/mars_gale_crater_1794775579825.jpg';
import earthMaunaLoaImg from '../assets/images/earth_mauna_loa_1794775580568.jpg';
import marsTharsisImg from '../assets/images/mars_tharsis_caldera_1794775581114.jpg';
import antarcticaValleysImg from '../assets/images/antarctica_dry_valleys_1794775581963.jpg';
import marsPlanumImg from '../assets/images/mars_planum_boreum_1794775581398.jpg';
import lunarShackletonImg from '../assets/images/lunar_shackleton_rim_1794775581634.jpg';

import type { LogbookEntry, StratumLayerId } from '../utils/planetaryLogic';

export interface StratumSpec {
  id: Exclude<StratumLayerId, 'all'>;
  label: string;
  bodyName: string;
  radiusKm: string;
  crustComposition: string;
  coreState: string;
  accentHex: string;
  description: string;
}

export interface ModelCalloutPin {
  id: string;
  title: string;
  body: Exclude<StratumLayerId, 'all'>;
  coordinates: string;
  elevation: string;
  specSummary: string;
  mineralSignature: string;
  /** Local 3D anchor relative to the stratum group center */
  localAnchor: [number, number, number];
}

export interface PlanetaryAnaloguePair {
  id: string;
  tabTitle: string;
  earthLocation: string;
  marsLocation: string;
  shortThesis: string;
  similarityIndex: number;
  earthImage: string;
  marsImage: string;
  earthCoords: string;
  marsCoords: string;
  scientificInsight: string;
  parityMetrics: {
    label: string;
    earthValue: string;
    marsValue: string;
  }[];
}

export const STRATA_SPECS: Record<Exclude<StratumLayerId, 'all'>, StratumSpec> = {
  moon: {
    id: 'moon',
    label: 'Lunar Core',
    bodyName: 'Luna · South Polar Terrane',
    radiusKm: '1,737.4 km',
    crustComposition: 'Anorthositic Highland Breccia & Ilmenite Regolith',
    coreState: 'Partially Molten Fe-Ni Boundary (330 km Inner Solid)',
    accentHex: '#94A3B8',
    description:
      'A desiccated, impact-sculpted crust preserving 4.4 billion years of solar-system bombardment and permanently shadowed polar water-ice traps.',
  },
  mars: {
    id: 'mars',
    label: 'Martian Crust',
    bodyName: 'Mars · Tharsis & Marineris Belt',
    radiusKm: '3,389.5 km',
    crustComposition: 'Iron-Oxide Basalt, Phyllosilicates & Sulfate Evaporites',
    coreState: 'Liquid Fe-S-O Alloy Core (1,830 km Radius)',
    accentHex: '#D95A2B',
    description:
      'Stagnant-lid volcanic lithosphere supporting the tallest shield volcanoes and deepest tectonic canyon systems in the inner solar system.',
  },
  earth: {
    id: 'earth',
    label: 'Terrestrial Mirror',
    bodyName: 'Earth · Extreme Analogue Lithosphere',
    radiusKm: '6,371.0 km',
    crustComposition: 'Silicate Continental Plates & Oceanic Basalt',
    coreState: 'Active Geodynamo · Convecting Outer Fe-Ni Core',
    accentHex: '#23A9F2',
    description:
      'Hyper-arid salt basins, polar permafrost craters, and basaltic shield calderas act as natural laboratories mirroring early Lunar and Martian evolution.',
  },
};

export const MODEL_CALLOUT_PINS: ModelCalloutPin[] = [
  {
    id: 'shackleton',
    title: 'Shackleton Crater Rim',
    body: 'moon',
    coordinates: '89.54° S · 129.78° E',
    elevation: '+1.8 km Ridge / -4.2 km Floor',
    specSummary:
      'Receives ~86% continuous solar illumination on the rim while its interior remains at 40 K in permanent shadow, trapping pristine volatile ices.',
    mineralSignature: 'Pure Anorthosite · H2O Frost Traces',
    localAnchor: [1.36, 0.2, 0.25],
  },
  {
    id: 'olympus',
    title: 'Olympus Mons Caldera',
    body: 'mars',
    coordinates: '18.65° N · 226.2° E',
    elevation: '+21.9 km Shield Summit',
    specSummary:
      'Nested volcanic collapse craters formed over a stationary mantle plume, directly analogous to Hawaiian shield volcanism without plate drift.',
    mineralSignature: 'Tholeiitic Basalt · Olivine Gabbro',
    localAnchor: [-1.45, 0.24, 0.25],
  },
  {
    id: 'marineris',
    title: 'Valles Marineris Rift',
    body: 'mars',
    coordinates: '13.9° S · 300.8° E',
    elevation: '-7.0 km Canyon Floor',
    specSummary:
      'A 4,000 km tectonic extensional fracture exposing layered crustal stratigraphy and hydrated sulfate mineral horizons.',
    mineralSignature: 'Polyhydrated Sulfates · Ferric Oxide',
    localAnchor: [1.5, -0.02, 0.2],
  },
  {
    id: 'atacama-mirror',
    title: 'Atacama–Basin Analogue',
    body: 'earth',
    coordinates: '23.86° S · 69.13° W',
    elevation: '+2.4 km Hyper-Arid Altiplano',
    specSummary:
      'UV-irradiated nitrate and perchlorate crusts preserve endolithic biosignatures under Mars-like desiccation regimes.',
    mineralSignature: 'Halite · Gypsum · Perchlorate Crust',
    localAnchor: [-1.52, 0.05, 0.22],
  },
];

export const PLANETARY_ANALOGUES: PlanetaryAnaloguePair[] = [
  {
    id: 'atacama-jezero',
    tabTitle: 'Atacama ↔ Jezero',
    earthLocation: 'Atacama Desert, Chile',
    marsLocation: 'Jezero Crater, Mars',
    shortThesis: 'Hyper-arid soil chemistry & microbial biosignature preservation',
    similarityIndex: 94.8,
    earthImage: earthAtacamaImg,
    marsImage: marsJezeroImg,
    earthCoords: '23.86° S, 69.13° W',
    marsCoords: '18.38° N, 77.58° E',
    scientificInsight:
      'Both basins preserve dendritic paleochannels terminating in evaporite salt pans. Extremely low precipitation (< 2 mm/yr in Yungay) concentrates perchlorates and clays identical to Jezero’s western fan deposits, making Atacama the premier calibration testbed for Raman organic biosignature detection.',
    parityMetrics: [
      { label: 'Dominant Evaporite', earthValue: 'Halite / Gypsum', marsValue: 'Mg-Carbonate / Sulfate' },
      { label: 'UV Irradiance Peak', earthValue: '1,040 W/m²', marsValue: '590 W/m² (Unfiltered UVC)' },
      { label: 'Soil Moisture Index', earthValue: '< 0.8% wt', marsValue: '< 0.2% wt (Adsorbed)' },
    ],
  },
  {
    id: 'devon-gale',
    tabTitle: 'Devon Island ↔ Gale',
    earthLocation: 'Devon Island, Arctic Canada',
    marsLocation: 'Gale Crater, Mars',
    shortThesis: 'Polar impact craters & permafrost geology',
    similarityIndex: 91.4,
    earthImage: earthDevonImg,
    marsImage: marsGaleImg,
    earthCoords: '75.43° N, 89.68° W',
    marsCoords: '5.4° S, 137.8° E',
    scientificInsight:
      'Haughton Crater’s 23 km impact basin exposes shattered breccia and patterned permafrost polygons carved by seasonal meltwater gullies—mirroring the basal mudstone strata and wind-sculpted Aeolis Mons sediments investigated inside Gale Crater.',
    parityMetrics: [
      { label: 'Crater Diameter', earthValue: '23 km (Haughton)', marsValue: '154 km (Gale)' },
      { label: 'Mean Annual Temp', earthValue: '-16.0 °C', marsValue: '-58.0 °C' },
      { label: 'Structural Feature', earthValue: 'Impact Breccia Melt', marsValue: 'Central Peak Strata' },
    ],
  },
  {
    id: 'hawaii-tharsis',
    tabTitle: 'Hawaii ↔ Tharsis',
    earthLocation: 'Haleakalā & Mauna Loa, Hawaii',
    marsLocation: 'Tharsis Montes, Mars',
    shortThesis: 'Basaltic shield volcanism & lava tube habitats',
    similarityIndex: 93.2,
    earthImage: earthMaunaLoaImg,
    marsImage: marsTharsisImg,
    earthCoords: '19.47° N, 155.60° W',
    marsCoords: '1.5° N, 247.5° E',
    scientificInsight:
      'Low-viscosity basaltic eruptions build broad, gently sloping shield volcanoes topped by nested collapse calderas and subsurface pyroduct lava tubes. Lower Martian gravity allows subterranean conduits up to 10× wider—ideal for radiation-shielded human habitats.',
    parityMetrics: [
      { label: 'Magma Chemistry', earthValue: 'Tholeiitic Basalt', marsValue: 'Fe-Rich Basalt' },
      { label: 'Shield Slope Angle', earthValue: '4° – 6°', marsValue: '4° – 5°' },
      { label: 'Lava Tube Span', earthValue: '10 – 30 m', marsValue: '100 – 250 m' },
    ],
  },
  {
    id: 'antarctica-boreum',
    tabTitle: 'Antarctica ↔ Planum Boreum',
    earthLocation: 'Dry Valleys, Antarctica',
    marsLocation: 'Planum Boreum, Mars',
    shortThesis: 'Sub-zero katabatic winds & subsurface ice sheets',
    similarityIndex: 96.1,
    earthImage: antarcticaValleysImg,
    marsImage: marsPlanumImg,
    earthCoords: '77.47° S, 162.52° E',
    marsCoords: '88.0° N, 15.0° E',
    scientificInsight:
      'McMurdo’s ice-free valleys experience fierce katabatic winds that sublimate surface snow while preserving ancient buried glacier ice under arid dolerite lag—directly mirroring the spiral ablation troughs and alternating ice-dust stratigraphy of Chasma Boreale.',
    parityMetrics: [
      { label: 'Peak Katabatic Wind', earthValue: '320 km/h', marsValue: '110 km/h (Low Density)' },
      { label: 'Ice Stratigraphy', earthValue: 'Glacial Firn + Tephra', marsValue: 'H2O Ice + CO2 / Dust' },
      { label: 'Sublimation Regime', earthValue: 'Hyper-Arid Cryo', marsValue: 'Direct Vapor Sublimation' },
    ],
  },
];

export const LOGBOOK_ENTRIES: LogbookEntry[] = [
  {
    id: 'log-042',
    entryCode: 'LOG // 042',
    title: 'Shackleton Rim Illumination Threshold',
    category: 'Lunar Surface',
    coordinates: '89.54° S, 129.78° E',
    captureDate: '2026-10-18',
    instrument: 'LRO Narrow Angle Camera · 0.5m/px',
    imageSrc: lunarShackletonImg,
    imageAlt: 'Shackleton Crater rim illuminated above permanently shadowed lunar floor',
    summary:
      'High-oblique solar grazing angle along the 21 km Shackleton rim creates a stark thermal boundary between sunlit ridges and 40 K cold traps.',
    expeditionNotes:
      'Comparative orbital photometry confirms uninterrupted solar power corridors spanning >300 days per lunar year along the connecting ridge toward Malapert Massif, while interior floor radar returns indicate surficial water-ice deposits mixed with highland anorthosite.',
    spectralTags: ['750nm Albedo', 'LRO-NAC', 'Cryo-Trap'],
  },
  {
    id: 'log-043',
    entryCode: 'LOG // 043',
    title: 'Jezero Western Delta Paleochannels',
    category: 'Martian Terrain',
    coordinates: '18.38° N, 77.58° E',
    captureDate: '2026-10-22',
    instrument: 'MRO HiRISE · IRB False-Color Mosaic',
    imageSrc: marsJezeroImg,
    imageAlt: 'Jezero Crater ancient river delta paleochannels on Mars',
    summary:
      'Inverted fluvial ridges trace Noachian river braiding into an ancient crater lake basin rich in smectite clays and Mg-carbonates.',
    expeditionNotes:
      'Cross-referencing terrestrial alluvial fans from the Atacama Altiplano reveals identical cementation profiles along meander cutoffs. Fine-grained lacustrine mudstones at the delta front represent top-tier targets for ancient organic macromolecule preservation.',
    spectralTags: ['CRISM Phyllosilicate', 'HiRISE 25cm', 'Deltaic'],
  },
  {
    id: 'log-044',
    entryCode: 'LOG // 044',
    title: 'Atacama Salar Evaporite Horizon',
    category: 'Earth Analogues',
    coordinates: '23.86° S, 69.13° W',
    captureDate: '2026-10-29',
    instrument: 'Landsat-9 OLI-2 · Multispectral',
    imageSrc: earthAtacamaImg,
    imageAlt: 'Atacama Desert salt flats and dry dendritic river channels',
    summary:
      'Dendritic arroyos terminate in crystalline halite and sulfate flats formed under extreme solar UV and multi-year drought cycles.',
    expeditionNotes:
      'Field core samples extracted 40 cm beneath the halite crust host halophilic archaea surviving solely on deliquescent atmospheric moisture—establishing terrestrial survival baselines for Martian subsurface brine hypotheses.',
    spectralTags: ['SWIR-2.2μm', 'Halite Crust', 'Biosignature'],
  },
  {
    id: 'log-045',
    entryCode: 'LOG // 045',
    title: 'Chasma Boreale Polar Spiral Troughs',
    category: 'Orbital Scans',
    coordinates: '84.6° N, 342.1° E',
    captureDate: '2026-11-02',
    instrument: 'MRO CTX + SHARAD Radar Sounder',
    imageSrc: marsPlanumImg,
    imageAlt: 'Mars north polar ice cap spiral troughs and dust strata',
    summary:
      'Katabatic spiral winds carve kilomete-scale ablation scarps exposing 4 million years of alternating water-ice and ferric dust climate cycles.',
    expeditionNotes:
      'Radar reflectors mapped down to 1.6 km depth align directly with orbital obliquity cycles, functioning as an extraterrestrial ice-core climate archive analogous to East Antarctic dome stratigraphy.',
    spectralTags: ['SHARAD 20MHz', 'Polar Cap', 'Obliquity Record'],
  },
  {
    id: 'log-046',
    entryCode: 'LOG // 046',
    title: 'Aeolis Mons Aeolian Dune Migration',
    category: 'Martian Terrain',
    coordinates: '5.4° S, 137.8° E',
    captureDate: '2026-11-04',
    instrument: 'MRO HiRISE · Stereo DEM',
    imageSrc: marsGaleImg,
    imageAlt: 'Gale Crater dark basaltic sand dunes beside layered sedimentary cliffs',
    summary:
      'Dark, mafic barchan dunes sweep across the basal sulfate-bearing strata of Mount Sharp inside Gale Crater.',
    expeditionNotes:
      'Multi-year orbital change detection records 0.4 meters of crest migration per Martian year despite 6 mbar surface pressure, calibrating saltation physics models against high-altitude terrestrial desert dunes.',
    spectralTags: ['Mafic Sand', 'Stereo-DEM', 'Aeolian'],
  },
  {
    id: 'log-047',
    entryCode: 'LOG // 047',
    title: 'Haughton Breccia & Permafrost Polygons',
    category: 'Earth Analogues',
    coordinates: '75.43° N, 89.68° W',
    captureDate: '2026-11-07',
    instrument: 'Sentinel-2B · Arctic Polar Pass',
    imageSrc: earthDevonImg,
    imageAlt: 'Haughton Crater on Devon Island in the Canadian High Arctic',
    summary:
      'Cryogenic thermal contraction polygons fracture carbonate impact breccia across the barren interior of Devon Island.',
    expeditionNotes:
      'Used jointly by NASA Haughton-Mars Project teams to validate autonomous rover traverse algorithms and pressurized EVA suit dust-mitigation seals across sharp fractured regolith.',
    spectralTags: ['Permafrost', 'Impact Melt', 'EVA Testbed'],
  },
  {
    id: 'log-048',
    entryCode: 'LOG // 048',
    title: 'Tharsis Rift & Shield Collapse Complex',
    category: 'Orbital Scans',
    coordinates: '11.2° S, 265.4° E',
    captureDate: '2026-11-10',
    instrument: 'Mars Express HRSC · Limb Oblique',
    imageSrc: marsTharsisImg,
    imageAlt: 'Tharsis shield caldera and tectonic canyon fractures on Mars',
    summary:
      'Limb-angled orbital mosaic capturing concentric caldera collapse terraces feeding sinuous lava channels toward western Marineris.',
    expeditionNotes:
      'Collapsed skylight pits along the flank channels indicate intact subterranean basaltic conduits shielded from galactic cosmic rays.',
    spectralTags: ['HRSC Limb', 'Caldera', 'Lava Skylight'],
  },
  {
    id: 'log-049',
    entryCode: 'LOG // 049',
    title: 'McMurdo Dry Valleys Sublimation Frontier',
    category: 'Earth Analogues',
    coordinates: '77.47° S, 162.52° E',
    captureDate: '2026-11-12',
    instrument: 'WorldView-3 · Polar Sub-Meter',
    imageSrc: antarcticaValleysImg,
    imageAlt: 'McMurdo Dry Valleys exposed bedrock beside Antarctic glacial ice',
    summary:
      'Ancient ice-cemented dolerite scree bordered by blue glacial tongues illustrates Mars-relevant dry-cryogenic weathering.',
    expeditionNotes:
      'Subsurface ice tables lie just 15–30 cm below dry sandy overburden, providing direct geophysical calibration for Mars Phoenix and IceMapper shallow radar retrievals.',
    spectralTags: ['Dry Cryo', 'Dolerite Scree', 'Subsurface Ice'],
  },
];
