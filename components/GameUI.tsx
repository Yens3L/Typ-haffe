import React from 'react';

interface GameUIProps {
  time: number;
  isInfiniteMode: boolean;
  wpm: number;
  accuracy: number;
  onTTS: () => void;
  onSkipSentence: () => void;
  correctChars: number;
  incorrectChars: number;
}

const GameUI: React.FC<GameUIProps> = ({
  time,
  isInfiniteMode,
  wpm,
  accuracy,
  onTTS,
  onSkipSentence,
  correctChars,
  incorrectChars,
}) => {
  const showRealStats = correctChars > 0 || incorrectChars > 0;
  
  return (
    <div className="flex flex-col items-center justify-center w-full text-2xl font-orbitron mb-8">
      <div className="flex items-center justify-center flex-wrap w-full max-w-3xl gap-x-8 gap-y-4 text-cyan-300">
        <div className="flex items-baseline w-28">
          {isInfiniteMode ? (
              <span className="text-4xl text-yellow-300">∞</span>
          ) : (
            <span className="text-4xl text-yellow-300">{time}</span>
          )}
          <span className="text-lg ml-1 text-slate-400">s</span>
        </div>
        <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <div className="flex items-baseline">
                <span className="text-4xl">{wpm}</span>
                <span className="text-lg ml-2 text-slate-400">WPM</span>
            </div>
        </div>
        <div className="flex items-baseline">
          <span className="text-4xl">{showRealStats ? accuracy : '--'}</span>
          {showRealStats && <span className="text-lg ml-1 text-slate-400">%</span>}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <button
            onClick={onTTS}
            aria-label="Satz vorlesen"
            className="text-slate-500 hover:text-cyan-300 transition-colors duration-200"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M11.25 8.25l-4.72 4.72a.75.75 0 000 1.06l4.72 4.72M11.25 8.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25H11.25l4.72 4.72a.75.75 0 001.28-.53V4.03a.75.75 0 00-1.28-.53l-4.72 4.72z" />
            </svg>
        </button>
        <button
            onClick={onSkipSentence}
            aria-label="Satz überspringen"
            className="text-slate-500 hover:text-cyan-300 transition-colors duration-200"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default GameUI;