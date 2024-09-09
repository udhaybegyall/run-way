import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { RigidBody, RapierRigidBody, vec3 } from "@react-three/rapier";
import * as THREE from "three";

type VehicleProps = {
  setScore: React.Dispatch<React.SetStateAction<number>>;
  onGameOver: () => void;
  gameOver: boolean;
  orbitControlActive: boolean;
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;
  isLocked: boolean;
  exitPointerLock: () => void;
};

export default function Vehicle({
  setScore,
  onGameOver,
  gameOver,
  orbitControlActive,
  setIsLocked,
  isLocked,
  exitPointerLock,
}: VehicleProps) {
  const vehicle = useRef<RapierRigidBody>(null);
  const { camera, gl } = useThree();
  const [, getKeys] = useKeyboardControls();
  const [rotationY, setRotationY] = useState(0);

  useEffect(() => {
    const canvas = gl.domElement;

    const lockPointer = () => {
      if (!isLocked && !orbitControlActive) {
        canvas.requestPointerLock();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isLocked && !orbitControlActive) {
        setRotationY((prev) => prev - event.movementX * 0.002);
      }
    };

    canvas.addEventListener("click", lockPointer);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("click", lockPointer);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [gl, isLocked, orbitControlActive, setIsLocked]);

  useEffect(() => {
    if (orbitControlActive) {
      exitPointerLock();
    }
  }, [orbitControlActive, exitPointerLock]);

  useEffect(() => {
    if (gameOver) {
      resetVehicle();
      exitPointerLock();
    }
  }, [gameOver, exitPointerLock]);

  const resetVehicle = () => {
    if (!vehicle.current) return;
    vehicle.current.setTranslation(vec3({ x: 0, y: 1, z: 0 }), true);
    vehicle.current.setRotation(new THREE.Quaternion(), true);
    vehicle.current.setLinvel(vec3({ x: 0, y: 0, z: 0 }), true);
    vehicle.current.setAngvel(vec3({ x: 0, y: 0, z: 0 }), true);
    setRotationY(0);
  };

  useFrame((state, delta) => {
    if (!vehicle.current || gameOver) return;

    const { forward, backward } = getKeys();
    const vehiclePosition = vehicle.current.translation();

    const threeQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, rotationY, 0)
    );

    const forwardDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      threeQuaternion
    );

    const speedMultiplier = 0.9;
    const impulseStrength = 50 * delta * speedMultiplier;
    const impulse = new THREE.Vector3();

    if (forward) {
      impulse.addScaledVector(forwardDirection, impulseStrength);
    }
    if (backward) {
      impulse.addScaledVector(forwardDirection, -impulseStrength);
    }

    vehicle.current.setRotation(threeQuaternion, true);

    vehicle.current.applyImpulse(
      vec3({ x: impulse.x, y: impulse.y, z: impulse.z }),
      true
    );

    const cameraPosition = new THREE.Vector3(0, 8, 15)
      .applyQuaternion(threeQuaternion)
      .add(vehiclePosition);
    const cameraTarget = new THREE.Vector3().copy(vehiclePosition);

    camera.position.lerp(cameraPosition, 5 * delta);
    camera.lookAt(cameraTarget);

    const velocity = vehicle.current.linvel();
    if (velocity.z < -0.1) {
      setScore((prevScore) => prevScore + delta);
    }

    if (vehiclePosition.y < -5) {
      onGameOver();
    }
  });

  return (
    <RigidBody
      ref={vehicle}
      colliders="cuboid"
      mass={1}
      linearDamping={0.5}
      angularDamping={0.5}
      name="vehicle"
    >
      <group>
        <mesh castShadow>
          <boxGeometry args={[2, 0.5, 3]} />
          <meshStandardMaterial color="#f6a1a1" />
        </mesh>
        <mesh castShadow position={[0, -0.25, 1.2]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh
          castShadow
          position={[-0.9, -0.25, -1.2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.4, 0.4, 0.4, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh
          castShadow
          position={[0.9, -0.25, -1.2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.4, 0.4, 0.4, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </RigidBody>
  );
}
