"use client";
import { Canvas } from "@react-three/fiber";
import { Float, Sparkles, MeshDistortMaterial } from "@react-three/drei";

function Orb() {
  return (
    <Float speed={1.4} rotationIntensity={1.1} floatIntensity={1.6}>
      <mesh>
        <icosahedronGeometry args={[1.5, 12]} />
        <MeshDistortMaterial
          color="#7fe0d4"
          emissive="#123a3a"
          emissiveIntensity={0.6}
          roughness={0.18}
          metalness={0.35}
          distort={0.42}
          speed={1.8}
        />
      </mesh>
    </Float>
  );
}

export default function DreamHero() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.6]}>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={45} color="#7fe0d4" />
      <pointLight position={[-5, -2, 2]} intensity={35} color="#ffb38a" />
      <pointLight position={[0, 3, -4]} intensity={25} color="#9a7fff" />
      <Orb />
      <Sparkles count={130} scale={12} size={2.2} speed={0.3} opacity={0.7} color="#cdd6e8" />
    </Canvas>
  );
}
