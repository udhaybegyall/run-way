import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { RigidBody, RapierRigidBody, vec3 } from "@react-three/rapier";
import * as THREE from "three";

type VehicleProps = {
  setScore: React.Dispatch<React.SetStateAction<number>>;
  onGameOver: () => void;
  gameOver: boolean;
};

export default function Vehicle({
  setScore,
  onGameOver,
  gameOver,
}: VehicleProps) {
  const vehicle = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (gameOver) {
      resetVehicle();
    }
  }, [gameOver]);

  const resetVehicle = () => {
    if (!vehicle.current) return;
    vehicle.current.setTranslation(vec3({ x: 0, y: 1, z: 0 }), true);
    vehicle.current.setRotation(new THREE.Quaternion(), true);
    vehicle.current.setLinvel(vec3({ x: 0, y: 0, z: 0 }), true);
    vehicle.current.setAngvel(vec3({ x: 0, y: 0, z: 0 }), true);
  };

  useFrame((state, delta) => {
    if (!vehicle.current || gameOver) return;

    const { forward, backward } = getKeys();
    const vehiclePosition = vehicle.current.translation();
    const vehicleRotation = vehicle.current.rotation();

    // Convert Rapier's Rotation to Three.js Quaternion
    const threeQuaternion = new THREE.Quaternion(
      vehicleRotation.x,
      vehicleRotation.y,
      vehicleRotation.z,
      vehicleRotation.w
    );

    // Get the forward direction of the vehicle
    const forwardDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      threeQuaternion
    );

    // Calculate the impulse based on the forward direction
    const speedMultiplier = 0.9;
    const impulseStrength = 50 * delta * speedMultiplier;
    const impulse = new THREE.Vector3();

    if (forward) {
      impulse.addScaledVector(forwardDirection, impulseStrength);
    }
    if (backward) {
      impulse.addScaledVector(forwardDirection, -impulseStrength);
    }

    // Apply steering based on mouse position
    const steeringStrength = 2 * delta;
    const targetRotationY = -(mousePosition.current.x * Math.PI) / 4; // Max 45 degrees rotation
    const currentRotation = new THREE.Euler().setFromQuaternion(
      threeQuaternion
    );

    // Smoothly interpolate the rotation
    currentRotation.y = THREE.MathUtils.lerp(
      currentRotation.y,
      targetRotationY,
      steeringStrength
    );

    // Convert back to Quaternion and set the rotation
    const newQuaternion = new THREE.Quaternion().setFromEuler(currentRotation);
    vehicle.current.setRotation(
      {
        x: newQuaternion.x,
        y: newQuaternion.y,
        z: newQuaternion.z,
        w: newQuaternion.w,
      },
      true
    );

    // Apply the impulse
    vehicle.current.applyImpulse(
      vec3({ x: impulse.x, y: impulse.y, z: impulse.z }),
      true
    );

    // Restrict horizontal movement (without forcing back to center)
    const horizontalBoundary = 15;
    if (Math.abs(vehiclePosition.x) > horizontalBoundary) {
      const clampedX = Math.sign(vehiclePosition.x) * horizontalBoundary;
      vehicle.current.setTranslation(
        vec3({ x: clampedX, y: vehiclePosition.y, z: vehiclePosition.z }),
        true
      );
    }

    // Update camera (zoomed out)
    const cameraPosition = new THREE.Vector3(0, 8, 15)
      .applyQuaternion(newQuaternion)
      .add(vehiclePosition);
    const cameraTarget = new THREE.Vector3().copy(vehiclePosition);

    camera.position.lerp(cameraPosition, 5 * delta);
    camera.lookAt(cameraTarget);

    // Update score only when moving forward
    const velocity = vehicle.current.linvel();
    if (velocity.z < -0.1) {
      setScore((prevScore) => prevScore + delta);
    }

    // Check for collision with ground
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
        {/* Car body */}
        <mesh castShadow>
          <boxGeometry args={[2, 0.5, 3]} />
          <meshStandardMaterial color="#f6a1a1" />
        </mesh>

        {/* Front wheel (centered) */}
        <mesh castShadow position={[0, -0.25, 1.2]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>

        {/* Back left wheel */}
        <mesh
          castShadow
          position={[-0.9, -0.25, -1.2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.4, 0.4, 0.4, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>

        {/* Back right wheel */}
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
