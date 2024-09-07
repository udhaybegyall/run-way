import { useState, useCallback, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

const shapeTypes = ["box", "sphere", "cylinder"] as const;
type ShapeType = (typeof shapeTypes)[number];

const colors = ["#FFB3BA", "#BAFFC9", "#FFFFBA"] as const;
type ColorType = (typeof colors)[number];

interface Shape {
  id: number;
  type: ShapeType;
  color: ColorType;
  position: [number, number, number];
  scale: [number, number, number];
}

interface ShapeProps extends Omit<Shape, "id"> {
  onCollision: () => void;
}

function Shape({ type, color, position, scale, onCollision }: ShapeProps) {
  const shapeRef = useRef<RapierRigidBody>(null);

  useFrame(() => {
    if (shapeRef.current && shapeRef.current.translation().y < -10) {
      shapeRef.current.setTranslation(
        { x: position[0], y: 20, z: position[2] },
        true
      );
      shapeRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={shapeRef}
      position={position}
      colliders="hull"
      onCollisionEnter={({ other }) => {
        if (other.rigidBodyObject?.name === "vehicle") {
          onCollision();
        }
      }}
    >
      <mesh castShadow scale={scale}>
        {type === "box" && <boxGeometry />}
        {type === "sphere" && <sphereGeometry />}
        {type === "cylinder" && <cylinderGeometry />}
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

interface FallingShapesProps {
  onCollision: () => void;
  gameOver: boolean;
}

export default function FallingShapes({
  onCollision,
  gameOver,
}: FallingShapesProps) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const lastSpawnTime = useRef(0);
  const lastVehiclePosition = useRef(new THREE.Vector3());

  const addShape = useCallback((vehiclePosition: THREE.Vector3) => {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 10 - 5;
    const z = vehiclePosition.z - (Math.random() * 20 + 30); // Spawn further ahead of the vehicle
    const scale: [number, number, number] = [
      Math.random() * 0.5 + 0.5,
      Math.random() * 0.5 + 0.5,
      Math.random() * 0.5 + 0.5,
    ];

    setShapes((prevShapes) => [
      ...prevShapes,
      {
        id: Date.now(),
        type,
        color,
        position: [x, 20, z],
        scale,
      },
    ]);
  }, []);

  useEffect(() => {
    if (gameOver) {
      setShapes([]);
    }
  }, [gameOver]);

  useFrame((state) => {
    if (gameOver) return;

    const vehiclePosition = state.camera.position;
    const currentTime = state.clock.getElapsedTime();

    // Check if the vehicle is moving
    const isMoving =
      vehiclePosition.distanceTo(lastVehiclePosition.current) > 0.1;

    // Only spawn shapes when the vehicle is moving and enough time has passed
    if (isMoving && currentTime - lastSpawnTime.current > 1) {
      addShape(vehiclePosition);
      lastSpawnTime.current = currentTime;
    }

    lastVehiclePosition.current.copy(vehiclePosition);
  });

  return (
    <>
      {shapes.map((shape) => (
        <Shape key={shape.id} {...shape} onCollision={onCollision} />
      ))}
    </>
  );
}
