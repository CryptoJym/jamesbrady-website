import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import { HumanManifold } from './manifolds/HumanManifold';
import { AIManifold } from './manifolds/AIManifold';
import { CenterManifold } from './manifolds/CenterManifold';
import { EntanglementField } from './manifolds/EntanglementField';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

export function ManifoldScene() {
    return (
        <div className="absolute inset-0 w-full h-full z-0 bg-black">
            <Canvas
                camera={{ position: [0, 1.5, 12], fov: 50 }}
                gl={{ antialias: true, alpha: false }}
                style={{ width: '100%', height: '100%' }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#020208']} />

                <Suspense fallback={null}>
                    {/* Stars and Particles */}
                    <Stars
                        radius={80}
                        depth={60}
                        count={3000}
                        factor={3}
                        saturation={0.1}
                        fade
                        speed={0.5}
                    />
                    <Sparkles
                        count={150}
                        scale={10}
                        size={1.5}
                        speed={0.3}
                        opacity={0.4}
                        color="#6366f1"
                    />
                    <Sparkles
                        count={100}
                        scale={8}
                        size={1}
                        speed={0.2}
                        opacity={0.3}
                        color="#22d3ee"
                    />

                    {/* Lighting Setup */}
                    <ambientLight intensity={0.4} />
                    <pointLight position={[-8, 4, 6]} intensity={2} color="#a855f7" />
                    <pointLight position={[-5, -3, 4]} intensity={1} color="#ec4899" />
                    <pointLight position={[8, 4, 6]} intensity={2} color="#22d3ee" />
                    <pointLight position={[5, -3, 4]} intensity={1} color="#14b8a6" />
                    <pointLight position={[0, 0, 8]} intensity={1} color="#ffffff" />
                    <pointLight position={[0, -6, 3]} intensity={0.6} color="#4f46e5" />



                    {/* The Three Manifolds */}
                    <HumanManifold position={[-4, 0, 0]} />
                    <CenterManifold position={[0, 0, 0]} />
                    <AIManifold position={[4, 0, 0]} />

                    {/* Entanglement Field (Transformer Connections) */}
                    <EntanglementField />

                    {/* Camera Controls */}
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        maxDistance={20}
                        minDistance={5}
                        maxPolarAngle={Math.PI / 1.6}
                        minPolarAngle={Math.PI / 3.5}
                        rotateSpeed={0.3}
                        autoRotate
                        autoRotateSpeed={0.15}
                    />

                    {/* Post Processing */}
                    <EffectComposer enableNormalPass={false}>
                        <Bloom
                            luminanceThreshold={0.5}
                            luminanceSmoothing={0.7}
                            mipmapBlur
                            intensity={0.4}
                            radius={0.4}
                        />
                        <Noise opacity={0.03} />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    );
}
