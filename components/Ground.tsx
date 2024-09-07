// components/Ground.tsx
import { RigidBody } from "@react-three/rapier";

export default function Ground() {
  return (
    <RigidBody type="fixed" friction={1} restitution={0.2}>
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 1000]} />
        <meshStandardMaterial color="#d1d1d1" />
      </mesh>
    </RigidBody>
  );
}
