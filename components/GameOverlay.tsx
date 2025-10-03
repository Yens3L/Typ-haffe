import React from 'react';
import { Level, LevelId } from '../types';

interface GameOverlayProps {
  onStart: () => void;
  levels: Record<LevelId, Level>;
  selectedLevel: LevelId;
  onLevelSelect: (levelId: LevelId) => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ onStart, levels, selectedLevel, onLevelSelect }) => {
  const levelKeys = Object.keys(levels) as LevelId[];

  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
      <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-bold font-orbitron mb-4 text-yellow-300">
          Willkommen!
        </h2>
        
        <p className="text-slate-300 mb-6 max-w-md mx-auto text-lg">
          Wähle ein Level und tippe die Sätze, um deine Deutschkenntnisse zu üben.
        </p>
        <div className="flex justify-center flex-wrap gap-3 sm:gap-4 mb-8">
          {levelKeys.map((levelId) => {
            const isSelected = levelId === selectedLevel;
            return (
              <button
                key={levelId}
                onClick={() => onLevelSelect(levelId)}
                className={`font-bold py-2 px-4 rounded-lg text-base transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 ${
                  isSelected
                    ? 'bg-cyan-400 text-slate-900 ring-cyan-300 scale-105'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 ring-slate-500'
                }`}
              >
                {levels[levelId].name}
              </button>
            );
          })}
        </div>

        <button
          onClick={onStart}
          className="bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-lg text-xl hover:bg-yellow-300 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
        >
          Spiel starten
        </button>
      </div>
    </div>
  );
};

export default GameOverlay;
