import React from 'react';

interface GameUIProps {
  time: number;
  isInfiniteMode: boolean;
  wpm: number;
  accuracy: number;
  onRestart: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ time, isInfiniteMode, wpm, accuracy, onRestart }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl text-2xl text-cyan-300 font-orbitron mb-8">
      <div className="flex gap-8">
        <div className="flex items-baseline w-28">
          {isInfiniteMode ? (
             <span className="text-4xl text-yellow-300">∞</span>
          ) : (
            <span className="text-4xl text-yellow-300">{time}</span>
          )}
          <span className="text-lg ml-1 text-slate-400">s</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-4xl">{wpm}</span>
          <span className="text-lg ml-1 text-slate-400">WPM</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-4xl">{accuracy}</span>
          <span className="text-lg ml-1 text-slate-400">%</span>
        </div>
      </div>
      <button
        onClick={onRestart}
        aria-label="Test neustarten"
        className="text-slate-500 hover:text-cyan-300 transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 003.5 13.5"/>
        </svg>
      </button>
    </div>
  );
};

export default GameUI;
