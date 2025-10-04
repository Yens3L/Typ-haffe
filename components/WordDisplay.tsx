import React from 'react';

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  userInput: string;
  wordSentenceMap: number[];
  isSentenceTransitioning: boolean;
}

const SENTENCE_COLORS = [
  'text-slate-300',
  'text-sky-300',
  'text-teal-300',
  'text-fuchsia-300',
  'text-orange-300',
];

const Word: React.FC<{
  text: string;
  isCurrent: boolean;
  userInput: string;
  colorClass: string;
}> = ({ text, isCurrent, userInput, colorClass }) => {
  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const SpeakerIcon = () => (
    <button
      onClick={handlePronounce}
      aria-label={`Aussprache für ${text}`}
      className="absolute -right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-300 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    </button>
  );

  // This class prevents the word from splitting across lines.
  const baseWrapperClasses = "mr-4 whitespace-nowrap";

  if (!isCurrent) {
    const isCompleted = userInput.trim() === text && userInput.endsWith(' ');
    const finalColorClass = isCompleted ? `${colorClass} opacity-40` : colorClass;
    return (
        <span className={`${baseWrapperClasses} relative group ${finalColorClass}`}>
            {text}
            <SpeakerIcon />
        </span>
    );
  }

  const typedChars = userInput.split('');
  const wordChars = text.split('');

  return (
    <span className={`${baseWrapperClasses} relative group`}>
      {wordChars.map((char, index) => {
        const isTyped = index < typedChars.length;
        const isCorrect = isTyped && typedChars[index] === char;
        const isCursor = index === typedChars.length;

        let charColorClass = colorClass; // untyped characters get the sentence color
        if (isTyped) {
          charColorClass = isCorrect ? 'text-emerald-300' : 'text-red-500 underline decoration-2';
        }

        const cursorClass = isCursor ? 'border-l-2 border-yellow-400 animate-blink -ml-0.5' : '';

        return (
          <span key={index} className={`${charColorClass} ${cursorClass}`}>
            {char}
          </span>
        );
      })}

      {/* Show cursor at the end of the word if typed length is equal or greater */}
      {typedChars.length >= wordChars.length && (
         <span className="border-l-2 border-yellow-400 animate-blink -ml-0.5">&#8203;</span>
      )}

      {/* Extra characters typed by the user, shown after the word and cursor */}
      {typedChars.length > wordChars.length && (
          <span className="text-red-500 underline decoration-2 bg-red-500/10">
              {typedChars.slice(wordChars.length).join('')}
          </span>
      )}
      <SpeakerIcon />
    </span>
  );
};

const WordDisplay: React.FC<WordDisplayProps> = ({ words, currentWordIndex, userInput, wordSentenceMap, isSentenceTransitioning }) => {
  const wordsToShow = words.slice(
    Math.max(0, currentWordIndex - 5),
    currentWordIndex + 20
  );

  return (
    <div className={`font-mono text-3xl md:text-4xl tracking-wider select-none p-4 w-full text-left overflow-hidden h-36 ${isSentenceTransitioning ? 'animate-sentence-change' : ''}`}>
      <div className="flex flex-wrap items-center leading-relaxed">
        {wordsToShow.map((word, index) => {
           const absoluteIndex = index + Math.max(0, currentWordIndex - 5);
           const sentenceIndex = wordSentenceMap[absoluteIndex] ?? 0;
           const colorClass = SENTENCE_COLORS[sentenceIndex % SENTENCE_COLORS.length];

           return (
             <Word
               key={absoluteIndex}
               text={word}
               isCurrent={absoluteIndex === currentWordIndex}
               userInput={absoluteIndex < currentWordIndex ? `${word} ` : (absoluteIndex === currentWordIndex ? userInput : '')}
               colorClass={colorClass}
             />
           );
        })}
      </div>
    </div>
  );
};

export default WordDisplay;