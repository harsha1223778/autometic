'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FloatingSubtitleCard({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 1.1 + 3) * 0.16;
    groupRef.current.rotation.y = Math.sin(t * 0.7) * 0.2;
    groupRef.current.rotation.z = Math.cos(t * 0.4) * 0.05;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Translucent Backdrop Card */}
      <mesh>
        <boxGeometry args={[1.8, 0.6, 0.08]} />
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.1}
          metalness={0.2}
          transmission={0.8}
          thickness={0.2}
          reflectivity={0.9}
          clearcoat={1}
        />
      </mesh>

      {/* Simulated Subtitle Text Bars */}
      <mesh position={[-0.2, 0.08, 0.05]}>
        <boxGeometry args={[1.1, 0.08, 0.02]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0.1, -0.1, 0.05]}>
        <boxGeometry args={[1.3, 0.08, 0.02]} />
        <meshStandardMaterial color="#e0e7ff" emissive="#c7d2fe" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}
