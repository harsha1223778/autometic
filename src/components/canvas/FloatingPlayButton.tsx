'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FloatingPlayButton({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.25;
    meshRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    meshRef.current.rotation.x = Math.cos(t * 0.6) * 0.15;
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Outer Glow Ring */}
      <mesh>
        <torusGeometry args={[1.2, 0.06, 16, 64]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Center Translucent Play Triangle */}
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.7, 1.1, 3]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          emissive="#6366f1"
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.3}
          transmission={0.6}
          thickness={0.5}
        />
      </mesh>
    </group>
  );
}
