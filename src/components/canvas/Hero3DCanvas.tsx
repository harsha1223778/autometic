'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import FloatingPlayButton from './FloatingPlayButton';
import FloatingFilmReel from './FloatingFilmReel';
import FloatingMusicWave from './FloatingMusicWave';
import FloatingSubtitleCard from './FloatingSubtitleCard';
import FloatingScissors from './FloatingScissors';
import AnimatedOrb from './AnimatedOrb';
import { Film, Play, Scissors, Music, Sparkles as SparklesIcon } from 'lucide-react';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#c084fc" />
      <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#38bdf8" />
      <pointLight position={[0, 0, 3]} intensity={2} color="#818cf8" distance={8} />

      {/* Floating Sparkles / Particles */}
      <Sparkles count={80} scale={12} size={2.5} speed={0.4} opacity={0.6} color="#38bdf8" />
      <Sparkles count={50} scale={10} size={2} speed={0.3} opacity={0.5} color="#ec4899" />

      {/* Center Animated Holographic Orb */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
        <AnimatedOrb position={[0, 0, -0.5]} />
      </Float>

      {/* Orbiting editing tools */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1.2}>
        <FloatingPlayButton position={[-3.2, 1.8, 0]} />
      </Float>

      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1}>
        <FloatingFilmReel position={[3.4, 1.4, -0.5]} />
      </Float>

      <Float speed={2.2} rotationIntensity={0.4} floatIntensity={1.4}>
        <FloatingMusicWave position={[-3.0, -1.6, 0.5]} />
      </Float>

      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.9}>
        <FloatingSubtitleCard position={[2.8, -1.8, 0.2]} />
      </Float>

      <Float speed={2.5} rotationIntensity={0.7} floatIntensity={1.5}>
        <FloatingScissors position={[0.2, 2.6, 0.8]} />
      </Float>
    </>
  );
}

export default function Hero3DCanvas() {
  const [mounted, setMounted] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full min-h-[420px] bg-transparent" />;
  }

  if (hasWebGLError) {
    // Elegant 2D Fallback if WebGL isn't supported or crashes
    return (
      <div className="w-full h-full min-h-[420px] flex items-center justify-center relative">
        <div className="relative w-64 h-64 rounded-full bg-gradient-to-tr from-purple-600/30 via-cyan-500/20 to-pink-500/30 animate-pulse flex items-center justify-center border border-purple-500/30">
          <Play className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
          <div className="absolute top-2 right-2 p-2 rounded-xl bg-purple-900/60 border border-purple-500/40">
            <Film className="w-6 h-6 text-purple-300" />
          </div>
          <div className="absolute bottom-4 left-2 p-2 rounded-xl bg-pink-900/60 border border-pink-500/40">
            <Music className="w-6 h-6 text-pink-300" />
          </div>
          <div className="absolute top-1/2 -right-4 p-2 rounded-xl bg-cyan-900/60 border border-cyan-500/40">
            <Scissors className="w-6 h-6 text-cyan-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[440px] relative pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        onError={() => setHasWebGLError(true)}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
