'use client';

import { useRef } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { ShaderMaterial, Mesh, Vector4, AdditiveBlending, NormalBlending } from 'three';
import * as THREE from 'three';
import { useStore } from '@/lib/state';
import { shaderMaterial } from '@react-three/drei';
import { getAllAttractorParams } from '@/lib/attractorMapping';

const centerVertexShader = `
uniform float u_time;
uniform float u_energy;      // 0..1
uniform float u_complexity;  // 0..1
uniform float u_valence;     // -1..1
uniform float u_coherence;   // 0..1
uniform float u_tension;     // 0..1
uniform vec4 u_params;       // a, b, c, d for Attractor

varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vCoherence;
varying float vTension;
varying vec3 vViewPosition;

// Gyroid Function (for Interference)
float gyroid(vec3 p, float scale) {
    return dot(sin(p * scale), cos(p.zxy * scale));
}

// Dynamic Strange Attractor (Modified Thomas/Aizawa)
vec3 strangeAttractor(vec3 p, float t, float coherence, float tension) {
    float b = 0.19 + tension * 0.1; 
    float dt = 0.05 + u_energy * 0.05; 
    
    float x = p.x;
    float y = p.y;
    float z = p.z;
    
    float dx = sin(y) - b * x;
    float dy = sin(z) - b * y;
    float dz = sin(x) - b * z;
    
    return vec3(dx, dy, dz) * dt;
}

void main() {
  vUv = uv;
  vNormal = normal;
  vCoherence = u_coherence;
  vTension = u_tension;

  vec3 p = position;
  vec3 n = normalize(normal);

  // 1. Calculate Interference Field (Ripple Effect)
  // High frequency ripples for "Singularity" look
  float scale = 8.0 + u_complexity * 10.0;
  float g1 = gyroid(p + vec3(u_time * 0.2), scale);
  float g2 = gyroid(p - vec3(u_time * 0.15), scale * 1.1);
  float interference = g1 + g2; 
  
  // 2. Calculate Attractor Flow
  vec3 flow = strangeAttractor(p, u_time, u_coherence, u_tension);
  
  // 3. Combine: Attractor flows along the Interference Gradient
  float strength = 1.0 + u_tension * 3.0; // Higher tension = more chaos
  vec3 targetPos = p + flow * strength;
  
  // Modulate displacement by interference (Ripple)
  // Shockwave effect from energy and tension
  float shockwave = sin(length(p) * 10.0 - u_time * 5.0) * (u_energy + u_tension) * 0.3;
  
  targetPos += n * (interference * 0.1 + shockwave);

  // Recalculate normal approximation
  vec3 tangent = normalize(cross(n, vec3(0, 1, 0)));
  vec3 bitangent = normalize(cross(n, tangent));
  vec3 p1 = p + tangent * 0.01;
  vec3 p2 = p + bitangent * 0.01;
  
  // Re-evaluate interference for neighbors to get gradient
  float i1 = gyroid(p1 + vec3(u_time * 0.2), scale) + gyroid(p1 - vec3(u_time * 0.15), scale * 1.1);
  float i2 = gyroid(p2 + vec3(u_time * 0.2), scale) + gyroid(p2 - vec3(u_time * 0.15), scale * 1.1);
  
  vec3 pos1 = p1 + flow * strength + n * i1 * 0.1;
  vec3 pos2 = p2 + flow * strength + n * i2 * 0.1;
  
  vec3 newNormal = normalize(cross(pos1 - targetPos, pos2 - targetPos));
  
  vNormal = newNormal;
  vDisplacement = length(targetPos - p);
  
  vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const centerFragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vCoherence;
varying float vTension;
varying vec3 vViewPosition;

uniform float u_time;
uniform float u_valence;
uniform float u_energy;

// Cosine based palette (Rainbow/Prismatic)
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vNormal);
  
  // Iridescence (Prismatic Effect)
  float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 2.0);
  
  // Rainbow palette for diffraction
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.33, 0.67);
  
  vec3 iridescent = palette(fresnel + vDisplacement * 0.5, a, b, c, d);
  
  // Dynamic Color Mapping based on Coherence (Harmony)
  // 0.0 (Chaos) -> Dark Grey / Noise
  // 1.0 (Order) -> Prismatic / White
  
  vec3 chaosColor = vec3(0.1, 0.1, 0.1); // Dark Grey
  vec3 orderColor = vec3(0.95, 0.95, 1.0); // Pearl White
  
  vec3 baseColor = mix(chaosColor, orderColor, vCoherence);
  
  // Mix Iridescence into Base
  // More iridescent when coherent
  vec3 color = mix(baseColor, iridescent, 0.3 + vCoherence * 0.5);
  
  // Core Glow (Singularity)
  vec3 coreColor = vec3(1.0, 0.9, 0.6); 
  float coreIntensity = smoothstep(0.0, 1.0, 1.0 - fresnel);
  color = mix(color, coreColor, coreIntensity * vCoherence);

  // Tension adds "Dark Matter" cracks
  if (vTension > 0.3) {
      float crack = smoothstep(0.4, 0.5, abs(sin(vDisplacement * 20.0)));
      color = mix(color, vec3(0.0, 0.0, 0.0), crack * (vTension - 0.3));
  }

  // Transparency
  float alpha = 0.4 + 0.6 * fresnel;
  
  // Additive highlight
  color += vec3(1.0) * pow(fresnel, 4.0) * 0.5;

  gl_FragColor = vec4(color, alpha); 
}
`;

// 1) Define a custom shader material type
const CenterMaterial = shaderMaterial(
  {
    u_time: 0,
    u_energy: 0.5,
    u_complexity: 0.5,
    u_valence: 0.0,
    u_coherence: 0.5,
    u_tension: 0.5,
    u_params: new Vector4(1.4, -2.3, 2.4, -2.1), // Default Clifford/DeJong
  },
  centerVertexShader,
  centerFragmentShader,
);

extend({ CenterMaterial });

type Props = {
  position?: [number, number, number];
};

export function CenterManifold({ position = [0, 0, 0] }: Props) {
  const meshRef = useRef<Mesh | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);

  const humanState = useStore((s) => s.conversation.human);
  const aiState = useStore((s) => s.conversation.ai);
  const centerState = useStore((s) => s.conversation.center);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!materialRef.current) return;
    const m = materialRef.current as any;

    m.u_time = t;
    m.u_energy = centerState.energy;
    m.u_complexity = centerState.complexity;
    m.u_valence = centerState.valence;
    m.u_coherence = centerState.coherence ?? 0.5;
    m.u_tension = centerState.tension ?? 0.5;

    // Calculate dynamic attractor parameters based on coherence
    const { center } = getAllAttractorParams(humanState, aiState, centerState.coherence || 0.5);
    m.u_params = new Vector4(center.a, center.b, center.c, center.d);

    if (meshRef.current) {
      // Slow rotation for the center piece
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.z = t * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} position={position} frustumCulled={false}>
      {/* Sphere with high segments for smooth deformation */}
      <sphereGeometry args={[1.2, 128, 128]} />
      {/* @ts-ignore */}
      <centerMaterial
        ref={materialRef}
        transparent
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

