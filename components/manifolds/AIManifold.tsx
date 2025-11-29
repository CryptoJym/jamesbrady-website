'use client';

import { useFrame, extend } from '@react-three/fiber';
import { useRef } from 'react';
import { ShaderMaterial, Mesh, Color, DoubleSide, AdditiveBlending } from 'three';
import { useStore } from '@/lib/state';
import { shaderMaterial } from '@react-three/drei';

const AIShaderMaterial = shaderMaterial(
  {
    u_time: 0,
    u_energy: 0,
    u_focus: 0,
    u_complexity: 0,
    u_novelty: 0,
    u_color_base: new Color('#00aaff'),
    u_color_glow: new Color('#ffffff'),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vField;
    
    uniform float u_time;
    uniform float u_energy;
    uniform float u_complexity;
    uniform float u_focus;
    uniform float u_novelty;

    // AI field equation - EXACT P5 TRANSLATION
    float fieldAI(vec2 uv, float t) {
      // Frequency components based on complexity
      float fx = 2.0 + 4.0 * u_complexity;
      float fy = 2.5 + 3.5 * u_complexity;
      
      // Term 1: The structured wave pattern (Lissajous-like)
      float term1 = u_energy * sin(fx * uv.x + t * (0.5 + u_focus)) * sin(fy * uv.y + t * (0.3 + 0.7 * u_focus));
      
      // Term 2: The novelty/interference pattern
      float term2 = 0.5 * u_novelty * cos(
        uv.x * (4.0 + 6.0 * u_focus) +
        uv.y * (3.0 + 5.0 * u_focus) +
        t * (0.8 + 1.2 * u_energy)
      );
      
      return term1 + term2;
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      
      // Map UV to [-1, 1]
      vec2 p5uv = uv * 2.0 - 1.0;
      
      float f = fieldAI(p5uv, u_time);
      vField = f;
      
      // Geometric distortion based on field
      vec3 newPos = position + normal * f * 0.5;
      vPosition = newPos;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vField;
    
    uniform float u_focus;
    uniform vec3 u_color_base;
    uniform vec3 u_color_glow;
    uniform float u_time;

    void main() {
      // Create a wireframe-like grid pattern using UVs
      float gridScale = 20.0 + u_focus * 10.0;
      vec2 gridUv = fract(vUv * gridScale);
      float line = step(0.95, gridUv.x) + step(0.95, gridUv.y);
      
      // Field value modulates opacity/intensity
      float val = 0.5 + 0.5 * tanh(vField);
      
      vec3 color = mix(vec3(0.0), u_color_base, line * val);
      
      // Fresnel for holographic edge
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
      
      color += u_color_glow * fresnel * 0.8;
      
      // Add glow based on field intensity
      color += u_color_base * val * 0.3;
      
      float alpha = (line * val) + (fresnel * 0.5) + 0.1;
      
      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ AIShaderMaterial });

export function AIManifold(props: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const ai = useStore((s) => s.conversation.ai);

  useFrame((state) => {
    if (!matRef.current) return;
    const t = state.clock.getElapsedTime();

    matRef.current.uniforms.u_time.value = t;
    matRef.current.uniforms.u_energy.value = ai.energy;
    matRef.current.uniforms.u_focus.value = ai.focus;
    matRef.current.uniforms.u_complexity.value = ai.complexity;
    matRef.current.uniforms.u_novelty.value = ai.novelty;

    if (meshRef.current) {
      meshRef.current.rotation.y = -t * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={props.position}>
      {/* Octahedron for more geometric look */}
      <octahedronGeometry args={[2.0, 4]} />
      {/* @ts-expect-error Shader material is dynamically extended */}
      <aIShaderMaterial ref={matRef} transparent side={DoubleSide} blending={AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}
