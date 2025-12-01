'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/lib/state';

// Vertex Shader
const humanVertexShader = `
  uniform float u_time;
  uniform float u_energy;
  uniform float u_valence;
  
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  // Simplex Noise (Standard)
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
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    // Organic Pulse (Heartbeat)
    float pulse = sin(u_time * (1.0 + u_energy * 2.0)) * 0.05;
    
    // Noise Displacement (Breathing)
    float noise = snoise(position * 1.5 + u_time * 0.2);
    vDisplacement = noise;

    // Expand/Contract based on Valence (Emotion)
    // Positive = Expansive, Negative = Contracted/Spiky
    float expansion = 1.0 + (u_valence * 0.2);
    
    vec3 newPos = position + normal * (noise * (0.2 + u_energy * 0.3) + pulse) * expansion;

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const humanFragmentShader = `
  uniform float u_time;
  uniform float u_valence;
  uniform float u_energy;

  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    
    // Fresnel Effect (Rim Light) - Soft and Organic
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);

    // Dynamic Color Palette
    // Deep Red (Negative) <-> Organic Amber (Neutral) <-> Deep Teal (Positive)
    vec3 colorNeg = vec3(0.4, 0.05, 0.1); // Deep Blood Red
    vec3 colorNeu = vec3(0.8, 0.4, 0.1);  // Warm Amber
    vec3 colorPos = vec3(0.0, 0.5, 0.6);  // Deep Ocean Teal

    vec3 baseColor;
    if (u_valence < 0.0) {
        baseColor = mix(colorNeu, colorNeg, -u_valence);
    } else {
        baseColor = mix(colorNeu, colorPos, u_valence);
    }

    // Subsurface Scattering Approximation (SSS)
    // Light penetrates the surface in thin areas (high displacement)
    float sss = smoothstep(-0.2, 0.5, vDisplacement);
    vec3 sssColor = baseColor * 1.5; // Inner glow is brighter

    // Mix Base and SSS
    vec3 finalColor = mix(baseColor, sssColor, sss * 0.6);

    // Add Fresnel Rim (Skin-like sheen)
    finalColor += vec3(1.0, 0.8, 0.6) * fresnel * 0.4;

    // Pulse Glow (Energy)
    float pulseGlow = (sin(u_time * 3.0) * 0.5 + 0.5) * u_energy * 0.2;
    finalColor += baseColor * pulseGlow;

    gl_FragColor = vec4(finalColor, 0.95); // Slightly transparent
  }
`;

export function HumanManifold(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { human } = useStore((state) => state.conversation);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.getElapsedTime();

      // Smoothly interpolate uniforms
      materialRef.current.uniforms.u_energy.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.u_energy.value,
        human.energy,
        0.05
      );
      materialRef.current.uniforms.u_valence.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.u_valence.value,
        human.valence,
        0.05
      );
    }

    if (meshRef.current) {
      // Gentle floating rotation
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_energy: { value: 0.5 },
      u_valence: { value: 0.0 },
    }),
    []
  );

  return (
    <mesh ref={meshRef} {...props}>
      {/* High-Res Sphere for Organic Shape */}
      <sphereGeometry args={[1.6, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={humanVertexShader}
        fragmentShader={humanFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
