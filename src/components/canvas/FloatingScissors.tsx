'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FloatingScissors({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const blade1Ref = useRef<THREE.Group>(null);
  const blade2Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 1.3 + 4) * 0.2;
    groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.2;

    const scissorAngle = Math.abs(Math.sin(t * 2)) * 0.25;
    if (blade1Ref.current) blade1Ref.current.rotation.z = scissorAngle;
    if (blade2Ref.current) blade2Ref.current.rotation.z = -scissorAngle;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Center Pivot Pin */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} />
      </mesh>

      {/* Blade 1 */}
      <group ref={blade1Ref}>
        <mesh position={[0.5, 0.3, 0]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[1.2, 0.1, 0.04]} />
          <meshStandardMaterial color="#06b6d4" metalness={0.9} roughness={0.1} emissive="#0891b2" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[-0.4, -0.3, 0]}>
          <torusGeometry args={[0.22, 0.04, 16, 32]} />
          <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Blade 2 */}
      <group ref={blade2Ref}>
        <mesh position={[0.5, -0.3, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[1.2, 0.1, 0.04]} />
          <meshStandardMaterial color="#06b6d4" metalness={0.9} roughness={0.1} emissive="#0891b2" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[-0.4, 0.3, 0]}>
          <torusGeometry args={[0.22, 0.04, 16, 32]} />
          <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}
