// The specimen's tubes as three.js geometry: the grown record (lib/specimen/grow.ts), point for point, around each
// fork's own radii. The picture visitors see is the Blender render of this same geometry (scripts/specimen/
// fulgurite.py); this copy lets the page find a fork under the pointer and light a thread's branches on the render.

import * as THREE from "three";

import type { Tube } from "@/lib/specimen/grow";

const RADIAL = 10;

/** One tube as a closed mesh. `grow` widens it a little, so a light laid on the render covers the glass's crust. */
export function tubeGeometry(tube: Tube, index: number, threadIdx: number, grow = 1): THREE.BufferGeometry {
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
  const idx: number[] = [];
  const tubeId: number[] = [];
  const thr: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = tangents[i];
    const nn = normals[i];
    const bn = new THREE.Vector3().crossVectors(t, nn).normalize();
    const r = tube.radii[i] * grow;
    for (let k = 0; k <= RADIAL; k++) {
      const a = (k / RADIAL) * Math.PI * 2;
      const dir = nn.clone().multiplyScalar(Math.cos(a)).add(bn.clone().multiplyScalar(Math.sin(a)));
      const p = pts[i].clone().add(dir.clone().multiplyScalar(r));
      pos.push(p.x, p.y, p.z);
      nor.push(dir.x, dir.y, dir.z);
      tubeId.push(index);
      thr.push(threadIdx);
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let k = 0; k < RADIAL; k++) {
      const a = i * (RADIAL + 1) + k;
      const b = (i + 1) * (RADIAL + 1) + k;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  // Close the ends.
  const capEnd = (i: number, flip: boolean) => {
    const center = pts[i];
    const c = pos.length / 3;
    const t = tangents[i].clone().multiplyScalar(flip ? -1 : 1);
    pos.push(center.x, center.y, center.z);
    nor.push(t.x, t.y, t.z);
    tubeId.push(index);
    thr.push(threadIdx);
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
  g.setAttribute("aTube", new THREE.Float32BufferAttribute(tubeId, 1));
  g.setAttribute("aThread", new THREE.Float32BufferAttribute(thr, 1));
  g.setIndex(idx);
  return g;
}
