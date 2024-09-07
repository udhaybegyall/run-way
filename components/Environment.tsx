import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";
import * as THREE from "three";

const Tree = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <mesh castShadow position={[0, 1, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </group>
  );
};

const Cloud = ({ position }: { position: [number, number, number] }) => {
  const cloudRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cloudRef.current) {
      cloudRef.current.position.z =
        ((position[2] + state.clock.elapsedTime * 0.2) % 200) - 100;
    }
  });

  return (
    <group ref={cloudRef} position={position}>
      <Instances>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="white" />
        <Instance position={[0, 0, 0]} />
        <Instance position={[1, 0.2, 0]} />
        <Instance position={[-1, 0.2, 0]} />
        <Instance position={[0.5, 0.7, 0]} />
        <Instance position={[-0.5, 0.7, 0]} />
      </Instances>
    </group>
  );
};

export default function Environment() {
  return (
    <>
      {/* Trees on the edges */}
      {Array.from({ length: 100 }).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        return (
          <Tree
            key={`tree-${i}`}
            position={[
              side * (14 + Math.random() * 2),
              0,
              Math.random() * 1000 - 500,
            ]}
          />
        );
      })}

      {/* Clouds */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Cloud
          key={`cloud-${i}`}
          position={[
            Math.random() * 80 - 40,
            Math.random() * 5 + 10,
            Math.random() * 200 - 100,
          ]}
        />
      ))}
    </>
  );
}
