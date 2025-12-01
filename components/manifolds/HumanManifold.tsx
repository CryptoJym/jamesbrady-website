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
uniform float u_inwardBias;

varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vValence;
varying float vEnergy;
varying float vIntrospection;
varying float vFocus;
varying float vNovelty;

// Simplex 3D Noise
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

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
  vNormal = normal;
  vValence = u_valence;
  vEnergy = u_energy;
  vIntrospection = u_introspection;
  vFocus = u_focus;
  vNovelty = u_novelty;

  vec3 p = position;
  vec3 n = normalize(normal);
  float r = length(p);

  float beat = sin(u_time * (1.0 + u_energy * 3.0));
  float wave = beat * beat * beat;

  float noiseScale = 2.0 + u_complexity * 4.0;
  float noise = snoise(p * noiseScale + u_time * 0.5);

  float inward = mix(1.0, -0.3, u_introspection);

  float u_waveAmp = 0.1 + 0.1 * u_energy;
  float u_noiseAmp = 0.05 + 0.15 * u_novelty;

  float disp =
      u_waveAmp    * wave
    + u_noiseAmp   * noise
    + 0.12         * u_novelty
    ;

  float radius = inward * (r + disp);
  vec3 displaced = n * radius;

  vec3 dir = n;
  vec3 bentNormal = normalize(n + 0.4 * noise * dir);
  vNormal = normalize(mat3(modelMatrix) * bentNormal);

  vDisplacement = disp;
  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const humanFragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vValence;
varying float vEnergy;
varying float vIntrospection;
varying float vFocus;
varying float vNovelty;

uniform float u_time;
uniform float u_hueBias;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.2);

  float hue = u_hueBias + 0.08 * vValence;
  vec3 coreColor = hsv2rgb(vec3(hue, 0.75, 0.95));
  vec3 glowColor = hsv2rgb(vec3(hue + 0.04, 0.45, 1.0));
  vec3 hotColor = vec3(1.0, 0.85, 0.75);

  float coreIntensity = 0.6 + 0.4 * vEnergy;

  float density = smoothstep(-0.15, 0.25, vDisplacement);

  vec3 color = mix(coreColor * 0.6, glowColor, fresnel * 0.7);

  color += hotColor * density * coreIntensity * 0.6;

  float pulse = 0.5 + 0.5 * sin(u_time * 2.5 + vDisplacement * 5.0);
  color += glowColor * fresnel * pulse * 0.25;

  float introFactor = vIntrospection * 0.15;
  color = mix(color, coreColor * 0.8, introFactor);

  float iridescentShift = sin(vUv.x * 20.0 + vUv.y * 15.0 + u_time) * 0.5 + 0.5;
  color += vec3(iridescentShift * 0.08, 0.0, iridescentShift * 0.12) * vNovelty * fresnel;

  float breath = 0.9 + 0.1 * sin(u_time * (1.5 + vEnergy * 2.0));
  color *= breath;

  color += glowColor * fresnel * 0.8; // Boosted from 0.4 for fake bloom

  float alpha = 0.55 + 0.3 * density + 0.15 * fresnel;
  alpha = clamp(alpha, 0.4, 0.9);

  gl_FragColor = vec4(color, alpha);
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
    u_waveAmp: 0.2,
    u_noiseAmp: 0.2,
    u_freq: 2.0,
    u_hueBias: 0.05, // Warmish default
    u_inwardBias: 0.6,
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
  });

  return (
    <mesh ref={meshRef} position={position} frustumCulled={false}>
      <sphereGeometry args={[1.5, 128, 128]} />
      {/* @ts-ignore */}
      <humanMaterial ref={materialRef} transparent depthWrite={false} />
    </mesh>
  );
}
