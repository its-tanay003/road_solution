import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, RoundedBox } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useEmergencyStore } from '../store';

const Vehicle = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { crashTriggered, gForceData } = useEmergencyStore();

  useFrame((state) => {
    if (!meshRef.current) return;

    if (!crashTriggered) {
      // Subtle idle bob animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.5;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    } else {
      // Crash spin and settle
      meshRef.current.rotation.x += (gForceData.x * 0.1 - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (gForceData.y * 0.1 - meshRef.current.rotation.y) * 0.1;
      meshRef.current.rotation.z += (gForceData.z * 0.1 - meshRef.current.rotation.z) * 0.1;
      
      // Impact bounce
      const impactY = 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.2 * Math.exp(-(state.clock.elapsedTime % 1) * 5);
      meshRef.current.position.y = Math.max(0.5, impactY);
    }
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[2, 0.8, 1]} // Width, height, depth
      radius={0.1}
      smoothness={4}
      position={[0, 0.5, 0]}
    >
      <meshStandardMaterial
        color="#c0c0c0"
        metalness={0.8}
        roughness={0.2}
        envMapIntensity={1}
      />
    </RoundedBox>
  );
};

export const CrashReconstruction3D: React.FC = () => {
  const { crashTriggered, gForceData } = useEmergencyStore();

  return (
    <div className="relative w-full h-[280px] bg-[#080C14] rounded-2xl overflow-hidden border border-white/5">
      <motion.div
        animate={crashTriggered ? {
          x: [-8, 8, -6, 6, -3, 3, 0],
          transition: { duration: 0.3 }
        } : {}}
        className="w-full h-full"
      >
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={40} />
          <OrbitControls 
            enablePan={false} 
            minDistance={4} 
            maxDistance={10}
            maxPolarAngle={Math.PI / 2.1}
          />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

          <Vehicle />
          
          <Grid
            renderOrder={-1}
            position={[0, 0, 0]}
            infiniteGrid
            cellSize={1}
            cellThickness={1}
            cellColor="#1e293b"
            sectionSize={5}
            sectionThickness={1.5}
            sectionColor="#334155"
            fadeDistance={30}
          />
        </Canvas>
      </motion.div>

      {/* HTML Overlays */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {crashTriggered && (
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                IMPACT: {gForceData.x.toFixed(1)}G
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2"
              >
                ROTATION: {Math.abs(Math.round(gForceData.z * 15))}°
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-red-600 text-white px-4 py-1.5 rounded-(--radius-lg) text-xs font-black uppercase tracking-[0.2em] animate-pulse shadow-lg shadow-red-500/20 border border-red-400/50"
              >
                SEVERITY: CRITICAL
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 right-4 text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
        3D RECONSTRUCTION v1.2
      </div>
    </div>
  );
};
