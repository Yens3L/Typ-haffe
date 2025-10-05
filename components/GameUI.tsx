import React from 'react';

interface GameUIProps {
  time: number;
  isInfiniteMode: boolean;
  wpm: number;
  accuracy: number;
  onTTS: () => void;
  onTranslate: () => void;
  isTranslationAvailable: boolean;
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
  onTranslate,
  isTranslationAvailable,
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 w-7 fill-current">
                <path d="M12 2L2 12l2.828 2.828L12 7.657l7.172 7.171L22 12 12 2z" />
                <path d="M14.828 14.828L12 17.657l-7.172-7.171L2 12l10 10 10-10-2.828-2.828z" />
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
        </button>
        {isTranslationAvailable && (
            <button
                onClick={onTranslate}
                aria-label="Satz übersetzen"
                className="text-slate-500 hover:text-cyan-300 transition-colors duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            </button>
        )}
        <button
            onClick={onSkipSentence}
            aria-label="Satz überspringen"
            className="text-slate-500 hover:text-cyan-300 transition-colors duration-200"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default GameUI;