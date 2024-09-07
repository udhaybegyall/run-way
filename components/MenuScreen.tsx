import Link from "next/link";

interface MenuScreenProps {
  onStartGame: () => void;
}

export default function MenuScreen({ onStartGame }: MenuScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-30">
      <h1 className="text-6xl font-bold mb-8">Run-Way</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300"
        onClick={onStartGame}
      >
        Start Game
      </button>
      <Link href="/scores" className="text-blue-500 hover:text-blue-700">
        View High Scores
      </Link>
    </div>
  );
}
