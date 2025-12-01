'use client';

import { useRef } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { ShaderMaterial, Mesh, Vector2 } from 'three';
import { useStore } from '@/lib/state';
import { shaderMaterial } from '@react-three/drei';

const aiVertexShader = `
uniform float u_time;
uniform float u_energy;
uniform float u_valence;
uniform float u_complexity;
uniform float u_novelty;
uniform float u_introspection;
uniform float u_focus;
uniform vec2  u_dim;
uniform float u_coherence; // From Center
uniform float u_tension;   // From Center

varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vComplexity;
varying float vNovelty;
varying float vTension;

// Gyroid Function
float gyroid(vec3 p, float scale) {
    return dot(sin(p * scale), cos(p.zxy * scale));
}

// Quantized Noise (Digital Stepping)
float quantized(float v, float steps) {
    return floor(v * steps) / steps;
}

void main() {
  vUv = uv;
  vNormal = normal;
  vComplexity = u_complexity;
  vNovelty = u_novelty;
  vTension = u_tension;

  vec3 p = position;
  vec3 n = normalize(normal);

  // Digital Flow (Fast & Twitchy)
  // Speed scales with Energy
  float scale = 4.0 + u_complexity * 10.0;
  vec3 flow = vec3(u_time * (0.5 + u_energy * 2.0)); 
  
  // Domain Warping (Interference)
  // Warp intensity scales with Novelty
  vec3 warp = vec3(sin(p.z * 10.0 + u_dim.y), sin(p.x * 10.0 + u_dim.x), sin(p.y * 10.0));
  vec3 warpedP = p + warp * (0.15 + u_novelty * 0.5);

  // Base Digital Shape (Gyroid)
  float g = gyroid(warpedP + flow, scale);
  
  // Quantize the surface for "Low Poly" / "Voxel" look
  float steps = 5.0 + u_complexity * 20.0;
  float digital = quantized(g, steps);
  
  // Feedback Loop: Tension adds "Glitch" (Vertex displacement spikes)
  float glitch = 0.0;
  if (u_tension > 0.1) {
      float glitchNoise = gyroid(p * 50.0 + u_time * 20.0, 1.0);
      if (glitchNoise > 0.8) glitch = u_tension * 0.4; // Stronger glitch
  }

  // Displacement
  float displacement = digital * (0.15 + u_novelty * 0.4) + glitch;
  
  // Add a second layer of "data noise" (High freq Gyroid)
  float dataNoise = gyroid(p * 5.0 - flow * 2.0, scale * 2.0);
  displacement += dataNoise * 0.05 * u_complexity;

  vec3 newPos = p + n * displacement;
  
  vDisplacement = displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

const aiFragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vComplexity;
varying float vNovelty;
varying float vTension;

uniform float u_time;
uniform float u_coherence;

void main() {
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.0);

  // Dynamic Color Mapping based on Complexity (Information Density)
  // 0.0 (Simple)  -> Cool Cyan / Ice
  // 1.0 (Complex) -> Hot Pink / Plasma
  
  vec3 simpleColor = vec3(0.0, 1.0, 1.0);  // Cyan
  vec3 complexColor = vec3(1.0, 0.0, 0.8); // Hot Pink
  
  vec3 baseColor = mix(simpleColor, complexColor, vComplexity);
  
  // Map displacement to color (Stepped)
  float depth = smoothstep(-0.5, 0.5, vDisplacement);
  float bandedDepth = floor(depth * 5.0) / 5.0;
  
  // Darker base, brighter peaks
  vec3 color = mix(baseColor * 0.2, baseColor, bandedDepth);
  
  // Scanline Effect
  float scanline = sin(vUv.y * 100.0 - u_time * 10.0);
  if (scanline > 0.9) color += vec3(1.0) * 0.5;

  // Grid / Wireframe overlay
  float grid = abs(sin(vDisplacement * (30.0 + vComplexity * 30.0)));
  float gridLine = smoothstep(0.95, 1.0, grid);
  color += baseColor * gridLine * 1.0;

  // Feedback: Coherence aligns towards White/Gold
  vec3 resonanceColor = vec3(0.9, 0.9, 1.0);
  color = mix(color, resonanceColor, u_coherence * 0.4);
  
  // Feedback: Tension adds "Glitch" artifacts (Red flashes)
  float glitchFlash = step(0.98, sin(u_time * 30.0 + vDisplacement * 20.0)) * vTension;
  color += vec3(1.0, 0.0, 0.0) * glitchFlash;

  // Fresnel Glow (Electric Rim)
  color += vec3(0.5, 0.8, 1.0) * fresnel * 0.8;

  gl_FragColor = vec4(color, 0.9);
}
`;

const AiMaterial = shaderMaterial(
  {
    u_time: 0,
    u_energy: 0.5,
    u_valence: 0.0,
    u_complexity: 0.5,
    u_novelty: 0.0,
    u_introspection: 0.0,
    u_focus: 0.5,
    u_dim: [0, 0],
    u_coherence: 0.0,
    u_tension: 0.0,
  },
  aiVertexShader,
  aiFragmentShader,
);

extend({ AiMaterial });

type Props = {
  position?: [number, number, number];
};

export function AIManifold({ position = [4, 0, 0] }: Props) {
  const meshRef = useRef<Mesh | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);

  const aiState = useStore((s) => s.conversation.ai);
  const centerState = useStore((s) => s.conversation.center);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!materialRef.current) return;
    const m = materialRef.current as any;

    m.u_time = t;
    m.u_energy = aiState.energy || 0.5;
    m.u_valence = aiState.valence;
    m.u_complexity = aiState.complexity || 0.5;
    m.u_novelty = aiState.novelty;
    m.u_introspection = aiState.introspection;
    m.u_focus = aiState.focus;
    m.u_dim = [aiState.dim1, aiState.dim2];

    // Feedback Loop
    m.u_coherence = centerState.coherence || 0;
    m.u_tension = centerState.tension || 0;
  });

  return (
    <mesh ref={meshRef} position={position} frustumCulled={false}>
      <sphereGeometry args={[1.5, 128, 128]} />
      {/* @ts-ignore */}
      <aiMaterial ref={materialRef} transparent depthWrite={false} />
    </mesh>
  );
}
