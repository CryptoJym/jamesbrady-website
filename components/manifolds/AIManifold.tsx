'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/lib/state';

// Digital / Crystalline Shader
const aiVertexShader = `
  uniform float u_time;
  uniform float u_complexity;
  uniform float u_novelty;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vGlitch;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    // Geometric Glitch
    // Sudden shifts in vertices based on Novelty
    float glitch = step(0.98 - u_novelty * 0.1, sin(u_time * 20.0 + position.y * 10.0));
    vGlitch = glitch;
    
    vec3 newPos = position;
    
    // Expansion/Contraction (Breathing)
    newPos += normal * sin(u_time * 2.0) * 0.05;
    
    // Glitch Offset
    newPos += normal * glitch * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const aiFragmentShader = `
  uniform float u_time;
  uniform float u_complexity;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vGlitch;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    
    // Sharp Fresnel (Holographic Edge)
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);

    // Base Color: Digital Cool Tones
    // Cyan (Simple) <-> Neon Purple (Complex)
    vec3 colorSimple = vec3(0.0, 0.8, 1.0);  // Cyan
    vec3 colorComplex = vec3(0.6, 0.0, 1.0); // Neon Purple
    
    vec3 baseColor = mix(colorSimple, colorComplex, u_complexity);

    // Wireframe / Grid Effect
    // Use barycentric-like coordinates or just UV grid
    float grid = step(0.95, fract(vUv.x * 20.0)) + step(0.95, fract(vUv.y * 20.0));
    
    // Hologram transparency
    float alpha = 0.3 + fresnel * 0.7;
    
    // Glitch Flash (White)
    vec3 finalColor = mix(baseColor, vec3(1.0), vGlitch);
    
    // Add Grid
    finalColor += vec3(1.0) * grid * 0.5;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function AIManifold(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { ai } = useStore((state) => state.conversation);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.getElapsedTime();

      materialRef.current.uniforms.u_complexity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.u_complexity.value,
        ai.complexity,
        0.05
      );
      materialRef.current.uniforms.u_novelty.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.u_novelty.value,
        ai.novelty,
        0.05
      );
    }

    if (meshRef.current) {
      // Mechanical Rotation
      meshRef.current.rotation.x += 0.005 * (1 + ai.novelty);
      meshRef.current.rotation.y -= 0.005;
    }
  });

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_complexity: { value: 0.5 },
      u_novelty: { value: 0.0 },
    }),
    []
  );

  return (
    <mesh ref={meshRef} {...props}>
      {/* Icosahedron for Faceted/Digital Look */}
      <icosahedronGeometry args={[1.6, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={aiVertexShader}
        fragmentShader={aiFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
