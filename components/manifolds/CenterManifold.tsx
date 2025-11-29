'use client';

import { useFrame, extend } from '@react-three/fiber';
import { useRef } from 'react';
import { ShaderMaterial, Mesh, Color, AdditiveBlending } from 'three';
import { useStore } from '@/lib/state';
import { shaderMaterial } from '@react-three/drei';

const CenterShaderMaterial = shaderMaterial(
  {
    u_time: 0,
    u_energy: 0,
    u_tension: 0,
    u_coherence: 0,
    u_color_a: new Color('#ff0055'), // Human-ish
    u_color_b: new Color('#00aaff'), // AI-ish
    u_color_core: new Color('#ffffff'),

    // Human State
    u_h_energy: 0, u_h_complexity: 0, u_h_novelty: 0, u_h_dim1: 0, u_h_dim2: 0,

    // AI State
    u_a_energy: 0, u_a_complexity: 0, u_a_focus: 0, u_a_novelty: 0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vField;
    
    uniform float u_time;
    uniform float u_energy;
    uniform float u_tension;
    uniform float u_coherence;
    
    // Human Uniforms
    uniform float u_h_energy;
    uniform float u_h_complexity;
    uniform float u_h_novelty;
    uniform float u_h_dim1;
    
    // AI Uniforms
    uniform float u_a_energy;
    uniform float u_a_complexity;
    uniform float u_a_focus;
    uniform float u_a_novelty;

    // --- Noise Functions ---
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

    // --- Field Equations ---
    
    // --- Field Equations (Exact P5 Translation) ---
    
    float fieldHuman(vec2 uv, float t) {
      float phi = 3.14159 * (0.25 + 0.5 * ((u_h_dim1 + 1.0) / 2.0));
      float omega = 0.4 + 1.2 * u_h_energy;
      float dir = uv.x * cos(phi) + uv.y * sin(phi);
      float layer1 = u_h_energy * sin((1.5 + 2.5 * u_h_complexity) * dir + omega * t);
      float layer2 = 0.7 * u_h_novelty * snoise(vec3(uv.x * (2.0 + 4.0 * u_h_complexity), uv.y * (2.0 + 4.0 * u_h_complexity), t * (0.1 + 0.5 * u_h_energy)));
      return layer1 + layer2;
    }

    float fieldAI(vec2 uv, float t) {
      float fx = 2.0 + 4.0 * u_a_complexity;
      float fy = 2.5 + 3.5 * u_a_complexity;
      float term1 = u_a_energy * sin(fx * uv.x + t * (0.5 + u_a_focus)) * sin(fy * uv.y + t * (0.3 + 0.7 * u_a_focus));
      float term2 = 0.5 * u_a_novelty * cos(uv.x * (4.0 + 6.0 * u_a_focus) + uv.y * (3.0 + 5.0 * u_a_focus) + t * (0.8 + 1.2 * u_a_energy));
      return term1 + term2;
    }

    float fieldCenter(vec2 uv, float t) {
      // Calculate individual fields at this point
      float h = fieldHuman(uv, t);
      float k = fieldAI(uv, t);
      
      // Blend factor driven by coherence
      // High coherence = perfect blend (0.5)
      // Low coherence = separation or dominance of one field
      float blendFactor = 0.5; // We keep it balanced for the "Center" concept
      
      float base = mix(h, k, blendFactor);
      
      // Stress term: Represents the tension between the two manifolds
      // High tension (low coherence) creates high frequency ripples
      float r2 = dot(uv, uv);
      float stress = u_tension * 0.4 * sin(r2 * (8.0 + 6.0 * u_energy) - t * (1.0 + 1.5 * u_tension));
      
      // Interference: When coherence is high, we see constructive interference
      float interference = u_coherence * 0.2 * sin(h * 10.0 + k * 10.0);
      
      return base + stress + interference;
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      
      // Map UV to [-1, 1]
      vec2 p5uv = uv * 2.0 - 1.0;
      
      // Calculate center field
      float f = fieldCenter(p5uv, u_time);
      vField = f;
      
      // Displace based on field
      vec3 newPos = position + normal * f * 0.5;
      vPosition = newPos;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vField;
    
    uniform float u_coherence;
    uniform float u_tension;
    uniform float u_energy;
    uniform vec3 u_color_a;
    uniform vec3 u_color_b;
    uniform vec3 u_color_core;
    uniform float u_time;

    void main() {
      // Squash field to 0..1
      float val = 0.5 + 0.5 * tanh(vField);
      
      // Color mapping from p5 sketch logic
      // h = 210 + 40 * c.coherence - 30 * c.tension;
      // We approximate this hue shift by mixing colors
      
      // Base mix
      float mixFactor = 0.5 + (u_coherence - 0.5) - (u_tension * 0.3);
      mixFactor = clamp(mixFactor, 0.0, 1.0);
      
      vec3 color = mix(u_color_a, u_color_b, mixFactor);
      
      // Core glow
      float core = 1.0 - length(vPosition) * 0.5;
      core = pow(max(0.0, core), 2.0);
      
      color += u_color_core * core * (1.0 + u_energy);
      
      // Add interference lines based on field
      float lines = sin(vField * 20.0 + u_time * 2.0);
      color += vec3(1.0) * lines * 0.1 * u_coherence;
      
      gl_FragColor = vec4(color, 0.9);
    }
  `
);

extend({ CenterShaderMaterial });

export function CenterManifold(props: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const center = useStore((s) => s.conversation.center);
  const human = useStore((s) => s.conversation.human);
  const ai = useStore((s) => s.conversation.ai);

  useFrame((state) => {
    if (!matRef.current) return;
    const t = state.clock.getElapsedTime();

    // Calculate tension/coherence simply for now if not present in state
    const coherence = center.coherence ?? (1.0 - Math.abs(human.valence - ai.valence) * 0.5);
    const tension = center.tension ?? (1.0 - coherence);

    matRef.current.uniforms.u_time.value = t;
    matRef.current.uniforms.u_energy.value = center.energy;
    matRef.current.uniforms.u_tension.value = tension;
    matRef.current.uniforms.u_coherence.value = coherence;

    // Pass Human State
    matRef.current.uniforms.u_h_energy.value = human.energy;
    matRef.current.uniforms.u_h_complexity.value = human.complexity;
    matRef.current.uniforms.u_h_novelty.value = human.novelty;
    matRef.current.uniforms.u_h_dim1.value = human.dim1;

    // Pass AI State
    matRef.current.uniforms.u_a_energy.value = ai.energy;
    matRef.current.uniforms.u_a_complexity.value = ai.complexity;
    matRef.current.uniforms.u_a_focus.value = ai.focus;
    matRef.current.uniforms.u_a_novelty.value = ai.novelty;

    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.1;
      meshRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={props.position}>
      {/* Torus Knot is good for complexity */}
      <torusKnotGeometry args={[1.2, 0.4, 150, 20]} />
      {/* @ts-expect-error Shader material is dynamically extended */}
      <centerShaderMaterial ref={matRef} transparent blending={AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}
