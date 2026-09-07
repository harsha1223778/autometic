'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FloatingFilmReel({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const reelRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(t * 1.2 + 1) * 0.2;
      groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
    }
    if (reelRef.current) {
      reelRef.current.rotation.z += delta * 0.6;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Outer Reel Disk */}
      <mesh ref={reelRef}>
        <cylinderGeometry args={[1.1, 1.1, 0.15, 32]} />
        <meshStandardMaterial
          color="#1e1b4b"
          emissive="#4338ca"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.8}
        />
        {/* Spokes */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI) / 3) * 0.55, Math.sin((i * Math.PI) / 3) * 0.55, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.18, 16]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} roughness={0.2} />
          </mesh>
        ))}
      </mesh>
    </group>
  );
}
