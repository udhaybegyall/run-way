"use client";

import dynamic from "next/dynamic";

const Game = dynamic(() => import("@/components/Game"), { ssr: false });

export default function Home() {
  return (
    <div className="w-full h-screen">
      <div className="w-full h-full mx-auto rounded-lg overflow-hidden shadow-lg">
        <Game />
      </div>
    </div>
  );
}
