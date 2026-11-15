import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Layers, RotateCcw, Sparkles } from 'lucide-react';
import {
  MODEL_CALLOUT_PINS,
  STRATA_SPECS,
  type ModelCalloutPin,
} from '../data/observatoryData';
import { computeStrataOffsets, type StratumLayerId } from '../utils/planetaryLogic';

interface SignatureModelSectionProps {
  explodePercent: number;
  onExplodeChange: (value: number) => void;
}

interface ProjectedPin {
  id: string;
  x: number;
  y: number;
  visible: boolean;
}

// Pre-allocated scratch math helpers (zero GC inside render loop)
const _projVec = new THREE.Vector3();
const _worldPos = new THREE.Vector3();

function createProceduralSurfaceTexture(
  type: 'moon' | 'mars' | 'earth',
  maxAnisotropy: number,
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Deterministic pseudo-random generator for reproducible geological detail
  let seed = type === 'moon' ? 104729 : type === 'mars' ? 224737 : 350377;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  if (type === 'moon') {
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(0, 0, size, size);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);

    // Basaltic maria patches
    for (let i = 0; i < 16; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 35 + rand() * 75;
      const grad = ctx.createRadialGradient(x, y, 4, x, y, r);
      grad.addColorStop(0, 'rgba(51, 65, 85, 0.72)');
      grad.addColorStop(1, 'rgba(51, 65, 85, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact craters with bright anorthositic rims
    for (let i = 0; i < 110; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 4 + rand() * 26;
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.45)';
      ctx.lineWidth = Math.max(1, r * 0.14);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.82, 0, Math.PI * 2);
      ctx.fill();

      bCtx.strokeStyle = '#ffffff';
      bCtx.lineWidth = Math.max(1.5, r * 0.18);
      bCtx.beginPath();
      bCtx.arc(x, y, r, 0, Math.PI * 2);
      bCtx.stroke();
      bCtx.fillStyle = '#303030';
      bCtx.beginPath();
      bCtx.arc(x, y, r * 0.8, 0, Math.PI * 2);
      bCtx.fill();
    }
  } else if (type === 'mars') {
    const baseGrad = ctx.createLinearGradient(0, 0, size, size);
    baseGrad.addColorStop(0, '#C85226');
    baseGrad.addColorStop(0.5, '#D95A2B');
    baseGrad.addColorStop(1, '#9A3412');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);

    bCtx.fillStyle = '#787878';
    bCtx.fillRect(0, 0, size, size);

    // Dark basaltic syrtis/dune plains
    for (let i = 0; i < 22; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const rx = 25 + rand() * 65;
      const ry = 15 + rand() * 40;
      ctx.fillStyle = 'rgba(67, 20, 7, 0.38)';
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tectonic canyon scar across the equatorial belt
    ctx.strokeStyle = 'rgba(42, 12, 4, 0.78)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(40, size * 0.52);
    ctx.bezierCurveTo(size * 0.35, size * 0.44, size * 0.65, size * 0.62, size - 40, size * 0.48);
    ctx.stroke();

    bCtx.strokeStyle = '#181818';
    bCtx.lineWidth = 14;
    bCtx.beginPath();
    bCtx.moveTo(40, size * 0.52);
    bCtx.bezierCurveTo(size * 0.35, size * 0.44, size * 0.65, size * 0.62, size - 40, size * 0.48);
    bCtx.stroke();

    // Rust craters and shield ridges
    for (let i = 0; i < 65; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 3 + rand() * 18;
      ctx.strokeStyle = 'rgba(253, 186, 116, 0.32)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();

      bCtx.strokeStyle = '#d4d4d4';
      bCtx.lineWidth = 2;
      bCtx.beginPath();
      bCtx.arc(x, y, r, 0, Math.PI * 2);
      bCtx.stroke();
    }
  } else {
    // Deep cobalt ocean base
    const oceanGrad = ctx.createRadialGradient(size * 0.5, size * 0.5, 20, size * 0.5, size * 0.5, size * 0.6);
    oceanGrad.addColorStop(0, '#0E4DA4');
    oceanGrad.addColorStop(1, '#06214D');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, size, size);

    bCtx.fillStyle = '#555555';
    bCtx.fillRect(0, 0, size, size);

    // Continental landmasses & arid Atacama-like shields
    for (let i = 0; i < 14; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const rx = 28 + rand() * 56;
      const ry = 22 + rand() * 48;
      ctx.fillStyle = i % 3 === 0 ? '#B4844E' : '#1E6F50';
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();

      bCtx.fillStyle = '#c8c8c8';
      bCtx.beginPath();
      bCtx.ellipse(x, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
      bCtx.fill();
    }

    // Swirling atmospheric cloud bands
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';
    ctx.lineWidth = 6;
    for (let i = 0; i < 9; i++) {
      const y = rand() * size;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.3, y - 22, size * 0.7, y + 22, size, y - 8);
      ctx.stroke();
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

function createCrossSectionTexture(accentHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(0.35, accentHex);
  grad.addColorStop(0.7, '#F4A938');
  grad.addColorStop(1, '#334155');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);

  // Geological strata lines
  ctx.strokeStyle = 'rgba(6, 11, 25, 0.45)';
  ctx.lineWidth = 2;
  for (let y = 16; y < 120; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export function SignatureModelSection({
  explodePercent,
  onExplodeChange,
}: SignatureModelSectionProps) {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const [focusedLayer, setFocusedLayer] = useState<StratumLayerId>('all');
  const [activePinId, setActivePinId] = useState<string>('shackleton');
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [projectedPins, setProjectedPins] = useState<ProjectedPin[]>([]);

  // Mutable refs read inside animation loop so React state changes never tear down WebGL
  const explodeRef = useRef(explodePercent);
  const focusRef = useRef<StratumLayerId>(focusedLayer);
  const resetCamRef = useRef<() => void>(() => {});

  useEffect(() => {
    explodeRef.current = explodePercent;
  }, [explodePercent]);

  useEffect(() => {
    focusRef.current = focusedLayer;
  }, [focusedLayer]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // Probe WebGL availability & software renderer
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 540;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b19, 0.035);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const defaultCamPos = new THREE.Vector3(0.3, 1.15, 8.6);
    camera.position.copy(defaultCamPos);

    // Studio reflection environment for brushed metal orbital bezel
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Warm/Cool 3-point lighting rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x060b19, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 2.2);
    keyLight.position.set(5, 6, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x23a9f2, 1.45);
    cyanRimLight.position.set(-5, -2, -4);
    scene.add(cyanRimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 5.2;
    controls.maxDistance = 11.5;
    controls.minPolarAngle = Math.PI * 0.25;
    controls.maxPolarAngle = Math.PI * 0.72;

    resetCamRef.current = () => {
      camera.position.copy(defaultCamPos);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const disposables: { dispose: () => void }[] = [];

    // Outer Planetary Mirrors Brushed Titanium Orbital Ring
    const orbitalFrameGroup = new THREE.Group();
    const outerRingGeo = new THREE.TorusGeometry(2.68, 0.11, 24, 96);
    const outerRingMat = new THREE.MeshPhysicalMaterial({
      color: 0xcbd5e1,
      metalness: 0.92,
      roughness: 0.18,
      anisotropy: 0.8,
      clearcoat: 0.6,
    });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    orbitalFrameGroup.add(outerRingMesh);

    const cyanGlowRingGeo = new THREE.TorusGeometry(2.54, 0.025, 16, 96);
    const cyanGlowRingMat = new THREE.MeshStandardMaterial({
      color: 0x23a9f2,
      emissive: 0x23a9f2,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
    const cyanGlowRingMesh = new THREE.Mesh(cyanGlowRingGeo, cyanGlowRingMat);
    orbitalFrameGroup.add(cyanGlowRingMesh);
    scene.add(orbitalFrameGroup);
    disposables.push(outerRingGeo, outerRingMat, cyanGlowRingGeo, cyanGlowRingMat);

    // Starlight dust particles (InstancedMesh > 20 items)
    const starCount = 120;
    const starGeo = new THREE.OctahedronGeometry(0.028, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const starInstanced = new THREE.InstancedMesh(starGeo, starMat, starCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < starCount; i++) {
      const theta = (i * 2.39996) % (Math.PI * 2);
      const radius = 3.2 + (i % 7) * 0.55;
      dummy.position.set(
        Math.cos(theta) * radius,
        ((i % 13) - 6) * 0.65,
        Math.sin(theta) * radius - 1.5,
      );
      dummy.scale.setScalar(0.5 + (i % 4) * 0.28);
      dummy.updateMatrix();
      starInstanced.setMatrixAt(i, dummy.matrix);
    }
    starInstanced.instanceMatrix.needsUpdate = true;
    starInstanced.computeBoundingSphere();
    scene.add(starInstanced);
    disposables.push(starGeo, starMat);

    // Composite Planetary Cross-Section Stack Group
    const stackGroup = new THREE.Group();
    stackGroup.scale.setScalar(0.86);
    scene.add(stackGroup);

    // Helper to build a rich 5+ part planetary stratum slice
    const moonTex = createProceduralSurfaceTexture('moon', maxAnisotropy);
    const marsTex = createProceduralSurfaceTexture('mars', maxAnisotropy);
    const earthTex = createProceduralSurfaceTexture('earth', maxAnisotropy);
    const moonCutTex = createCrossSectionTexture('#64748B');
    const marsCutTex = createCrossSectionTexture('#D95A2B');
    const earthCutTex = createCrossSectionTexture('#23A9F2');
    disposables.push(
      moonTex.map,
      moonTex.bumpMap,
      marsTex.map,
      marsTex.bumpMap,
      earthTex.map,
      earthTex.bumpMap,
      moonCutTex,
      marsCutTex,
      earthCutTex,
    );

    // 1. LUNAR STRATUM GROUP (Top)
    const moonGroup = new THREE.Group();
    const moonDiscGeo = new THREE.CylinderGeometry(1.42, 1.36, 0.22, 48);
    const moonDiscMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: moonTex.map,
      bumpMap: moonTex.bumpMap,
      bumpScale: 0.04,
      roughness: 0.85,
      metalness: 0.08,
    });
    const moonDisc = new THREE.Mesh(moonDiscGeo, moonDiscMat);
    moonGroup.add(moonDisc);

    const moonDomeGeo = new THREE.SphereGeometry(0.92, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const moonDome = new THREE.Mesh(moonDomeGeo, moonDiscMat);
    moonDome.position.y = 0.09;
    moonGroup.add(moonDome);

    // Underside molten core ring revealed during explode
    const moonCoreGeo = new THREE.CylinderGeometry(0.65, 0.45, 0.14, 32);
    const moonCoreMat = new THREE.MeshStandardMaterial({
      color: 0xf4a938,
      emissive: 0xd95a2b,
      emissiveIntensity: 0.85,
      roughness: 0.35,
      metalness: 0.4,
    });
    const moonCore = new THREE.Mesh(moonCoreGeo, moonCoreMat);
    moonCore.position.y = -0.14;
    moonGroup.add(moonCore);

    // Composite Lunar Lander miniature (4 parts) on lunar terrace
    const landerGroup = new THREE.Group();
    const landerBodyGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.12, 8);
    const landerGoldMat = new THREE.MeshStandardMaterial({
      color: 0xf4a938,
      metalness: 0.85,
      roughness: 0.25,
    });
    const landerBody = new THREE.Mesh(landerBodyGeo, landerGoldMat);
    landerBody.position.y = 0.08;
    landerGroup.add(landerBody);

    const landerCapGeo = new THREE.SphereGeometry(0.07, 12, 10);
    const landerWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      metalness: 0.2,
    });
    const landerCap = new THREE.Mesh(landerCapGeo, landerWhiteMat);
    landerCap.position.y = 0.16;
    landerGroup.add(landerCap);
    landerGroup.position.set(-0.98, 0.11, 0.45);
    moonGroup.add(landerGroup);

    disposables.push(
      moonDiscGeo,
      moonDiscMat,
      moonDomeGeo,
      moonCoreGeo,
      moonCoreMat,
      landerBodyGeo,
      landerGoldMat,
      landerCapGeo,
      landerWhiteMat,
    );

    // 2. MARTIAN STRATUM GROUP (Middle)
    const marsGroup = new THREE.Group();
    const marsDiscGeo = new THREE.CylinderGeometry(1.56, 1.5, 0.26, 48);
    const marsDiscMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marsTex.map,
      bumpMap: marsTex.bumpMap,
      bumpScale: 0.06,
      roughness: 0.82,
      metalness: 0.05,
    });
    const marsDisc = new THREE.Mesh(marsDiscGeo, marsDiscMat);
    marsGroup.add(marsDisc);

    const marsDomeGeo = new THREE.SphereGeometry(0.98, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.46);
    const marsDome = new THREE.Mesh(marsDomeGeo, marsDiscMat);
    marsDome.position.y = 0.11;
    marsGroup.add(marsDome);

    // Olympus Mons Shield Cone accent on left ridge
    const olympusGeo = new THREE.ConeGeometry(0.28, 0.24, 24);
    const olympusMat = new THREE.MeshStandardMaterial({
      color: 0xb93c18,
      roughness: 0.9,
      metalness: 0.05,
    });
    const olympusMesh = new THREE.Mesh(olympusGeo, olympusMat);
    olympusMesh.position.set(-1.02, 0.2, 0.45);
    marsGroup.add(olympusMesh);

    // Mantle cross-section collar
    const marsMantleGeo = new THREE.CylinderGeometry(1.15, 0.95, 0.16, 36);
    const marsMantleMat = new THREE.MeshStandardMaterial({
      map: marsCutTex,
      roughness: 0.55,
      metalness: 0.2,
    });
    const marsMantle = new THREE.Mesh(marsMantleGeo, marsMantleMat);
    marsMantle.position.y = -0.17;
    marsGroup.add(marsMantle);

    disposables.push(
      marsDiscGeo,
      marsDiscMat,
      marsDomeGeo,
      olympusGeo,
      olympusMat,
      marsMantleGeo,
      marsMantleMat,
    );

    // 3. EARTH TERRESTRIAL MIRROR GROUP (Bottom)
    const earthGroup = new THREE.Group();
    const earthDiscGeo = new THREE.CylinderGeometry(1.62, 1.54, 0.24, 48);
    const earthDiscMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: earthTex.map,
      bumpMap: earthTex.bumpMap,
      bumpScale: 0.035,
      roughness: 0.42,
      metalness: 0.12,
    });
    const earthDisc = new THREE.Mesh(earthDiscGeo, earthDiscMat);
    earthGroup.add(earthDisc);

    // Lower hemisphere ocean dome
    const earthBowlGeo = new THREE.SphereGeometry(
      1.18,
      40,
      24,
      0,
      Math.PI * 2,
      Math.PI * 0.52,
      Math.PI * 0.48,
    );
    const earthBowl = new THREE.Mesh(earthBowlGeo, earthDiscMat);
    earthBowl.position.y = -0.05;
    earthGroup.add(earthBowl);

    // Geodynamo cutaway collar on top of Earth disc (revealed when exploded)
    const earthCoreGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.12, 36);
    const earthCoreMat = new THREE.MeshStandardMaterial({
      map: earthCutTex,
      roughness: 0.3,
      metalness: 0.35,
      emissive: 0x0b3d91,
      emissiveIntensity: 0.45,
    });
    const earthCore = new THREE.Mesh(earthCoreGeo, earthCoreMat);
    earthCore.position.y = 0.13;
    earthGroup.add(earthCore);

    // Atmospheric Electric Cyan halo ring around Earth stratum
    const atmoRingGeo = new THREE.TorusGeometry(1.65, 0.018, 12, 64);
    const atmoRingMat = new THREE.MeshBasicMaterial({
      color: 0x23a9f2,
      transparent: true,
      opacity: 0.65,
    });
    const atmoRing = new THREE.Mesh(atmoRingGeo, atmoRingMat);
    atmoRing.rotation.x = Math.PI / 2;
    atmoRing.position.y = 0.05;
    earthGroup.add(atmoRing);

    disposables.push(
      earthDiscGeo,
      earthDiscMat,
      earthBowlGeo,
      earthCoreGeo,
      earthCoreMat,
      atmoRingGeo,
      atmoRingMat,
    );

    stackGroup.add(moonGroup, marsGroup, earthGroup);

    // Initial placement
    const initOffsets = computeStrataOffsets(explodeRef.current, focusRef.current);
    moonGroup.position.y = initOffsets.moonY;
    marsGroup.position.y = initOffsets.marsY;
    earthGroup.position.y = initOffsets.earthY;

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let animId = 0;
    let isDisposed = false;
    let lastTime = performance.now();
    let elapsed = 0;
    let lastPinEmit = 0;

    // Smooth interpolated state
    let curMoonY = initOffsets.moonY;
    let curMarsY = initOffsets.marsY;
    let curEarthY = initOffsets.earthY;
    let curMoonScale = 1;
    let curMarsScale = 1;
    let curEarthScale = 1;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (sync) {
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (status === gl.UNSIGNALED) {
            animId = window.setTimeout(poll, 5);
          } else {
            gl.deleteSync(sync);
            animId = window.setTimeout(cb, 80);
          }
        };
        animId = window.setTimeout(poll, 5);
      } else {
        animId = window.setTimeout(cb, 80);
      }
    };

    const projectCallouts = (w: number, h: number) => {
      const nextPins: ProjectedPin[] = MODEL_CALLOUT_PINS.map((pin) => {
        const parentGroup =
          pin.body === 'moon' ? moonGroup : pin.body === 'mars' ? marsGroup : earthGroup;
        _worldPos.set(pin.localAnchor[0], pin.localAnchor[1], pin.localAnchor[2]);
        parentGroup.localToWorld(_worldPos);
        _projVec.copy(_worldPos).project(camera);

        const x = (_projVec.x * 0.5 + 0.5) * w;
        const y = (-_projVec.y * 0.5 + 0.5) * h;
        const inFront = _projVec.z < 1;
        return {
          id: pin.id,
          x: Math.round(x),
          y: Math.round(y),
          visible: inFront && x > 24 && x < w - 24 && y > 24 && y < h - 24,
        };
      });
      setProjectedPins(nextPins);
    };

    const tick = () => {
      if (isDisposed) return;
      const now = performance.now();
      const dt = Math.min(0.08, (now - lastTime) * 0.001);
      lastTime = now;
      elapsed += dt;

      const targetOffsets = computeStrataOffsets(explodeRef.current, focusRef.current);
      const focus = focusRef.current;

      curMoonY = THREE.MathUtils.damp(curMoonY, targetOffsets.moonY, 6, dt);
      curMarsY = THREE.MathUtils.damp(curMarsY, targetOffsets.marsY, 6, dt);
      curEarthY = THREE.MathUtils.damp(curEarthY, targetOffsets.earthY, 6, dt);

      // Zero-gravity gentle levitation
      moonGroup.position.y = curMoonY + Math.sin(elapsed * 1.1) * 0.035;
      marsGroup.position.y = curMarsY + Math.sin(elapsed * 1.1 + 2.1) * 0.025;
      earthGroup.position.y = curEarthY + Math.sin(elapsed * 1.1 + 4.2) * 0.035;

      // Focus highlight scaling
      curMoonScale = THREE.MathUtils.damp(
        curMoonScale,
        focus === 'all' || focus === 'moon' ? 1.0 : 0.92,
        7,
        dt,
      );
      curMarsScale = THREE.MathUtils.damp(
        curMarsScale,
        focus === 'all' || focus === 'mars' ? 1.0 : 0.92,
        7,
        dt,
      );
      curEarthScale = THREE.MathUtils.damp(
        curEarthScale,
        focus === 'all' || focus === 'earth' ? 1.0 : 0.92,
        7,
        dt,
      );

      moonGroup.scale.setScalar(curMoonScale);
      marsGroup.scale.setScalar(curMarsScale);
      earthGroup.scale.setScalar(curEarthScale);

      // Slow counter-rotation of planetary strata inside the orbital ring
      moonGroup.rotation.y += dt * 0.14;
      marsGroup.rotation.y += dt * 0.11;
      earthGroup.rotation.y += dt * 0.16;
      orbitalFrameGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.12;

      controls.update();
      renderer.render(scene, camera);

      // Throttle React overlay pin projections to <= 12Hz
      if (now - lastPinEmit > 85) {
        lastPinEmit = now;
        projectCallouts(container.clientWidth || width, container.clientHeight || height);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        animId = requestAnimationFrame(tick);
      }
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      clearTimeout(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  const activePin: ModelCalloutPin =
    MODEL_CALLOUT_PINS.find((p) => p.id === activePinId) ?? MODEL_CALLOUT_PINS[0];
  const activeSpec =
    focusedLayer === 'all' ? STRATA_SPECS[activePin.body] : STRATA_SPECS[focusedLayer];

  return (
    <section
      id="models"
      className="relative scroll-mt-16 border-t border-[#94A3B8]/20 bg-[#060B19] py-14 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-tabular text-xs tracking-[0.22em] text-[#23A9F2] uppercase">
              01 · Signature Cross-Section Assembly
            </p>
            <h2
              className="font-display mt-2 text-3xl sm:text-4xl font-semibold tracking-[0.06em] text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              Three Worlds. One Structural Mirror.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-[#94A3B8]">
            Inspect the stacked cross-sections of Luna, Mars, and Earth inside the orbital
            calibration ring. Drag to orbit, separate the planetary slices vertically, or lock onto
            surface telemetry pins.
          </p>
        </div>

        {/* Main 3D Observatory Stage & Geological Spec Drawer */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* 3D Canvas Stage (Left 8 cols) */}
          <div className="relative lg:col-span-8 flex flex-col justify-between overflow-hidden rounded-xl border border-[#94A3B8]/20 bg-[#080F22]">
            <div className="relative h-[420px] sm:h-[470px] lg:h-[490px] w-full">
              {webglUnavailable ? (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
                  <img
                    src="/assets/aistudio/Logo_d1845c0a.jpeg"
                    alt="Planetary Mirrors Moon, Mars, and Earth cross-section"
                    referrerPolicy="no-referrer"
                    className="h-64 w-64 rounded-full border border-[#23A9F2]/40 object-cover"
                  />
                  <p className="mt-4 font-mono-tabular text-xs text-[#94A3B8]">
                    Interactive WebGL viewport paused · Static orbital plate displayed
                  </p>
                </div>
              ) : (
                <div
                  ref={canvasMountRef}
                  data-testid="planetary-3d-canvas"
                  className="h-full w-full cursor-grab active:cursor-grabbing"
                />
              )}

              {/* 3D Projected Callout Pins with Thin Electric Cyan Leader Lines */}
              {!webglUnavailable && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {MODEL_CALLOUT_PINS.map((pin) => {
                    const pos = projectedPins.find((p) => p.id === pin.id);
                    if (!pos || !pos.visible) return null;
                    const isActive = activePinId === pin.id;
                    const stageWidth = canvasMountRef.current?.clientWidth || 800;
                    const isLeftSide = pos.x < stageWidth * 0.5;
                    return (
                      <div
                        key={pin.id}
                        style={{
                          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                        }}
                        className="absolute left-0 top-0"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActivePinId(pin.id);
                            setFocusedLayer(pin.body);
                          }}
                          aria-label={`Inspect ${pin.title}`}
                          className={`pointer-events-auto group relative flex items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#23A9F2] ${
                            isLeftSide ? '-translate-x-full pr-0' : ''
                          }`}
                        >
                          {isLeftSide ? (
                            <>
                              <span
                                className={`hidden sm:inline-flex items-center rounded border px-2.5 py-1 font-mono-tabular text-[11px] whitespace-nowrap transition-colors ${
                                  isActive
                                    ? 'border-[#23A9F2] bg-[#102347] text-[#F8FAFC]'
                                    : 'border-[#94A3B8]/30 bg-[#060B19]/92 text-[#94A3B8] group-hover:border-[#23A9F2] group-hover:text-[#F8FAFC]'
                                }`}
                              >
                                {pin.title}
                              </span>
                              <span
                                aria-hidden="true"
                                className="hidden sm:block h-px w-8 bg-[#23A9F2]/75"
                              />
                              <span
                                className={`h-3 w-3 rounded-full border transition-all duration-200 ${
                                  isActive
                                    ? 'scale-125 border-[#F8FAFC] bg-[#23A9F2] shadow-[0_0_12px_#23A9F2]'
                                    : 'border-[#23A9F2] bg-[#060B19]/90 group-hover:bg-[#23A9F2]'
                                }`}
                              />
                            </>
                          ) : (
                            <>
                              <span
                                className={`h-3 w-3 -translate-x-1/2 rounded-full border transition-all duration-200 ${
                                  isActive
                                    ? 'scale-125 border-[#F8FAFC] bg-[#23A9F2] shadow-[0_0_12px_#23A9F2]'
                                    : 'border-[#23A9F2] bg-[#060B19]/90 group-hover:bg-[#23A9F2]'
                                }`}
                              />
                              <span
                                aria-hidden="true"
                                className="hidden sm:block h-px w-8 bg-[#23A9F2]/75"
                              />
                              <span
                                className={`hidden sm:inline-flex items-center rounded border px-2.5 py-1 font-mono-tabular text-[11px] whitespace-nowrap transition-colors ${
                                  isActive
                                    ? 'border-[#23A9F2] bg-[#102347] text-[#F8FAFC]'
                                    : 'border-[#94A3B8]/30 bg-[#060B19]/92 text-[#94A3B8] group-hover:border-[#23A9F2] group-hover:text-[#F8FAFC]'
                                }`}
                              >
                                {pin.title}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Top-left subtle 3D stage telemetry caption (solid rgba, no backdrop-blur over WebGL) */}
              <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3 rounded-lg border border-[#94A3B8]/20 bg-[#060B19]/90 px-3 py-1.5 font-mono-tabular text-[11px] text-[#94A3B8]">
                <span>DRAG TO ORBIT</span>
                <span aria-hidden="true">·</span>
                <span>SCROLL TO ZOOM</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFocusedLayer('all');
                  onExplodeChange(24);
                  resetCamRef.current();
                }}
                aria-label="Reset 3D camera and stack alignment"
                className="absolute right-4 top-4 inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#94A3B8]/25 bg-[#060B19]/92 px-3 py-1.5 font-mono-tabular text-xs text-[#94A3B8] transition-colors hover:border-[#23A9F2] hover:text-[#F8FAFC] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset View</span>
              </button>
            </div>

            {/* Unified Bottom Control Dock (Zero Viewport Occlusion, no backdrop-blur over WebGL) */}
            <div className="border-t border-[#94A3B8]/20 bg-[#102347] px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Interactive Stratum Layer Switches */}
                <div
                  role="group"
                  aria-label="Planetary stratum selector"
                  className="flex flex-wrap items-center gap-2"
                >
                  {(
                    [
                      { id: 'all', label: 'All Strata' },
                      { id: 'moon', label: 'Lunar Core' },
                      { id: 'mars', label: 'Martian Crust' },
                      { id: 'earth', label: 'Terrestrial Mirror' },
                    ] as const
                  ).map((btn) => {
                    const active = focusedLayer === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setFocusedLayer(btn.id)}
                        className={`min-h-[38px] rounded-md border px-3 py-1.5 font-mono-tabular text-xs font-medium tracking-wider uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'border-[#23A9F2] bg-[#0B3D91] text-[#F8FAFC]'
                            : 'border-[#94A3B8]/25 bg-[#060B19]/60 text-[#94A3B8] hover:border-[#23A9F2]/60 hover:text-[#F8FAFC]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>

                {/* Explode / Stack View Slider */}
                <div className="flex items-center gap-3 min-w-[230px]">
                  <label
                    htmlFor="explode-stack-slider"
                    className="flex items-center gap-1.5 font-mono-tabular text-xs text-[#94A3B8] uppercase whitespace-nowrap"
                  >
                    <Layers className="h-3.5 w-3.5 text-[#23A9F2]" aria-hidden="true" />
                    <span>Explode Stack</span>
                  </label>
                  <input
                    id="explode-stack-slider"
                    type="range"
                    min={0}
                    max={100}
                    value={explodePercent}
                    onChange={(e) => onExplodeChange(Number(e.target.value))}
                    className="pm-slider w-full"
                  />
                  <span className="font-mono-tabular w-10 text-right text-xs font-semibold text-[#23A9F2]">
                    {explodePercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Geological Specification & Feature Pin Inspector (Right 4 cols) */}
          <aside className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-[#94A3B8]/20 bg-[#102347]/70 p-6">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-[#94A3B8]/20 pb-4">
                <div>
                  <p className="font-mono-tabular text-xs uppercase tracking-[0.18em] text-[#23A9F2]">
                    Stratum Specification
                  </p>
                  <h3 className="font-display mt-1 text-xl font-semibold text-[#F8FAFC]">
                    {activeSpec.bodyName}
                  </h3>
                </div>
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: activeSpec.accentHex }}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">
                {activeSpec.description}
              </p>

              <dl className="mt-5 space-y-3 border-t border-[#94A3B8]/15 pt-4 text-xs">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-mono-tabular uppercase tracking-wider text-[#94A3B8]">
                    Mean Radius
                  </dt>
                  <dd className="font-mono-tabular font-semibold text-[#F8FAFC]">
                    {activeSpec.radiusKm}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="font-mono-tabular uppercase tracking-wider text-[#94A3B8]">
                    Crust Lithology
                  </dt>
                  <dd className="text-sm text-[#F8FAFC]">{activeSpec.crustComposition}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="font-mono-tabular uppercase tracking-wider text-[#94A3B8]">
                    Core / Mantle State
                  </dt>
                  <dd className="text-sm text-[#F8FAFC]">{activeSpec.coreState}</dd>
                </div>
              </dl>

              {/* Surface Feature Pins Selector */}
              <div className="mt-6 border-t border-[#94A3B8]/20 pt-5">
                <div className="flex items-center gap-2 font-mono-tabular text-xs uppercase tracking-[0.18em] text-[#F4A938]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Active Surface Pin</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {MODEL_CALLOUT_PINS.map((pin) => {
                    const selected = pin.id === activePin.id;
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => {
                          setActivePinId(pin.id);
                          setFocusedLayer(pin.body);
                        }}
                        className={`rounded-md border px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#23A9F2] bg-[#060B19]/90 text-[#F8FAFC]'
                            : 'border-[#94A3B8]/20 bg-[#060B19]/40 text-[#94A3B8] hover:border-[#23A9F2]/50 hover:text-[#F8FAFC]'
                        }`}
                      >
                        <span className="block font-medium truncate">{pin.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Pin Details */}
                <div className="mt-4 rounded-lg border border-[#23A9F2]/30 bg-[#060B19]/80 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-semibold text-sm text-[#F8FAFC]">{activePin.title}</h4>
                    <span className="font-mono-tabular text-[11px] text-[#23A9F2]">
                      {activePin.coordinates}
                    </span>
                  </div>
                  <p className="mt-1 font-mono-tabular text-[11px] text-[#F4A938]">
                    {activePin.elevation} · {activePin.mineralSignature}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#94A3B8]">
                    {activePin.specSummary}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
