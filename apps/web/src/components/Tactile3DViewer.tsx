import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  deformationField: number[][] | null;
  stressField: number[][] | null;
  gridSize?: [number, number];
  activeDigits?: string[];
  appliedForce?: number;
  maxForceCap?: number;
}

const DIGIT_POSITIONS: Record<string, [number, number, number]> = {
  thumb: [-1.2, 0, -1.0],
  index: [-0.4, 0, -1.4],
  middle: [0.4, 0, -1.4],
  ring: [1.0, 0, -1.0],
  pinky: [1.5, 0, -0.5],
};

// Shear direction vectors per digit (lateral cut direction)
const DIGIT_SHEAR: Record<string, [number, number, number]> = {
  thumb: [-0.6, 0, 0.3],
  index: [0, 0, 1],
  middle: [0, 0, 1],
  ring: [0.6, 0, 0.3],
  pinky: [0.8, 0, 0.1],
};

const getForceColor = (force: number, forceCap: number): THREE.Color => {
  const ratio = Math.min(Math.max(force / forceCap, 0), 1);
  // HSL: green (0.33) -> red (0.0)
  return new THREE.Color().setHSL(0.33 * (1 - ratio), 1.0, 0.5);
};

function GelMesh({ deformationField, stressField, gridSize = [32, 32] }: { deformationField: number[][] | null; stressField: number[][] | null; gridSize?: [number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [w, h] = gridSize;

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(4, 4, w - 1, h - 1);
    g.rotateX(-Math.PI / 2);
    const count = g.attributes.position.count;
    const colors = new Float32Array(count * 3);
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [w, h]);

  useEffect(() => {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const col = geometry.attributes.color as THREE.BufferAttribute;
    const field = deformationField;
    const stress = stressField;
    const segX = w;
    const segY = h;

    let maxStress = 1;
    if (stress) {
      for (let y = 0; y < segY; y++) {
        for (let x = 0; x < segX; x++) {
          const v = stress[y]?.[x] ?? 0;
          if (v > maxStress) maxStress = v;
        }
      }
    }

    for (let y = 0; y < segY; y++) {
      for (let x = 0; x < segX; x++) {
        const idx = y * segX + x;
        const disp = field?.[y]?.[x] ?? 0;
        pos.setY(idx, disp * 2.5);
        const s = stress ? (stress[y]?.[x] ?? 0) / maxStress : disp * 0.5;
        const color = new THREE.Color();
        if (s < 0.33) {
          color.lerpColors(new THREE.Color('#1e3a8a'), new THREE.Color('#10b981'), s / 0.33);
        } else if (s < 0.66) {
          color.lerpColors(new THREE.Color('#10b981'), new THREE.Color('#f59e0b'), (s - 0.33) / 0.33);
        } else {
          color.lerpColors(new THREE.Color('#f59e0b'), new THREE.Color('#ef4444'), (s - 0.66) / 0.34);
        }
        col.setXYZ(idx, color.r, color.g, color.b);
      }
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [deformationField, stressField, geometry, w, h]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.25} metalness={0.1} transparent opacity={0.92} side={THREE.DoubleSide} />
    </mesh>
  );
}

function GlowSphereOverlay({ activeDigits, appliedForce, maxForceCap }: { activeDigits: string[]; appliedForce: number; maxForceCap: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Clear previous
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
      if ((child as THREE.Mesh).material) {
        const m = (child as THREE.Mesh).material;
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose()); else m.dispose();
      }
    }

    const force = Math.max(appliedForce, 0.01);
    const cap = Math.max(maxForceCap, 0.01);

    activeDigits.forEach((d) => {
      const pos = DIGIT_POSITIONS[d];
      if (!pos) return;
      const color = getForceColor(force, cap);

      // 1. Translucent neon sphere (grows with force)
      const sphereRadius = 0.04 + (force / cap) * 0.03;
      const sphereGeo = new THREE.SphereGeometry(sphereRadius, 16, 16);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
        metalness: 0.2,
        transmission: 0.9,
        thickness: 0.5,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(...pos);
      group.add(sphereMesh);

      // 2. Force vector arrow (shear direction)
      const shear = DIGIT_SHEAR[d] || [0, 0, 1];
      const dir = new THREE.Vector3(...shear).normalize();
      const origin = new THREE.Vector3(...pos);
      const length = 0.15 * (force / cap);
      const arrow = new THREE.ArrowHelper(dir, origin, length, color.getHex(), 0.04, 0.02);
      group.add(arrow);
    });
  }, [activeDigits, appliedForce, maxForceCap]);

  return <group ref={groupRef} />;
}

export default function Tactile3DViewer({ deformationField, stressField, gridSize = [32, 32], activeDigits = [], appliedForce = 1.1, maxForceCap = 1.8 }: Props) {
  return (
    <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: 0 }}>3D Gel Deformation • Three.js (Glow Spheres + Force Vectors)</h3>
      </div>
      <div style={{ width: '100%', height: 420 }}>
        <Canvas camera={{ position: [0, 4, 4], fov: 45 }} shadows>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
          <pointLight position={[-4, 4, -4]} intensity={0.6} color="#8b5cf6" />
          <GelMesh deformationField={deformationField} stressField={stressField} gridSize={gridSize} />
          <GlowSphereOverlay activeDigits={activeDigits} appliedForce={appliedForce} maxForceCap={maxForceCap} />
          <OrbitControls enableDamping dampingFactor={0.08} />
          <gridHelper args={[4, 32, '#24242f', '#1a1a24']} />
        </Canvas>
      </div>
      <div style={{ padding: '8px 16px', fontSize: 11, color: 'var(--sub)' }}>
        Drag to rotate • Scroll to zoom • Vertex Z = gel displacement (mm) • Color = pressure • Glow spheres = contact force (green→red) • Arrows = shear vector direction
      </div>
    </div>
  );
}
