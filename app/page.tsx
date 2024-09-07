"use client";

import dynamic from "next/dynamic";

const Game = dynamic(() => import("@/components/Game"), { ssr: false });

export default function Home() {
  return (
    <div className="w-full h-screen p-4 md:p-8 lg:p-12">
      <div className="w-full h-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg">
        <Game />
      </div>
    </div>
  );
}
