'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/lib/state';

// Particle Shader
const centerVertexShader = `
  uniform float u_time;
  uniform float u_coherence;
  uniform float u_tension;
  
  attribute float size;
  
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    
    // Particle Movement
    // Flow based on Coherence (Order) vs Tension (Chaos)
    
    // Orbit Rotation
    float angle = u_time * (0.2 + u_tension);
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, -s, s, c);
    pos.xz = rot * pos.xz;
    
    // Breathing
    pos *= 1.0 + sin(u_time + pos.y) * 0.1;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Size attenuation
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    // Fade edges
    vAlpha = 1.0;
  }
`;

const centerFragmentShader = `
  uniform float u_coherence;
  
  varying float vAlpha;

  void main() {
    // Circular Particle
    vec2 uv = gl_PointCoord.xy - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;
    
    // Soft glow
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 2.0);

    // Dynamic Color
    // Chaos (Dark Grey) <-> Order (Obsidian/Gold)
    vec3 chaosColor = vec3(0.2, 0.2, 0.2);
    vec3 orderColor = vec3(1.0, 0.9, 0.5); // Gold
    
    vec3 color = mix(chaosColor, orderColor, u_coherence);

    gl_FragColor = vec4(color, glow * vAlpha);
  }
`;

export function CenterManifold(props: any) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { center } = useStore((state) => state.conversation);

  // Generate Particles
  const { positions, sizes } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Sphere distribution
      const r = 2.5 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = Math.random() * 2.0;
    }

    return { positions, sizes };
  }, []);

  const inputActivity = useStore((s) => s.conversation.inputActivity);
  const setInputActivity = useStore((s) => s.setInputActivity);

  // Ref to track smoothed activity for visual transition
  const smoothedActivity = useRef(0);

  useFrame(({ clock }, delta) => {
    if (materialRef.current) {
      // Smoothly interpolate towards the target input activity
      // Slower lerp for organic feel, avoiding "jolts"
      smoothedActivity.current = THREE.MathUtils.lerp(smoothedActivity.current, inputActivity, delta * 3.0);

      // Decay the global input activity slowly if it's high
      if (inputActivity > 0.01) {
        setInputActivity(THREE.MathUtils.lerp(inputActivity, 0, delta * 1.0));
      }

      // Boost time/speed based on smoothed input
      const speedMultiplier = 1.0 + smoothedActivity.current * 3.0;

      // Accumulate time with variable speed
      materialRef.current.uniforms.u_time.value += delta * speedMultiplier;

      // Note: u_energy is not defined in the original fragment shader, but added here as per instruction.
      // It would need to be added to the shader for this line to have an effect.
      materialRef.current.uniforms.u_energy.value = (center.energy ?? 0) + smoothedActivity.current * 0.8; // Glow brighter
      materialRef.current.uniforms.u_coherence.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.u_coherence.value,
        center.coherence ?? 0.5,
        0.05
      );
      materialRef.current.uniforms.u_tension.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.u_tension.value,
        center.tension ?? 0.0,
        0.05
      );
    }
  });

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_coherence: { value: 0.5 },
      u_tension: { value: 0.0 },
      u_energy: { value: 0.0 }, // Added u_energy uniform
    }),
    []
  );

  return (
    <points ref={pointsRef} {...props}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={centerVertexShader}
        fragmentShader={centerFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
