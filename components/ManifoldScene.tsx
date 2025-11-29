'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { UnifiedManifold } from './manifolds/UnifiedManifold';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

export function ManifoldScene() {
    return (
        <div className="absolute inset-0 w-screen h-screen z-0 bg-black">
            {/* Camera Y position moved up (from 0 to 2) to shift view downwards, effectively moving manifold up */}
            <Canvas
                camera={{ position: [0, 2, 10], fov: 45 }}
                gl={{ antialias: false }}
                style={{ width: '100%', height: '100%' }}
            >
                <Suspense fallback={null}>
                    <color attach="background" args={['#010103']} />

                    {/* Ambient Environment */}
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#4444ff" />

                    {/* Lighting */}
                    <ambientLight intensity={0.2} />
                    <pointLight position={[-10, 5, 5]} intensity={2} color="#8800ff" /> {/* Human side light */}
                    <pointLight position={[10, 5, 5]} intensity={2} color="#00ffff" />  {/* AI side light */}
                    <pointLight position={[0, -5, 5]} intensity={1} color="#ffffff" />  {/* Bottom fill */}

                    {/* Unified Field Manifold */}
                    <UnifiedManifold />

                    <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />

                    {/* Post Processing */}
                    <EffectComposer>

                        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.6} />
                        <Noise opacity={0.05} />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    );
}
