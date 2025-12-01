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

varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vComplexity;
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

// De Jong Attractor
vec3 deJongWarp(vec3 p, float complexity, float novelty) {
    float a = 1.4 + complexity; 
    float b = -2.3 + novelty;
    float c = 2.4 - complexity;
    float d = -2.1 - novelty;

    float x = p.x;
    float y = p.y;
    float z = p.z;

    for(int i=0; i<2; i++) {
        float xn = sin(a * y) - cos(b * x);
        float yn = sin(c * x) - cos(d * y);
        float zn = sin(a * z) - cos(d * x);
        x = xn;
        y = yn;
        z = zn;
    }
    return vec3(x, y, z);
}

void main() {
  vUv = uv;
  vNormal = normal;
  vComplexity = u_complexity;
  vNovelty = u_novelty;

  vec3 p = position;
  vec3 n = normalize(normal);

  float timePhase = sin(u_time * 0.5) * 0.1;
  vec3 structure = deJongWarp(p * 0.8, u_complexity + timePhase, u_novelty + timePhase);
  
  float gridScale = 10.0 + u_complexity * 20.0;
  float gridPattern = step(0.9, sin(p.x * gridScale + u_time) * sin(p.y * gridScale - u_time) * sin(p.z * gridScale));
  
  float jitter = snoise(p * 5.0 + u_time) * (0.02 + u_novelty * 0.1);

  vec3 targetPos = mix(p, structure * 1.2, 0.2 + u_complexity * 0.5);
  targetPos += n * gridPattern * 0.05 * (0.5 + u_complexity);
  targetPos += n * jitter;

  vDisplacement = length(targetPos - p);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(targetPos, 1.0);
}
`;

const aiFragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying float vDisplacement;
varying float vComplexity;
varying float vNovelty;

uniform float u_time;
uniform float u_valence;
uniform float u_coolWarm;
uniform float u_energy;

void main() {
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);

  vec3 cyanDeep = vec3(0.05, 0.6, 0.75);
  vec3 cyanBright = vec3(0.2, 0.9, 1.0);
  vec3 tealAccent = vec3(0.1, 0.8, 0.7);

  float warmth = u_coolWarm + 0.1 * u_valence;
  vec3 baseColor = mix(cyanDeep, tealAccent, warmth);

  float gridScale = 12.0 + vComplexity * 8.0;
  float gridX = abs(fract(vDisplacement * gridScale) - 0.5);
  float gridY = abs(fract(vDisplacement * gridScale * 0.7 + 0.33) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.08, min(gridX, gridY));

  baseColor = mix(baseColor, cyanBright, grid * (0.4 + 0.4 * vComplexity));

  float sparkNoise = fract(sin(dot(vUv * 15.0 + u_time * 0.5, vec2(12.9898, 78.233))) * 43758.5453);
  float spark = step(0.97, sparkNoise) * vNovelty;
  baseColor += vec3(1.0) * spark * 3.0;

  float energyPulse = 0.85 + 0.15 * sin(u_time * 3.0 + vDisplacement * 10.0);
  energyPulse *= (0.7 + 0.3 * u_energy);
  baseColor *= energyPulse;

  vec3 rimColor = mix(cyanBright, vec3(0.5, 1.0, 0.9), 0.3);
  baseColor += rimColor * fresnel * 2.0; // Boosted from 1.2 for fake bloom

  float scanLine = sin(vUv.y * 200.0 + u_time * 5.0) * 0.5 + 0.5;
  scanLine = smoothstep(0.4, 0.6, scanLine) * 0.05;
  baseColor += vec3(scanLine) * vComplexity;

  float flicker = 1.0 + 0.05 * sin(u_time * 25.0) * vComplexity;
  baseColor *= flicker;

  float alpha = 0.7 + 0.2 * grid + 0.1 * fresnel;
  alpha = clamp(alpha, 0.5, 0.95);

  gl_FragColor = vec4(baseColor, alpha);
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
    u_dim: new Vector2(0, 0),
    u_gridFreq: 4.0,
    u_gridAmp: 0.15,
    u_phaseJitter: 0.2,
    u_edgeSharpness: 0.7,
    u_coolWarm: 0.5,
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

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!materialRef.current) return;
    const m = materialRef.current as any;

    m.u_time = t;
    m.u_energy = aiState.energy;
    m.u_valence = aiState.valence;
    m.u_complexity = aiState.complexity;
    m.u_novelty = aiState.novelty;
    m.u_introspection = aiState.introspection;
    m.u_focus = aiState.focus;
    m.u_dim = new Vector2(aiState.dim1, aiState.dim2);

    // Derived uniforms
    // Cool/Warm can be influenced by valence or just a stylistic choice for AI
    m.u_coolWarm = 0.5 + 0.2 * aiState.valence;
  });

  return (
    <mesh ref={meshRef} position={position} frustumCulled={false}>
      <icosahedronGeometry args={[1.5, 30]} />
      {/* @ts-ignore */}
      <aiMaterial ref={materialRef} transparent depthWrite={false} />
    </mesh>
  );
}
