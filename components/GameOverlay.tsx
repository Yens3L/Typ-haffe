import React from 'react';
import { GameState, Level, LevelId, TestDuration, TestStats, WPMDataPoint, AccuracyDataPoint } from '../types';
import { TEST_DURATIONS } from '../constants';
import WPMChart from './WPMChart';
import AccuracyChart from './AccuracyChart';

interface GameOverlayProps {
  gameState: GameState;
  onStart: () => void;
  onRestart: () => void;
  levels: Record<LevelId, Level>;
  selectedLevel: LevelId;
  onLevelSelect: (levelId: LevelId) => void;
  selectedDuration: TestDuration;
  onDurationSelect: (duration: TestDuration) => void;
  stats: TestStats | null;
  isGenerating: boolean;
  wpmHistory: WPMDataPoint[];
  accuracyHistory: AccuracyDataPoint[];
  difficultWords: string[];
  loadingProgress: number;
  appMode: 'typing' | 'conversation';
  onModeChange: (mode: 'typing' | 'conversation') => void;
}

const StartScreen: React.FC<Omit<GameOverlayProps, 'gameState' | 'stats' | 'wpmHistory' | 'accuracyHistory' | 'difficultWords' | 'onRestart'>> = ({
  onStart,
  levels,
  selectedLevel,
  onLevelSelect,
  selectedDuration,
  onDurationSelect,
  isGenerating,
  loadingProgress,
  appMode,
  onModeChange,
}) => {
  const levelKeys = Object.keys(levels) as LevelId[];

  return (
    <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl">
      <h2 className="text-4xl md:text-5xl font-bold font-orbitron mb-4 text-yellow-300">
        Typ-Affe
      </h2>
      
      <div className="flex justify-center mb-8 border-b border-slate-700">
        <button
          onClick={() => onModeChange('typing')}
          disabled={isGenerating}
          className={`px-6 py-3 text-lg font-bold transition-colors disabled:opacity-50 ${
            appMode === 'typing' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Tipptest
        </button>
        <button
          onClick={() => onModeChange('conversation')}
          disabled={isGenerating}
          className={`px-6 py-3 text-lg font-bold transition-colors disabled:opacity-50 ${
            appMode === 'conversation' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Gespräch
        </button>
      </div>

      {appMode === 'typing' ? (
        <>
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
        </>
      ) : (
         <p className="text-slate-300 mb-8 max-w-md mx-auto text-lg min-h-[174px] flex items-center">
            Führe ein Gespräch mit der KI, um dein gesprochenes Deutsch zu üben.
          </p>
      )}
      
      <div className="flex items-center justify-center gap-4 min-h-[68px]">
        {isGenerating && appMode === 'typing' ? (
          <div className="text-center w-full">
            <p className="text-slate-300 mb-2 text-lg">Sätze werden geladen...</p>
            <div className="loading-bar">
              <div className="loading-bar-inner" style={{ width: `${loadingProgress}%` }}></div>
            </div>
          </div>
        ) : (
          <button
            onClick={onStart}
            disabled={isGenerating}
            className="bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-lg text-xl hover:bg-yellow-300 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {appMode === 'typing' ? 'Start' : 'Gespräch beginnen'}
          </button>
        )}
      </div>
    </div>
  );
};

const FinishedScreen: React.FC<{
  stats: TestStats;
  onRestart: () => void;
  wpmHistory: WPMDataPoint[];
  accuracyHistory: AccuracyDataPoint[];
  difficultWords: string[];
}> = ({ stats, onRestart, wpmHistory, accuracyHistory, difficultWords }) => (
  <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-4xl text-center">
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
    <div className="text-slate-400 mb-6">
      Zeichen: <span className="text-emerald-300">{stats.correctChars}</span> | <span className="text-red-500">{stats.incorrectChars}</span>
    </div>

    {wpmHistory.length > 1 && accuracyHistory.length > 1 && (
      <div className="w-full mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="h-64">
          <h3 className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-2">WPM über Zeit</h3>
          <WPMChart data={wpmHistory} />
        </div>
        <div className="h-64">
          <h3 className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-2">Genauigkeit über Zeit</h3>
          <AccuracyChart data={accuracyHistory} />
        </div>
      </div>
    )}
    
    {difficultWords.length > 0 && (
      <div className="mb-8">
        <h3 className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-4">Wörter zum Üben</h3>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-lg mx-auto">
          {difficultWords.map((word, index) => (
            <span key={index} className="bg-slate-700 text-slate-300 py-1 px-3 rounded-md text-lg font-mono">
              {word}
            </span>
          ))}
        </div>
      </div>
    )}

    <button
        onClick={onRestart}
        className="bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-lg text-xl hover:bg-yellow-300 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 mt-4"
      >
        Erneut versuchen
      </button>
  </div>
);

const GameOverlay: React.FC<GameOverlayProps> = (props) => {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      {props.gameState === GameState.Finished && props.stats ? (
        <FinishedScreen 
            stats={props.stats} 
            onRestart={props.onRestart}
            wpmHistory={props.wpmHistory}
            accuracyHistory={props.accuracyHistory}
            difficultWords={props.difficultWords}
        />
      ) : (
        <StartScreen {...props} />
      )}
    </div>
  );
};

export default GameOverlay;