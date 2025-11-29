'use client';

import { useFrame, extend } from '@react-three/fiber';
import { useRef } from 'react';
import { ShaderMaterial, Mesh, Color, DoubleSide, AdditiveBlending } from 'three';
import { useStore } from '@/lib/state';
import { shaderMaterial } from '@react-three/drei';

const UnifiedShaderMaterial = shaderMaterial(
  {
    u_time: 0,
    // Human State
    u_h_energy: 0, u_h_valence: 0, u_h_complexity: 0, u_h_novelty: 0,
    // AI State
    u_a_energy: 0, u_a_focus: 0, u_a_complexity: 0, u_a_novelty: 0,
    // Interaction
    u_coherence: 0,
    u_color_h: new Color('#ff0055'), // Human (Pink/Red)
    u_color_a: new Color('#00aaff'), // AI (Blue/Cyan)
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying float vElevation;
    varying float vMixFactor;
    
    uniform float u_time;
    
    uniform float u_h_energy;
    uniform float u_h_complexity;
    uniform float u_h_novelty;
    
    uniform float u_a_energy;
    uniform float u_a_complexity;
    uniform float u_a_focus;
    uniform float u_a_novelty;
    
    uniform float u_coherence;

    // Simplex Noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      
      // Mix factor: 0.0 (Left/Human) -> 1.0 (Right/AI)
      // We use a smoothstep to make the transition organic
      float mixFactor = smoothstep(0.2, 0.8, uv.x);
      vMixFactor = mixFactor;
      
      // --- Human Field (Left) ---
      float h_freq = 2.0 + 3.0 * u_h_complexity;
      float h_amp = 0.5 + 1.0 * u_h_energy;
      float h_val = snoise(vec3(uv.x * h_freq, uv.y * h_freq, u_time * (0.2 + u_h_energy * 0.5)));
      h_val *= h_amp;
      
      // --- AI Field (Right) ---
      float a_freq = 3.0 + 4.0 * u_a_complexity;
      float a_amp = 0.5 + 1.0 * u_a_energy;
      // AI uses a more structured, constructive interference pattern
      float a_val = sin(uv.x * a_freq * 2.0 + u_time) * cos(uv.y * a_freq + u_time * (1.0 + u_a_focus));
      a_val *= a_amp;
      
      // --- Interaction (Middle) ---
      // When coherence is high, fields blend constructively and the grid stabilizes
      // When low, they clash (high frequency noise) and the grid distorts
      
      float baseElevation = mix(h_val, a_val, mixFactor);
      
      // Add interaction ripple
      float distToCenter = abs(uv.x - 0.5);
      float interactionZone = 1.0 - smoothstep(0.0, 0.4, distToCenter);
      
      // Coherence Warp: The field "evolves" by stretching time and space when coherent
      float warp = u_coherence * sin(uv.y * 10.0 + u_time) * 0.2;
      
      float ripple = sin(uv.y * 20.0 + u_time * 5.0 + warp) * cos(uv.x * 20.0);
      float interactionEffect = ripple * interactionZone * (1.0 - u_coherence) * 0.5;
      
      // Evolution term: The entire structure breathes with the sum of energies
      float evolution = (u_h_energy + u_a_energy) * 0.2 * sin(u_time * 0.5);
      
      float elevation = baseElevation + interactionEffect + evolution;
      vElevation = elevation;
      
      vec3 newPos = position;
      newPos.z += elevation;
      
      // Twist the manifold based on novelty
      float twist = (u_h_novelty + u_a_novelty) * 0.5;
      newPos.y += sin(newPos.x * 0.5 + u_time) * twist;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying float vElevation;
    varying float vMixFactor;
    
    uniform vec3 u_color_h;
    uniform vec3 u_color_a;
    uniform float u_h_energy;
    uniform float u_a_energy;
    uniform float u_coherence;

    void main() {
      // Base color mix
      vec3 color = mix(u_color_h, u_color_a, vMixFactor);
      
      // Highlights based on elevation (peaks are brighter)
      float highlight = smoothstep(0.2, 1.0, vElevation);
      color += vec3(1.0) * highlight * 0.5;
      
      // Grid lines for "math" feel
      float gridX = step(0.98, fract(vUv.x * 40.0));
      float gridY = step(0.98, fract(vUv.y * 40.0));
      float grid = max(gridX, gridY);
      
      // Grid glows with energy
      float energyMix = mix(u_h_energy, u_a_energy, vMixFactor);
      color += vec3(1.0) * grid * (0.2 + 0.5 * energyMix);
      
      // Coherence glow in the center
      float centerGlow = (1.0 - abs(vMixFactor - 0.5) * 2.0);
      centerGlow = pow(centerGlow, 3.0);
      color += vec3(1.0, 1.0, 0.8) * centerGlow * u_coherence * 0.5;
      
      // Alpha for transparency at edges
      float alpha = 0.8 + 0.2 * energyMix;
      
      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ UnifiedShaderMaterial });

export function UnifiedManifold() {
  const matRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<Mesh>(null);

  const human = useStore((s) => s.conversation.human);
  const ai = useStore((s) => s.conversation.ai);
  const center = useStore((s) => s.conversation.center);

  useFrame((state) => {
    if (!matRef.current) return;
    const t = state.clock.getElapsedTime();

    matRef.current.uniforms.u_time.value = t;

    // Human
    matRef.current.uniforms.u_h_energy.value = human.energy;
    matRef.current.uniforms.u_h_complexity.value = human.complexity;
    matRef.current.uniforms.u_h_novelty.value = human.novelty;

    // AI
    matRef.current.uniforms.u_a_energy.value = ai.energy;
    matRef.current.uniforms.u_a_complexity.value = ai.complexity;
    matRef.current.uniforms.u_a_focus.value = ai.focus;

    // Center
    // Calculate coherence if missing
    const coherence = center.coherence ?? (1.0 - Math.abs(human.valence - ai.valence) * 0.5);
    matRef.current.uniforms.u_coherence.value = coherence;

    if (meshRef.current) {
      // Slow rotation for dynamic view
      meshRef.current.rotation.x = Math.PI / 4 + Math.sin(t * 0.1) * 0.1;
      meshRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 4, 0, 0]}>
      {/* High resolution plane for field details */}
      <planeGeometry args={[15, 15, 128, 128]} />
      {/* @ts-expect-error Shader material is dynamically extended */}
      <unifiedShaderMaterial ref={matRef} transparent side={DoubleSide} blending={AdditiveBlending} depthWrite={false} wireframe={false} />
    </mesh>
  );
}
