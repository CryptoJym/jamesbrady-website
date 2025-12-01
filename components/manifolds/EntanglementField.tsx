'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/lib/state';

// A single strand within the flow field
function FlowStrand({ start, end, startColor, endColor, offset, speed, dash, tension, radius }: {
    start: [number, number, number],
    end: [number, number, number],
    startColor: THREE.Color,
    endColor: THREE.Color,
    offset: number,
    speed: number,
    dash: number,
    tension: number,
    radius: number
}) {
    const ref = useRef<any>(null);

    // Calculate base control points
    const baseMidA = useMemo(() => [
        (start[0] + end[0]) / 3,
        (start[1] + end[1]) / 3,
        (start[2] + end[2]) / 3
    ] as [number, number, number], [start, end]);

    const baseMidB = useMemo(() => [
        (start[0] + end[0]) * 2 / 3,
        (start[1] + end[1]) * 2 / 3,
        (start[2] + end[2]) * 2 / 3
    ] as [number, number, number], [start, end]);

    // Random phase and turbulence
    const phase = useMemo(() => Math.random() * Math.PI * 2, []);
    const turbulenceA = useMemo(() => [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2], []);
    const turbulenceB = useMemo(() => [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2], []);

    // Generate points for the curve
    // We need to update these in useFrame for the "breathing" effect, 
    // but regenerating geometry every frame is expensive.
    // Instead, we'll use a static curve with dynamic material properties for now,
    // OR we can update the points if we accept the CPU cost.
    // Given the "fluid" requirement, let's try updating points for 20% of strands per frame or just use the material trick.
    // Actually, Line from Drei updates geometry efficiently. Let's try calculating points in useMemo first.

    const curve = useMemo(() => {
        const vStart = new THREE.Vector3(...start);
        const vEnd = new THREE.Vector3(...end);

        // Spread control points
        const vMidA = new THREE.Vector3(
            baseMidA[0] + (Math.random() - 0.5) * radius * 3,
            baseMidA[1] + (Math.random() - 0.5) * radius * 3,
            baseMidA[2] + (Math.random() - 0.5) * radius * 3
        );
        const vMidB = new THREE.Vector3(
            baseMidB[0] + (Math.random() - 0.5) * radius * 3,
            baseMidB[1] + (Math.random() - 0.5) * radius * 3,
            baseMidB[2] + (Math.random() - 0.5) * radius * 3
        );

        return new THREE.CubicBezierCurve3(vStart, vMidA, vMidB, vEnd);
    }, [start, end, baseMidA, baseMidB, radius]);

    const points = useMemo(() => curve.getPoints(20), [curve]);

    // Vertex Colors for Gradient (Ghostly White)
    const vertexColors = useMemo(() => {
        const colors = [];
        // Pure white but we rely on opacity for the "ghostly" look
        const white = new THREE.Color(1, 1, 1);
        for (let i = 0; i <= 20; i++) {
            colors.push(white);
        }
        return colors;
    }, [startColor, endColor]);

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime();

            // Animate dash offset
            ref.current.material.dashOffset -= speed * 0.01; // Slower, more drifting flow

            // Pulse opacity (Low opacity for ghostly effect)
            ref.current.material.opacity = 0.1 + 0.1 * Math.sin(t * 1.0 + offset);

            // Thicker, breathing lines
            // User asked for "thicker" and "less defined"
            ref.current.material.linewidth = 4.0 + 2.0 * Math.sin(t * 1.5 + offset);
        }
    });

    return (
        <Line
            ref={ref}
            points={points}
            vertexColors={vertexColors}
            lineWidth={5} // Thicker base width
            dashed
            dashScale={dash}
            dashSize={dash * 0.5}
            gapSize={dash * 0.2} // Slightly larger gaps for "broken" ghost look
            opacity={0.15} // Low base opacity for transparency
            transparent
            depthWrite={false} // Helps with "ghostly" blending
            blending={THREE.AdditiveBlending} // Additive blending makes overlapping strands glow
        />
    );
}

function VolumetricBundle({ start, end, startColor, endColor, count, speed, dash, tension, radius }: {
    start: [number, number, number],
    end: [number, number, number],
    startColor: THREE.Color,
    endColor: THREE.Color,
    count: number,
    speed: number,
    dash: number,
    tension: number,
    radius: number
}) {
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <FlowStrand
                    key={i}
                    start={start}
                    end={end}
                    startColor={startColor}
                    endColor={endColor}
                    offset={i * 0.05}
                    speed={speed * (0.8 + Math.random() * 0.4)}
                    dash={dash * (0.8 + Math.random() * 0.4)}
                    tension={tension}
                    radius={radius}
                />
            ))}
        </group>
    );
}

export function EntanglementField() {
    const { human, ai, center } = useStore((s) => s.conversation);

    const humanPos: [number, number, number] = [-4, 0, 0];
    const aiPos: [number, number, number] = [4, 0, 0];
    const centerPos: [number, number, number] = [0, 0, 0];

    const coherence = center.coherence || 0.5;
    const tension = center.tension || 0.0;

    // Base Colors
    const humanColor = new THREE.Color('#a855f7');
    const aiColor = new THREE.Color('#06b6d4');
    const centerColor = new THREE.Color('#ffffff'); // White/Gold center
    if (coherence > 0.5) centerColor.lerp(new THREE.Color('#fbbf24'), 0.5);

    // Volumetric Settings
    const baseCount = 15; // Reduced from 60
    const baseRadius = 3.0;

    return (
        <group>
            {/* Human -> Center (Purple -> White) */}
            <VolumetricBundle
                start={humanPos}
                end={centerPos}
                startColor={humanColor}
                endColor={centerColor}
                count={baseCount + Math.floor(human.energy * 10)}
                speed={1 + human.energy}
                dash={3}
                tension={tension}
                radius={baseRadius}
            />

            {/* AI -> Center (Cyan -> White) */}
            <VolumetricBundle
                start={aiPos}
                end={centerPos}
                startColor={aiColor}
                endColor={centerColor}
                count={baseCount + Math.floor(ai.energy * 10)}
                speed={1 + ai.energy}
                dash={3}
                tension={tension}
                radius={baseRadius}
            />

            {/* Human -> AI (Purple -> Cyan) */}
            <VolumetricBundle
                start={humanPos}
                end={aiPos}
                startColor={humanColor}
                endColor={aiColor}
                count={20} // Reduced from 80
                speed={2 + tension * 5}
                dash={coherence > 0.5 ? 8 : 2} // Longer dashes for coherence
                tension={tension}
                radius={baseRadius * 1.5}
            />
        </group>
    );
}
