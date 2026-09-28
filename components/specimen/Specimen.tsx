"use client";

// The fulgurite, rendered. Receives the grown specimen (plain arrays) and draws it with three.js.
// One custom material: a sand crust, a glass rim, heat at the tip, and the strike, once.

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import type { Specimen as SpecimenData, Tube } from "@/lib/specimen/grow";

export type ThreadInfo = { id: string; name: string; note: string };

type Props = {
  specimen: SpecimenData;
  threads: ThreadInfo[];
  /** 0..1 scroll progress through the descent; null keeps the whole object in view. */
  progress?: number | null;
  className?: string;
  onHover?: (hit: { thread: ThreadInfo | null; label: string | null; x: number; y: number } | null) => void;
  /** The thread to light up, from the page (an era or a hovered label). */
  highlight?: string | null;
  strike?: boolean;
  /** Called once the first frame is drawn (the poster can go), or with false if WebGL isn't available. */
  onReady?: (ok: boolean) => void;
};

const RADIAL = 10;

function tubeGeometry(tube: Tube, index: number, threadIdx: number): THREE.BufferGeometry {
  const pts = tube.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const n = pts.length;
  const tangents: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    tangents.push(new THREE.Vector3().subVectors(b, a).normalize());
  }
  // Parallel-transport frames, so rings don't twist.
  const normals: THREE.Vector3[] = [];
  let prevN = new THREE.Vector3(1, 0, 0);
  if (Math.abs(tangents[0].dot(prevN)) > 0.9) prevN = new THREE.Vector3(0, 0, 1);
  prevN = prevN.sub(tangents[0].clone().multiplyScalar(prevN.dot(tangents[0]))).normalize();
  for (let i = 0; i < n; i++) {
    const t = tangents[i];
    const nn = prevN.clone().sub(t.clone().multiplyScalar(prevN.dot(t))).normalize();
    normals.push(nn);
    prevN = nn;
  }
  const pos: number[] = [];
  const nor: number[] = [];
  const tt: number[] = [];
  const idx: number[] = [];
  const tubeId: number[] = [];
  const thr: number[] = [];
  const heat: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = tangents[i];
    const nn = normals[i];
    const bn = new THREE.Vector3().crossVectors(t, nn).normalize();
    const r = tube.radii[i];
    for (let k = 0; k <= RADIAL; k++) {
      const a = (k / RADIAL) * Math.PI * 2;
      const dir = nn.clone().multiplyScalar(Math.cos(a)).add(bn.clone().multiplyScalar(Math.sin(a)));
      // Crust: a little deterministic roughness, stronger on thick glass.
      const rough = 1 + 0.26 * Math.sin(i * 2.7 + k * 1.9 + index * 1.7) * Math.cos(k * 3.1 - i * 1.3 + index);
      const p = pts[i].clone().add(dir.clone().multiplyScalar(r * rough));
      pos.push(p.x, p.y, p.z);
      nor.push(dir.x, dir.y, dir.z);
      tt.push(tube.t[i]);
      tubeId.push(index);
      thr.push(threadIdx);
      heat.push(tube.heat[i] ?? 0);
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let k = 0; k < RADIAL; k++) {
      const a = i * (RADIAL + 1) + k;
      const b = (i + 1) * (RADIAL + 1) + k;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  // Close the ends: a clean break shows as a flat, lighter face (the fracture).
  const capEnd = (i: number, flip: boolean) => {
    const center = pts[i];
    const c = pos.length / 3;
    const t = tangents[i].clone().multiplyScalar(flip ? -1 : 1);
    pos.push(center.x, center.y, center.z);
    nor.push(t.x, t.y, t.z);
    tt.push(tube.t[i]);
    tubeId.push(index);
    thr.push(threadIdx);
    heat.push(tube.heat[i] ?? 0);
    for (let k = 0; k < RADIAL; k++) {
      const a = i * (RADIAL + 1) + k;
      if (flip) idx.push(c, a + 1, a);
      else idx.push(c, a, a + 1);
    }
  };
  capEnd(0, true);
  capEnd(n - 1, false);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("aT", new THREE.Float32BufferAttribute(tt, 1));
  g.setAttribute("aTube", new THREE.Float32BufferAttribute(tubeId, 1));
  g.setAttribute("aThread", new THREE.Float32BufferAttribute(thr, 1));
  g.setAttribute("aHeat", new THREE.Float32BufferAttribute(heat, 1));
  g.setIndex(idx);
  return g;
}

const VERT = /* glsl */ `
  attribute float aT;
  attribute float aTube;
  attribute float aThread;
  attribute float aHeat;
  varying vec3 vN;
  varying vec3 vW;
  varying float vT;
  varying float vTube;
  varying float vThread;
  varying float vHeat;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    vT = aT;
    vTube = aTube;
    vThread = aThread;
    vHeat = aHeat;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uCamPos;
  uniform float uHeat;
  uniform float uFront;
  uniform float uFlash;
  uniform float uFrosted;
  uniform float uHi;
  uniform float uHiOn;
  uniform float uH;
  varying vec3 vN;
  varying vec3 vW;
  varying float vT;
  varying float vTube;
  varying float vThread;
  varying float vHeat;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    float n = mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                  mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
    return n;
  }
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(uCamPos - vW);
    vec3 L = normalize(vec3(-0.55, 0.42, 0.72));
    float diff = max(dot(N, L), 0.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
    float grain = noise(vW * 22.0) * 0.45 + noise(vW * 7.0) * 0.35 + noise(vW * 2.0) * 0.2;
    float crevice = smoothstep(0.3, 0.7, noise(vW * 11.0 + 7.0));
    vec3 sandDark = vec3(0.24, 0.18, 0.12);
    vec3 sandLight = vec3(0.88, 0.73, 0.52);
    vec3 crust = mix(sandDark, sandLight, smoothstep(0.25, 0.8, grain)) * (0.62 + 0.38 * crevice);
    vec3 glass = vec3(0.81, 0.88, 0.84);
    vec3 fill = normalize(vec3(0.7, -0.1, 0.6));
    float back = max(dot(N, fill), 0.0);
    vec3 col = crust * (0.42 + 0.9 * diff) + crust * vec3(0.22, 0.18, 0.13) * back;
    col = mix(col, glass * 0.85, fres * 0.08);
    col += vec3(0.72, 0.78, 0.9) * pow(fres, 4.0) * 0.18;
    float glint = step(0.72, noise(vW * 30.0 + 3.0));
    col += glass * pow(max(dot(reflect(-L, N), V), 0.0), 40.0) * (0.25 + 1.1 * glint);
    if (uFrosted > 0.5) {
      vec3 milk = vec3(0.86, 0.88, 0.85);
      col = mix(milk * (0.55 + 0.45 * diff), glass, fres * 0.5);
    }
    // Lift saturation the way the Blender still's tone mapping does, so the poster and the live object match.
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, 1.55) * 1.06;
    // Heat: growing tips glow, from the last seven days of merges.
    float h = clamp(vHeat * uHeat, 0.0, 1.0);
    vec3 ember = mix(vec3(1.0, 0.5, 0.16), vec3(1.0, 0.94, 0.82), smoothstep(0.55, 1.0, h));
    col = mix(col, ember, smoothstep(0.02, 0.6, h));
    // The strike: a bright front that runs from the surface to the tip, once.
    float s = exp(-pow((clamp(-vW.y / uH, 0.0, 1.0) - uFront) * 18.0, 2.0)) * uFlash;
    col += vec3(0.87, 0.9, 1.0) * s * 1.6;
    // Highlight a thread the page is talking about.
    float hi = uHiOn * (1.0 - step(0.5, abs(vThread - uHi)));
    col = mix(col, col * 1.25 + glass * 0.18, hi);
    // Distance fade into the night.
    float fog = smoothstep(30.0, 70.0, length(uCamPos - vW));
    col = mix(col, vec3(0.051, 0.047, 0.039), fog * 0.9);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function Specimen({ specimen, threads, progress = null, className, onHover, highlight = null, strike = true, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number | null>(progress);
  const highlightRef = useRef<string | null>(highlight);
  useEffect(() => {
    progressRef.current = progress;
    highlightRef.current = highlight;
  }, [progress, highlight]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      onReady?.(false);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const root = new THREE.Group();
    scene.add(root);

    const solidTubes = specimen.tubes.filter((t) => !t.frosted);
    const frostTubes = specimen.tubes.filter((t) => t.frosted);
    const threadIndex = new Map<string, number>();
    specimen.tubes.forEach((t) => t.thread && !threadIndex.has(t.thread) && threadIndex.set(t.thread, threadIndex.size));
    const thrOf = (t: Tube) => (t.thread ? threadIndex.get(t.thread)! : -1);
    // Tube index per vertex lets one draw call carry the highlight; thread highlight uses the thread's tubes.
    const tubeThread = specimen.tubes.map((t) => t.thread);

    const makeMat = (frosted: boolean) =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uCamPos: { value: new THREE.Vector3() },
          uHeat: { value: 1 },
          uFront: { value: -1 },
          uFlash: { value: 0 },
          uFrosted: { value: frosted ? 1 : 0 },
          uHi: { value: -10 },
          uHiOn: { value: 0 },
          uH: { value: specimen.height },
        },
      });
    const solidMat = makeMat(false);
    const frostMat = makeMat(true);
    const solidGeo = mergeGeometries(solidTubes.map((t) => tubeGeometry(t, specimen.tubes.indexOf(t), thrOf(t))));
    const frostGeo = frostTubes.length ? mergeGeometries(frostTubes.map((t) => tubeGeometry(t, specimen.tubes.indexOf(t), thrOf(t)))) : null;
    const solid = new THREE.Mesh(solidGeo!, solidMat);
    root.add(solid);
    let frost: THREE.Mesh | null = null;
    if (frostGeo) {
      frost = new THREE.Mesh(frostGeo, frostMat);
      root.add(frost);
    }

    // Beads: one instanced draw.
    const beadGeo = new THREE.IcosahedronGeometry(1, 1);
    const beadMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#eef4ec") });
    const beads = new THREE.InstancedMesh(beadGeo, beadMat, specimen.beads.length);
    const m = new THREE.Matrix4();
    specimen.beads.forEach((b, i) => {
      m.makeScale(b.r, b.r, b.r);
      m.setPosition(b.p[0], b.p[1], b.p[2]);
      beads.setMatrixAt(i, m);
    });
    root.add(beads);

    const H = specimen.height;
    let w = 1;
    let h = 1;
    const resize = () => {
      w = el.clientWidth || 1;
      h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Interaction: drag to turn; hover to name a thread.
    let yaw = 0.6;
    let dragging = false;
    let lastX = 0;
    let spin = reduce ? 0 : 0.045;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      spin = 0;
    };
    const onUp = () => (dragging = false);
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hoverTube = -1;
    const onMove = (e: PointerEvent) => {
      if (dragging) {
        yaw += (e.clientX - lastX) * 0.008;
        lastX = e.clientX;
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(frost ? [solid, frost] : [solid], false)[0];
      let tube = -1;
      if (hit && hit.face) {
        const g = (hit.object as THREE.Mesh).geometry as THREE.BufferGeometry;
        tube = (g.getAttribute("aTube") as THREE.BufferAttribute).getX(hit.face.a);
      }
      if (tube !== hoverTube) {
        hoverTube = tube;
        const tb = tube >= 0 ? specimen.tubes[tube] : null;
        const th = tb?.thread ? threads.find((x) => x.id === tb.thread) ?? null : null;
        onHover?.(tb ? { thread: th, label: tb.kind === "private" ? tb.label : null, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
      }
    };
    const onLeave = () => {
      hoverTube = -1;
      onHover?.(null);
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    // The strike, once per session.
    let strikeStart = -1;
    try {
      if (strike && !reduce && !sessionStorage.getItem("jb-strike")) {
        strikeStart = performance.now() + 250;
        sessionStorage.setItem("jb-strike", "1");
      }
    } catch {
      /* storage blocked: skip the strike rather than replay it every load */
    }

    const box = new THREE.Box3().setFromObject(solid);
    const size = box.getSize(new THREE.Vector3());
    const fitDist = (Math.max(size.y * 0.55, size.x * 0.75) / Math.tan(THREE.MathUtils.degToRad(15))) * 1.02;
    let camY = progressRef.current == null ? -H / 2 : 1;
    let camDist = progressRef.current == null ? fitDist : 11;
    let visible = true;
    const io = new IntersectionObserver((es) => (visible = es[0]?.isIntersecting ?? true));
    io.observe(el);
    let raf = 0;
    let readySent = false;
    let prev = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) {
        prev = now;
        return;
      }
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      yaw += spin * dt;
      if (!dragging && !reduce && spin < 0.045) spin += 0.01 * dt;
      root.rotation.y = yaw;
      const p = progressRef.current;
      const targetY = p == null ? -H / 2 : 1.2 - p * (H + 1.2);
      const targetDist = p == null ? fitDist : 11;
      const k = reduce ? 1 : 1 - Math.pow(0.02, dt);
      camY += (targetY - camY) * k;
      camDist += (targetDist - camDist) * k;
      camera.position.set(0, camY + (p == null ? 0 : 0.9), camDist);
      camera.lookAt(0, camY, 0);
      const hiThread = highlightRef.current;
      const hiIdx = hiThread != null ? threadIndex.get(hiThread) ?? -10 : hoverTube >= 0 && tubeThread[hoverTube] ? threadIndex.get(tubeThread[hoverTube]!) ?? -10 : -10;
      for (const mat of [solidMat, frostMat]) {
        mat.uniforms.uCamPos.value.copy(camera.position);
        mat.uniforms.uHi.value = hiIdx;
        mat.uniforms.uHiOn.value = hiIdx >= 0 ? 1 : 0;
        if (strikeStart > 0) {
          const s = (now - strikeStart) / 1100;
          mat.uniforms.uFront.value = s;
          mat.uniforms.uFlash.value = s < 0 ? 0 : s > 1.25 ? 0 : 1 - Math.max(0, s - 1) * 4;
        }
      }
      renderer.render(scene, camera);
      if (!readySent) {
        readySent = true;
        onReady?.(true);
      }
      if (process.env.NODE_ENV !== "production") (window as unknown as { __jb?: unknown }).__jb = { calls: renderer.info.render.calls, tris: renderer.info.render.triangles, cam: camera.position.toArray(), frames: ((window as unknown as { __jbf?: number }).__jbf = ((window as unknown as { __jbf?: number }).__jbf ?? 0) + 1) };
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      solidGeo?.dispose();
      frostGeo?.dispose();
      beadGeo.dispose();
      solidMat.dispose();
      frostMat.dispose();
      beadMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [specimen, threads, onHover, strike, onReady]);

  return <div ref={host} className={className} style={{ position: "relative", width: "100%", height: "100%", touchAction: "pan-y" }} />;
}
