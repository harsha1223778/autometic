'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FloatingMusicWave({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const barsRef = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 1.8 + 2) * 0.18;
    groupRef.current.rotation.y = Math.cos(t * 0.5) * 0.2;

    barsRef.current.forEach((bar, index) => {
      if (bar) {
        const scale = 0.5 + Math.abs(Math.sin(t * 3 + index * 0.6)) * 1.5;
        bar.scale.y = scale;
      }
    });
  });

  const barCount = 7;
  const barSpacing = 0.28;

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: barCount }).map((_, i) => {
        const x = (i - (barCount - 1) / 2) * barSpacing;
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) barsRef.current[i] = el;
            }}
            position={[x, 0, 0]}
          >
            <boxGeometry args={[0.12, 1, 0.12]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#ec4899' : '#8b5cf6'}
              emissive={i % 2 === 0 ? '#f43f5e' : '#7c3aed'}
              emissiveIntensity={1.2}
              roughness={0.2}
              metalness={0.7}
            />
          </mesh>
        );
      })}
    </group>
  );
}
