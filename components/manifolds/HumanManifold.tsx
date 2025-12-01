'use client';

import { useRef } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { ShaderMaterial, Mesh } from 'three';
import { useStore } from '@/lib/state';
import { shaderMaterial } from '@react-three/drei';

const humanVertexShader = `
uniform float u_time;
uniform float u_energy;       // 0..1
uniform float u_valence;      // -1..1
uniform float u_complexity;   // 0..1
uniform float u_novelty;      // 0..1
uniform float u_introspection;// 0..1
uniform float u_focus;        // 0..1
uniform vec2  u_dim;          // semantic direction
uniform float u_hueBias;
uniform float u_coherence;    // From Center
uniform float u_tension;      // From Center

varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vValence;
varying float vEnergy;
varying float vComplexity;
varying float vTension;

// Cellular Noise (Voronoi-ish) for Organic Tissue look
vec2 hash2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float cellular(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    float min_dist = 1.0;
    for(int z=-1; z<=1; z++) {
        for(int y=-1; y<=1; y++) {
            for(int x=-1; x<=1; x++) {
                vec3 neighbor = vec3(float(x),float(y),float(z));
                vec3 point = vec3(hash2(i.xy + neighbor.xy), hash2(i.yz + neighbor.yz).x); // Pseudo-random 3D point
                vec3 diff = neighbor + point - f;
                float dist = length(diff);
                min_dist = min(min_dist, dist);
            }
        }
    }
    return min_dist;
}

// Gyroid Function
float gyroid(vec3 p, float scale) {
    return dot(sin(p * scale), cos(p.zxy * scale));
}

void main() {
  vUv = uv;
  vNormal = normal;
  vValence = u_valence;
  vEnergy = u_energy;
  vComplexity = u_complexity;
  vTension = u_tension;

  vec3 p = position;
  vec3 n = normalize(normal);
  
  // Organic Flow - Speed scales with Energy
  float scale = 3.0 + u_complexity * 5.0;
  vec3 flow = vec3(u_time * (0.2 + u_energy * 1.0)); // Much faster at high energy
  
  // Domain Warping (Interaction)
  vec3 warp = vec3(sin(p.y * 4.0 + u_dim.x), sin(p.z * 4.0 + u_dim.y), sin(p.x * 4.0));
  vec3 warpedP = p + warp * 0.2 * u_novelty;

  // Base Organic Shape (Gyroid)
  float g = gyroid(warpedP + flow, scale);
  
  // Cellular Tissue Detail
  float cell = cellular(p * (4.0 + u_complexity * 4.0) + flow * 0.5);
  float tissue = smoothstep(0.0, 1.0, cell); 
  
  // Mix Gyroid and Tissue
  float surface = mix(g, tissue, 0.3 + u_introspection * 0.4);
  
  // Feedback Loop: Tension adds high-frequency spasms
  float spasm = gyroid(p * 15.0 + u_time * 5.0, 10.0) * 0.1 * u_tension;
  
  // Displacement - Amplitude scales with Energy
  float displacement = surface * (0.25 + u_novelty * 0.2 + u_energy * 0.3) + spasm;
  
  // Heartbeat Pulse - Rate and Intensity scale with Energy
  float pulseRate = 2.0 + u_energy * 5.0;
  float pulse = sin(u_time * pulseRate) * (0.05 + u_energy * 0.1);
  
  vec3 newPos = p + n * (displacement + pulse);
  
  vDisplacement = displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

const humanFragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vValence;
varying float vEnergy;
varying float vComplexity;
varying float vTension;

uniform float u_time;
uniform float u_hueBias;
uniform float u_coherence;

void main() {
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  // Recalculate normal from derivatives for sharp organic edges
  vec3 normal = normalize(cross(dFdx(vNormal), dFdy(vNormal))); 
  // Blend with smooth normal for less faceting
  normal = normalize(mix(vNormal, normal, 0.5));

  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

  // Dynamic Color Mapping based on Valence (Emotion)
  // -1.0 (Negative) -> Deep Red / Magma
  //  0.0 (Neutral)  -> Amber / Organic
  //  1.0 (Positive) -> Teal / Vitality
  
  vec3 negativeColor = vec3(0.8, 0.0, 0.1); // Deep Red
  vec3 neutralColor  = vec3(1.0, 0.6, 0.1); // Amber
  vec3 positiveColor = vec3(0.0, 0.9, 0.7); // Teal
  
  vec3 baseColor;
  if (vValence < 0.0) {
      baseColor = mix(neutralColor, negativeColor, -vValence);
  } else {
      baseColor = mix(neutralColor, positiveColor, vValence);
  }

  // Map displacement to color depth
  float depth = smoothstep(-0.5, 0.5, vDisplacement);
  
  // Darker in the valleys, brighter on peaks
  vec3 color = baseColor * (0.5 + 0.5 * depth);
  
  // Feedback: Coherence adds "Golden" resonance
  vec3 gold = vec3(1.0, 0.8, 0.1);
  color = mix(color, gold, u_coherence * 0.4);

  // Subsurface Scattering Fake
  float innerGlow = max(0.0, dot(normal, viewDir));
  color += baseColor * innerGlow * 0.6;

  // Tension adds "Inflammation" (Bright Red pulsing)
  float inflammation = 0.5 + 0.5 * sin(u_time * 10.0);
  color += vec3(1.0, 0.0, 0.0) * vTension * inflammation * 0.5;

  // Fresnel Rim (Skin-like sheen)
  color += vec3(1.0, 0.9, 0.8) * fresnel * 0.6;

  gl_FragColor = vec4(color, 0.95);
}
`;

const HumanMaterial = shaderMaterial(
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
    u_hueBias: 0.05, // Warmish default
  },
  humanVertexShader,
  humanFragmentShader,
);

extend({ HumanMaterial });

type Props = {
  position?: [number, number, number];
};

export function HumanManifold({ position = [-4, 0, 0] }: Props) {
  const meshRef = useRef<Mesh | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);

  const humanState = useStore((s) => s.conversation.human);
  const centerState = useStore((s) => s.conversation.center);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!materialRef.current) return;
    const m = materialRef.current as any;

    m.u_time = t;
    m.u_energy = humanState.energy || 0.5; // Default to 0.5 if 0
    m.u_valence = humanState.valence;
    m.u_complexity = humanState.complexity || 0.5;
    m.u_novelty = humanState.novelty;
    m.u_introspection = humanState.introspection;
    m.u_focus = humanState.focus;
    m.u_dim = [humanState.dim1, humanState.dim2];

    // Feedback Loop
    m.u_coherence = centerState.coherence || 0;
    m.u_tension = centerState.tension || 0;
  });

  return (
    <mesh ref={meshRef} position={position} frustumCulled={false}>
      <sphereGeometry args={[1.5, 128, 128]} />
      {/* @ts-ignore */}
      <humanMaterial ref={materialRef} transparent depthWrite={false} />
    </mesh>
  );
}
