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
uniform vec4 u_params;       // a, b, c, d for Clifford

varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vCoherence;
varying float vTension;

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

// Clifford Attractor Iteration
vec3 cliffordWarp(vec3 p, vec4 params) {
    float a = params.x;
    float b = params.y;
    float c = params.z;
    float d = params.w;

    float x = p.x;
    float y = p.y;
    float z = p.z;

    // Reduced iterations for vertex shader performance, but enough for shape
    for(int i=0; i<2; i++) {
        float xn = sin(a * y) + c * cos(a * x);
        float yn = sin(b * x) + d * cos(b * y);
        float zn = sin(c * z) + d * cos(c * x);
        x = xn;
        y = yn;
        z = zn;
    }
    return vec3(x, y, z);
}

void main() {
  vUv = uv;
  vNormal = normal;
  vCoherence = u_coherence;
  vTension = u_tension;

  vec3 p = position;
  vec3 normalDir = normalize(normal);

  // Base breathing
  float breath = sin(u_time * (1.0 + u_energy)) * 0.05;
  
  // Attractor influence
  // When coherence is high, the shape becomes more defined by the attractor
  // When tension is high, it becomes more chaotic noise
  
  vec3 attractorPos = cliffordWarp(p * 0.8, u_params);
  
  // Noise for tension/instability
  float noiseAmp = u_tension * 0.4;
  float noiseVal = snoise(p * 3.0 + u_time * 0.5);
  
  // Blend between sphere (stable base) and attractor (complex relation)
  // High coherence -> More Attractor structure
  // Low coherence -> More amorphous sphere
  float mixFactor = smoothstep(0.2, 0.8, u_coherence);
  
  vec3 targetPos = mix(p, attractorPos, mixFactor * 0.6);
  
  // Apply tension noise
  targetPos += normalDir * noiseVal * noiseAmp;
  
  // Apply breathing
  targetPos += normalDir * breath;

  float disp = length(targetPos - p);
  vDisplacement = disp;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(targetPos, 1.0);
}
`;

const centerFragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vCoherence;
varying float vTension;

uniform float u_time;
uniform float u_valence;
uniform float u_energy;

void main() {
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  float fresnel = pow(1.0 - max(0.0, dot(viewDir, vNormal)), 2.0);

  // Colors representing the "Field"
  // Stable/Coherent = Gold/Cyan/White
  // Unstable/Tense = Red/Purple/Dark
  
  vec3 stableColor = vec3(0.0, 0.9, 1.0); // Cyan
  vec3 coreColor = vec3(1.0, 0.9, 0.5);   // Gold
  vec3 tenseColor = vec3(0.8, 0.1, 0.3);  // Reddish
  
  // Base mix based on coherence
  vec3 baseColor = mix(tenseColor, stableColor, vCoherence);
  
  // Add core glow
  baseColor = mix(baseColor, coreColor, 0.3 * (1.0 - vTension));

  // Pulse effect from energy
  float pulse = sin(u_time * 2.0 + vDisplacement * 10.0) * 0.5 + 0.5;
  baseColor += coreColor * pulse * u_energy * 0.8; // Boosted pulse
  
  // Fresnel rim
  vec3 rimColor = vec3(1.0, 0.9, 0.5); // Gold rim
  baseColor += rimColor * fresnel * 0.8; // Reduced from 2.0 to 0.8 for better contrast
  
  // Tension adds "static" or noise to the color
  if (vTension > 0.3) {
      float staticNoise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
      baseColor += vec3(staticNoise) * (vTension - 0.3) * 0.5;
  }

  // Transparency
  // Boost alpha significantly for visibility without Bloom
  float alpha = 0.6 + 0.4 * vCoherence + 0.4 * fresnel;
  alpha = clamp(alpha, 0.5, 1.0);
  
  // Make it glow
  gl_FragColor = vec4(baseColor * 1.1, alpha); // Reduced boost from 1.5 to 1.1
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

