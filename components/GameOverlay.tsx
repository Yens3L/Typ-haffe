import React from 'react';
import { GameState, Level, LevelId, TestDuration, TestStats } from '../types';
import { TEST_DURATIONS } from '../constants';

interface GameOverlayProps {
  gameState: GameState;
  onStart: () => void;
  levels: Record<LevelId, Level>;
  selectedLevel: LevelId;
  onLevelSelect: (levelId: LevelId) => void;
  selectedDuration: TestDuration;
  onDurationSelect: (duration: TestDuration) => void;
  stats: TestStats | null;
  isGenerating: boolean;
}

const StartScreen: React.FC<Omit<GameOverlayProps, 'gameState' | 'stats'>> = ({
  onStart,
  levels,
  selectedLevel,
  onLevelSelect,
  selectedDuration,
  onDurationSelect,
  isGenerating,
}) => {
  const levelKeys = Object.keys(levels) as LevelId[];

  return (
    <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl">
      <h2 className="text-4xl md:text-5xl font-bold font-orbitron mb-4 text-yellow-300">
        Typ-Affe
      </h2>
      <p className="text-slate-300 mb-8 max-w-md mx-auto text-lg">
        Wähle ein Level und eine Dauer, um deinen Tipptest zu starten.
      </p>

      <div className="mb-6">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Dauer</h3>
        <div className="flex justify-center flex-wrap gap-3 sm:gap-4">
          {TEST_DURATIONS.map((duration) => (
            <button
              key={duration}
              onClick={() => onDurationSelect(duration)}
              disabled={isGenerating}
              className={`font-bold py-2 px-6 rounded-lg text-lg transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                duration === selectedDuration
                  ? 'bg-cyan-400 text-slate-900 ring-cyan-300 scale-105'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 ring-slate-500'
              }`}
            >
              {duration === 0 ? 'Übung' : `${duration}s`}
            </button>
          ))}
        </div>
      </div>

       <div className="mb-8">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Level</h3>
        <div className="flex justify-center flex-wrap gap-3 sm:gap-4">
          {levelKeys.map((levelId) => (
            <button
              key={levelId}
              onClick={() => onLevelSelect(levelId)}
              disabled={isGenerating}
              className={`font-bold py-2 px-4 rounded-lg text-base transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                levelId === selectedLevel
                  ? 'bg-cyan-400 text-slate-900 ring-cyan-300 scale-105'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 ring-slate-500'
              }`}
            >
              {levels[levelId].name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onStart}
          disabled={isGenerating}
          className="bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-lg text-xl hover:bg-yellow-300 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-wait"
        >
          {isGenerating ? 'Sätze werden geladen...' : 'Start'}
        </button>
      </div>
    </div>
  );
};

const FinishedScreen: React.FC<{ stats: TestStats; onRestart: () => void }> = ({ stats, onRestart }) => (
  <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl text-center">
    <h2 className="text-4xl font-bold font-orbitron mb-2 text-yellow-300">Ergebnis</h2>
    <div className="flex justify-center gap-8 md:gap-12 my-8">
      <div>
        <div className="text-5xl md:text-6xl font-orbitron text-cyan-300">{stats.wpm}</div>
        <div className="text-slate-400 uppercase tracking-widest">WPM</div>
      </div>
      <div>
        <div className="text-5xl md:text-6xl font-orbitron text-cyan-300">{stats.accuracy}%</div>
        <div className="text-slate-400 uppercase tracking-widest">Genauigkeit</div>
      </div>
    </div>
    <div className="text-slate-400 mb-8">
      Zeichen: <span className="text-emerald-300">{stats.correctChars}</span> | <span className="text-red-500">{stats.incorrectChars}</span>
    </div>
    <button
        onClick={onRestart}
        className="bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-lg text-xl hover:bg-yellow-300 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
      >
        Erneut versuchen
      </button>
  </div>
);

const GameOverlay: React.FC<GameOverlayProps> = (props) => {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      {props.gameState === GameState.Finished && props.stats ? (
        <FinishedScreen stats={props.stats} onRestart={props.onStart} />
      ) : (
        <StartScreen {...props} />
      )}
    </div>
  );
};

export default GameOverlay;
