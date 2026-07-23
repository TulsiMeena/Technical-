'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Float } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import * as THREE from 'three';

// Procedural organ component
const OrganMesh = ({ data, isSelected, onClick }: { data: any, isSelected: boolean, onClick: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Simple geometry mapping based on organ type
  let geometry;
  switch(data.id) {
    case 'brain': geometry = <sphereGeometry args={[0.2, 32, 32]} />; break;
    case 'heart': geometry = <coneGeometry args={[0.15, 0.25, 32]} />; break; // Upside down later
    case 'lungs': geometry = <capsuleGeometry args={[0.15, 0.3, 32]} />; break;
    case 'liver': geometry = <tetrahedronGeometry args={[0.2, 2]} />; break;
    default: geometry = <boxGeometry args={[0.2, 0.2, 0.2]} />;
  }

  return (
    <group position={[data.positionX, data.positionY, data.positionZ]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
          rotation={data.id === 'heart' ? [Math.PI, 0, 0] : [0, 0, 0]}
        >
          {geometry}
          <meshPhysicalMaterial
            color={data.color}
            roughness={0.2}
            metalness={0.1}
            transmission={0.1}
            thickness={1}
            emissive={isSelected || hovered ? data.color : '#000000'}
            emissiveIntensity={isSelected ? 0.8 : (hovered ? 0.3 : 0)}
          />
        </mesh>
      </Float>

      {/* Label */}
      {(isSelected || hovered) && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="black"
        >
          {data.name}
        </Text>
      )}
    </group>
  );
};

// Abstract Body Outline
const BodyOutline = () => {
  return (
    <mesh position={[0, 0.7, -0.2]}>
      <capsuleGeometry args={[0.6, 1.8, 32, 32]} />
      <meshPhysicalMaterial
        color="#ffffff"
        transmission={0.95}
        opacity={1}
        metalness={0}
        roughness={0}
        ior={1.5}
        thickness={0.5}
        transparent
      />
    </mesh>
  );
};

export default function AnatomyViewer({ organs, selectedOrgan, onSelectOrgan }: { organs: any[], selectedOrgan: any, onSelectOrgan: (organ: any) => void }) {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
      <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense fallback={null}>
          <BodyOutline />
          {organs.map((organ) => (
            <OrganMesh
              key={organ.id}
              data={organ}
              isSelected={selectedOrgan?.id === organ.id}
              onClick={() => onSelectOrgan(organ)}
            />
          ))}
          <Environment preset="city" />
          <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={5} blur={2} far={2} />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={!selectedOrgan}
          autoRotateSpeed={0.5}
          target={[0, 0.8, 0]}
          minDistance={1}
          maxDistance={6}
        />
      </Canvas>

      {/* Overlays */}
      <div className="absolute top-4 left-4 text-white/50 text-sm font-medium tracking-widest uppercase">
        Interactive 3D Viewer
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-white/50 text-xs text-center">
        Left Click: Rotate • Scroll: Zoom • Right Click: Pan
      </div>
    </div>
  );
}
