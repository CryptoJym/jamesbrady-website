// The light on the rendered sculpture. The picture is Blender's (public/specimen/plate-*.webp); this is three.js
// computing the same object from the same record, seen through the plate's own camera (lib/specimen/
// sculpture.generated.ts), so everything it finds and lights lands on the rendered glass:
//   · pick(): the fork under the pointer, for the note that names it;
//   · setHighlight(): a thread's branches, lit in the glass colour, when the page talks about that thread.
// It draws only when asked (a highlight changes, or its view does) and never runs a loop. A lit thread is three draw
// calls: every tube into depth, so a branch behind other glass stays behind it; a veil of the night ground over the
// rest of the render; and the thread's own branches cut back out of the veil, with a faint rim of glass light. So the
// thread stands at full brightness while everything else steps back; over the empty ground the veil is the ground
// itself, so the canvas never shows an edge.

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import type { Specimen as SpecimenData, Tube } from "@/lib/specimen/grow";
import { SCULPTURE } from "@/lib/specimen/sculpture.generated";

import { tubeGeometry } from "./geometry";

/** A window onto the plate, in plate pixels: x, y, width, height. */
export type PlateRect = readonly [number, number, number, number];

const VERT = /* glsl */ `
  attribute float aThread;
  varying vec3 vN;
  varying vec3 vW;
  varying float vThread;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    vThread = aThread;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

// Premultiplied: a rim of glass light at the thread's edges, and nothing (so the render shows through) inside them.
const FRAG = /* glsl */ `
  uniform vec3 uCamPos;
  uniform vec3 uGlass;
  uniform float uHi;
  varying vec3 vN;
  varying vec3 vW;
  varying float vThread;
  void main() {
    if (abs(vThread - uHi) > 0.5) discard;
    vec3 V = normalize(uCamPos - vW);
    float rim = 0.45 * pow(1.0 - abs(dot(normalize(vN), V)), 2.2);
    gl_FragColor = vec4(uGlass * rim, rim);
  }
`;

const VEIL_VERT = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const VEIL_FRAG = /* glsl */ `
  uniform vec3 uGround;
  uniform float uVeil;
  void main() { gl_FragColor = vec4(uGround * uVeil, uVeil); }
`;

/** How far the rest of the sculpture steps back while a thread is lit. */
const VEIL = 0.5;

/** A colour token from the page's own stylesheet (app/fg.css :root), so no colour lives in this file. The shaders write
 * straight to the canvas, which the browser composites as sRGB, so the token's sRGB values go in as they are: the veil
 * must be exactly the page's ground, or its canvas would show as a box. */
const token = (name: string) => {
  const c = new THREE.Color(1, 1, 1);
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (v) c.setStyle(v, THREE.SRGBColorSpace);
  const out = { r: 1, g: 1, b: 1 };
  c.getRGB(out, THREE.SRGBColorSpace);
  return new THREE.Vector3(out.r, out.g, out.b);
};

export class SpecimenLight {
  readonly canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private mesh: THREE.Mesh;
  private depth: THREE.Mesh;
  private veil: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private ray = new THREE.Raycaster();
  private threadIndex = new Map<string, number>();
  private tubes: Tube[];
  private highlight: string | null = null;

  /** Throws when WebGL is not available; the rendered sculpture then simply stands without its light. */
  constructor(specimen: SpecimenData) {
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-hidden", "true");
    this.canvas.dataset.layer = "light";
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, premultipliedAlpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.tubes = specimen.tubes;
    specimen.tubes.forEach((t) => t.thread && !this.threadIndex.has(t.thread) && this.threadIndex.set(t.thread, this.threadIndex.size));
    const geo = mergeGeometries(specimen.tubes.map((t, i) => tubeGeometry(t, i, t.thread ? this.threadIndex.get(t.thread)! : -1, 1.25)));
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { uCamPos: { value: new THREE.Vector3() }, uGlass: { value: token("--glass") }, uHi: { value: -10 } },
      depthFunc: THREE.LessEqualDepth,
      depthWrite: false,
      transparent: true,
      // overwrite the veil: the thread's pixels become the rim alone
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.ZeroFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.ZeroFactor,
    });
    // Depth only, pushed back a hair: the lit thread must pass against its own depth, and anything nearer still hides it.
    this.depth = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 }));
    this.depth.renderOrder = 0;
    this.veil = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: VEIL_VERT,
        fragmentShader: VEIL_FRAG,
        uniforms: { uGround: { value: token("--ground") }, uVeil: { value: VEIL } },
        depthTest: false,
        depthWrite: false,
        transparent: true,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
      }),
    );
    this.veil.frustumCulled = false;
    this.veil.renderOrder = 1;
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.renderOrder = 2;
    this.scene.add(this.depth, this.veil, this.mesh);
    const c = SCULPTURE.camera;
    this.camera = new THREE.PerspectiveCamera(c.vfov, SCULPTURE.plate.width / SCULPTURE.plate.height, 0.5, 200);
    this.camera.position.set(c.position[0], c.position[1], c.position[2]);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(c.target[0], c.target[1], c.target[2]);
    this.camera.updateMatrixWorld();
    this.material.uniforms.uCamPos.value.copy(this.camera.position);
  }

  /** Which part of the plate the canvas covers (null: all of it), and the canvas's size in CSS pixels. */
  setView(rect: PlateRect | null, cssW: number, cssH: number, pixelRatio = Math.min(window.devicePixelRatio || 1, 2)) {
    const { width: W, height: H } = SCULPTURE.plate;
    if (rect) this.camera.setViewOffset(W, H, rect[0], rect[1], rect[2], rect[3]);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(Math.max(1, Math.round(cssW)), Math.max(1, Math.round(cssH)), false);
    this.render();
  }

  setHighlight(thread: string | null) {
    if (thread === this.highlight) return;
    this.highlight = thread;
    this.render();
  }

  /** The fork at (u, v), each 0..1 across the canvas, or null. */
  pick(u: number, v: number): Tube | null {
    this.ray.setFromCamera(new THREE.Vector2(u * 2 - 1, 1 - v * 2), this.camera);
    const hit = this.ray.intersectObject(this.depth, false)[0];
    if (!hit?.face) return null;
    const i = (this.depth.geometry.getAttribute("aTube") as THREE.BufferAttribute).getX(hit.face.a);
    return this.tubes[i] ?? null;
  }

  private render() {
    const i = this.highlight != null ? this.threadIndex.get(this.highlight) ?? -10 : -10;
    this.material.uniforms.uHi.value = i;
    this.mesh.visible = i >= 0;
    this.depth.visible = i >= 0;
    this.veil.visible = i >= 0;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.depth.geometry.dispose();
    (this.depth.material as THREE.Material).dispose();
    this.material.dispose();
    this.veil.geometry.dispose();
    (this.veil.material as THREE.Material).dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }
}
