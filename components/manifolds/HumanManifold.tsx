'use client';

import { useFrame, extend } from '@react-three/fiber';
import { useRef } from 'react';
import { ShaderMaterial, Mesh, Color, AdditiveBlending } from 'three';
import { useStore } from '@/lib/state';
import { shaderMaterial } from '@react-three/drei';

const HumanShaderMaterial = shaderMaterial(
  {
    u_time: 0,
    u_energy: 0,
    u_valence: 0,
    u_complexity: 0,
    u_novelty: 0,
    u_dim1: 0,
    u_dim2: 0,
    u_color_core: new Color('#4b0082'), // Indigo
    u_color_glow: new Color('#ff0055'), // Magenta
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying float vField;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    uniform float u_time;
    uniform float u_energy;
    uniform float u_complexity;
    uniform float u_novelty;
    uniform float u_dim1;

    // Simplex noise
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

    // Human field equation - EXACT P5 TRANSLATION
    float fieldHuman(vec2 uv, float t) {
      // Phi determines the orientation of the field
      float phi = 3.14159 * (0.25 + 0.5 * ((u_dim1 + 1.0) / 2.0));
      
      // Omega is the frequency of the wave
      float omega = 0.4 + 1.2 * u_energy;
      
      // Directional component
      float dir = uv.x * cos(phi) + uv.y * sin(phi);
      
      // Layer 1: The primary wave
      float layer1 = u_energy * sin((1.5 + 2.5 * u_complexity) * dir + omega * t);
      
      // Layer 2: The noise/texture component
      // We use snoise (simplex noise) to add organic complexity
      float layer2 = 0.7 * u_novelty * snoise(vec3(
        uv.x * (2.0 + 4.0 * u_complexity),
        uv.y * (2.0 + 4.0 * u_complexity),
        t * (0.1 + 0.5 * u_energy)
      ));
      
      return layer1 + layer2;
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      
      // Map UV to [-1, 1] for the equation to match p5 behavior
      vec2 p5uv = uv * 2.0 - 1.0;
      
      float f = fieldHuman(p5uv, u_time);
      vField = f;
      
      // Displace along normal
      // p5 uses this for color/pixel writing, here we use it for displacement
      // We keep a modest displacement to show the form
      vec3 newPos = position + normal * f * 0.5; 
      vPosition = newPos;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying float vField;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    uniform float u_valence;
    uniform float u_energy;
    uniform vec3 u_color_core;
    uniform vec3 u_color_glow;

    void main() {
      // Map field value to 0..1
      float val = 0.5 + 0.5 * tanh(vField);
      
      // Valence shifts hue
      vec3 valenceColor = mix(vec3(0.0, 0.2, 1.0), vec3(1.0, 0.1, 0.2), (u_valence + 1.0) * 0.5);
      
      // Mix based on energy and field value
      vec3 color = mix(u_color_core, valenceColor, 0.4 + 0.6 * val);
      
      // Fresnel
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
      
      color += u_color_glow * fresnel * (1.0 + u_energy);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ HumanShaderMaterial });

export function HumanManifold(props: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const human = useStore((s) => s.conversation.human);

  useFrame((state) => {
    if (!matRef.current) return;
    const t = state.clock.getElapsedTime();

    matRef.current.uniforms.u_time.value = t;
    matRef.current.uniforms.u_energy.value = human.energy;
    matRef.current.uniforms.u_valence.value = human.valence;
    matRef.current.uniforms.u_complexity.value = human.complexity;
    matRef.current.uniforms.u_novelty.value = human.novelty;
    matRef.current.uniforms.u_dim1.value = human.dim1;
    matRef.current.uniforms.u_dim2.value = human.dim2;

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={props.position}>
      {/* Higher detail geometry */}
      <icosahedronGeometry args={[1.8, 60]} />
      {/* @ts-expect-error Shader material is dynamically extended */}
      <humanShaderMaterial ref={matRef} transparent blending={AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}
