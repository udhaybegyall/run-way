// components/Ground.tsx
import { RigidBody } from "@react-three/rapier";

export default function Ground() {
  return (
    <RigidBody type="fixed" friction={1} restitution={0.2}>
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[1000, 1, 1000]} />
        <meshStandardMaterial color="#8aaf7e" />
      </mesh>
    </RigidBody>
  );
}
