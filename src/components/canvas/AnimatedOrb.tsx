'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AnimatedOrb({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const outerWireRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4;
      const scale = 1 + Math.sin(t * 2) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }
    if (outerWireRef.current) {
      outerWireRef.current.rotation.x -= delta * 0.3;
      outerWireRef.current.rotation.y += delta * 0.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Dense Holographic Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshPhysicalMaterial
          color="#6366f1"
          emissive="#4338ca"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.1}
          transmission={0.8}
          thickness={1.2}
          clearcoat={1}
        />
      </mesh>

      {/* Outer Geometric Wireframe Sphere */}
      <mesh ref={outerWireRef}>
        <icosahedronGeometry args={[1.8, 2]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={1.4}
          wireframe
        />
      </mesh>

      {/* Orbiting Equatorial Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.3, 0.04, 16, 64]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#db2777"
          emissiveIntensity={1.6}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
