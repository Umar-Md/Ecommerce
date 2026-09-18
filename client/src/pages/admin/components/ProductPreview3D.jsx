import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Float,
  Image,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";

function ProductObject({ imageUrl }) {
  return (
    <Float rotationIntensity={0.12} floatIntensity={0.35} speed={1.5}>
      <RoundedBox args={[2.65, 3.2, 0.24]} radius={0.18} smoothness={5}>
        <meshStandardMaterial color="#f8fafc" roughness={0.28} metalness={0.08} />
      </RoundedBox>
      {imageUrl ? (
        <Image url={imageUrl} position={[0, 0, 0.14]} scale={[2.35, 2.9, 1]} transparent />
      ) : (
        <mesh position={[0, 0, 0.14]}>
          <planeGeometry args={[2.35, 2.9]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.45} />
        </mesh>
      )}
      <mesh position={[0, -1.18, 0.16]}>
        <boxGeometry args={[1.1, 0.08, 0.03]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} />
      </mesh>
    </Float>
  );
}

export default function ProductPreview3D({ imageUrl, productName }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-inner">
      <div className="flex items-start justify-between px-5 pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-400">
            3D product stage
          </p>
          <h3 className="mt-1 text-lg font-bold">{productName || "Your product"}</h3>
        </div>
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
          Drag to inspect
        </span>
      </div>
      <div className="h-72 sm:h-80">
        <Canvas camera={{ position: [0, 0, 5.8], fov: 34 }} dpr={[1, 1.5]}>
          <color attach="background" args={["#0f172a"]} />
          <ambientLight intensity={1.8} />
          <directionalLight position={[3, 4, 5]} intensity={3.5} color="#fff7ed" />
          <pointLight position={[-3, 1, 2]} intensity={8} color="#f59e0b" />
          <Suspense fallback={null}>
            <ProductObject imageUrl={imageUrl} />
          </Suspense>
          <ContactShadows position={[0, -1.82, 0]} opacity={0.5} scale={5} blur={2.8} far={4} />
          <OrbitControls enablePan={false} minDistance={4.5} maxDistance={7} />
        </Canvas>
      </div>
      <p className="border-t border-white/10 px-5 py-3 text-xs text-slate-400">
        {imageUrl ? "Showing the first gallery image" : "Add an image to preview the product"}
      </p>
    </section>
  );
}
