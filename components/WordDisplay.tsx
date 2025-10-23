import React from 'react';

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  userInput: string;
  isSentenceTransitioning: boolean;
  wordSentenceMap: number[];
  sentenceColors: string[];
}

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
      className="absolute -right-5 top-1/2 -translate-y-1/2 text-current hover:text-cyan-300 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M11.25 8.25l-4.72 4.72a.75.75 0 000 1.06l4.72 4.72M11.25 8.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25H11.25l4.72 4.72a.75.75 0 001.28-.53V4.03a.75.75 0 00-1.28-.53l-4.72 4.72z" />
      </svg>
    </button>
  );

  const baseWrapperClasses = "mr-4 whitespace-nowrap";

  if (!isCurrent) {
    return (
        <span className={`${baseWrapperClasses} relative group ${colorClass}`}>
            {text}
            <SpeakerIcon />
        </span>
    );
  }

  const typedChars = userInput.split('');
  const wordChars = text.split('');

  return (
    <span className={`${baseWrapperClasses} relative group ${colorClass}`}>
      {wordChars.map((char, index) => {
        const isTyped = index < typedChars.length;
        const isCorrect = isTyped && typedChars[index] === char;
        const isCursor = index === typedChars.length;

        let charColorClass = ''; // Inherit color from parent by default
        if (isTyped) {
          charColorClass = isCorrect ? 'text-cyan-300' : 'bg-red-500/40 text-red-300';
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
          <span className="bg-red-500/40 text-red-300 rounded-sm">
              {typedChars.slice(wordChars.length).join('')}
          </span>
      )}
      <SpeakerIcon />
    </span>
  );
};

const WordDisplay: React.FC<WordDisplayProps> = ({ words, currentWordIndex, userInput, isSentenceTransitioning, wordSentenceMap, sentenceColors }) => {
  const currentSentenceIndex = wordSentenceMap[currentWordIndex];

  // When the test ends or data is not yet loaded, currentSentenceIndex can be undefined.
  if (currentSentenceIndex === undefined) {
    return (
      <div className={`font-mono text-3xl md:text-4xl tracking-wider select-none p-4 w-full text-left overflow-hidden min-h-36 ${isSentenceTransitioning ? 'animate-sentence-change' : ''}`} />
    );
  }
  
  const sentenceStartIndex = wordSentenceMap.indexOf(currentSentenceIndex);
  const sentenceEndIndex = wordSentenceMap.lastIndexOf(currentSentenceIndex);

  const wordsToShow = words.slice(sentenceStartIndex, sentenceEndIndex + 1);

  return (
    <div className={`font-mono text-3xl md:text-4xl tracking-wider select-none p-4 w-full text-left overflow-hidden min-h-36 ${isSentenceTransitioning ? 'animate-sentence-change' : ''}`}>
      <div className="flex flex-wrap items-center leading-relaxed">
        {wordsToShow.map((word, index) => {
           const absoluteIndex = sentenceStartIndex + index;
           const sentenceIndex = wordSentenceMap[absoluteIndex];
           const colorClass = sentenceIndex !== undefined ? sentenceColors[sentenceIndex % sentenceColors.length] : 'text-slate-500';
           
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