import React from 'react';

interface GameUIProps {
  time: number;
  isInfiniteMode: boolean;
  wpm: number;
  accuracy: number;
  onRestart: () => void;
  onTTS: () => void;
  onTranslate: () => void;
  isTranslationAvailable: boolean;
}

const GameUI: React.FC<GameUIProps> = ({ time, isInfiniteMode, wpm, accuracy, onRestart, onTTS, onTranslate, isTranslationAvailable }) => {
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
      <div className="flex items-center gap-4">
        {isTranslationAvailable && (
            <button
                onClick={onTranslate}
                aria-label="Satz übersetzen"
                className="text-slate-500 hover:text-cyan-300 transition-colors duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5h12M9 3v2m4 13-4-4-4 4M19 17v-2a4 4 0 00-4-4H9" />
                </svg>
            </button>
        )}
        <button
            onClick={onTTS}
            aria-label="Satz vorlesen"
            className="text-slate-500 hover:text-cyan-300 transition-colors duration-200"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
        </button>
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
    </div>
  );
};

export default GameUI;
