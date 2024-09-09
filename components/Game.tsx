import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Sky, KeyboardControls, OrbitControls } from "@react-three/drei";
import { Suspense, useState, useCallback, useEffect } from "react";
import Vehicle from "./Vehicle";
import Ground from "./Ground";
import FallingShapes from "./FallingShapes";
import MenuScreen from "./MenuScreen";
import Link from "next/link";

export default function Game() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [orbitControlActive, setOrbitControlActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const saveScore = useCallback(async () => {
    try {
      const response = await fetch("/api/save-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save score");
      }

      const data = await response.json();
      console.log("Score saved:", data);
    } catch (error) {
      console.error("Error saving score:", error);
      setSaveError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  }, [score]);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setIsLocked(false);
  }, []);

  useEffect(() => {
    if (gameOver && gameStarted) {
      saveScore();
    }
  }, [gameOver, gameStarted, saveScore]);

  const restartGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setSaveError(null);
    setOrbitControlActive(false);
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setGameOver(false);
    setSaveError(null);
    setOrbitControlActive(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (gameStarted && !gameOver) {
          setOrbitControlActive((prev) => !prev);
          setIsLocked(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, gameOver]);

  // handle exiting pointer lock
  const exitPointerLock = useCallback(() => {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }, []);

  // Effect to handle pointer lock changes
  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsLocked(!!document.pointerLockElement);
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () =>
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
  }, []);

  return (
    <div
      className="w-full h-full relative"
      style={{
        cursor:
          !gameStarted || orbitControlActive || gameOver ? "auto" : "none",
      }}
    >
      {!gameStarted && <MenuScreen onStartGame={startGame} />}
      <div className="absolute top-0 left-0 p-4 text-white z-10">
        Score: {score.toFixed(2)}
      </div>
      <div className="absolute top-0 right-0 p-4 z-10">
        <Link href="/scores" className="text-white hover:text-blue-300">
          View High Scores
        </Link>
      </div>
      {!isLocked && gameStarted && !gameOver && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl text-center z-20">
          Click to control the vehicle
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-2xl text-gray-600 font-bold mb-4">Game Over</h2>
            <p className="mb-4 text-gray-600">Your score: {score.toFixed(2)}</p>
            {saveError && (
              <p className="text-red-500 mb-4">
                Error saving score: {saveError}
              </p>
            )}
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
              onClick={restartGame}
            >
              Restart Game
            </button>
            <Link href="/scores" className="text-blue-500 hover:text-blue-700">
              View High Scores
            </Link>
          </div>
        </div>
      )}
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "w", "W"] },
          { name: "backward", keys: ["ArrowDown", "s", "S"] },
        ]}
      >
        <Canvas shadows camera={{ position: [0, 8, 15], fov: 60 }}>
          <OrbitControls enabled={orbitControlActive} />
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.3} />
          <pointLight castShadow intensity={0.8} position={[100, 100, 100]} />
          <Physics gravity={[0, -9.81, 0]}>
            <Suspense fallback={null}>
              <Vehicle
                setScore={setScore}
                onGameOver={handleGameOver}
                gameOver={gameOver}
                orbitControlActive={orbitControlActive}
                setIsLocked={setIsLocked}
                isLocked={isLocked}
                exitPointerLock={exitPointerLock}
              />
              <Ground />
              <FallingShapes onCollision={handleGameOver} gameOver={gameOver} />
            </Suspense>
          </Physics>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
