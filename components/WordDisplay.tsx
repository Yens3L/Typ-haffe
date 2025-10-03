import React from 'react';

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  userInput: string;
}

const Word: React.FC<{
  text: string;
  isCurrent: boolean;
  userInput: string;
}> = ({ text, isCurrent, userInput }) => {
  // This class prevents the word from splitting across lines.
  const wordWrapperClasses = "mr-4 whitespace-nowrap";

  if (!isCurrent) {
    const isCompleted = userInput.trim() === text && userInput.endsWith(' ');
    const color = isCompleted ? 'text-slate-500' : 'text-slate-400';
    return <span className={`${wordWrapperClasses} ${color}`}>{text}</span>;
  }

  const typedChars = userInput.split('');
  const wordChars = text.split('');

  return (
    <span className={`${wordWrapperClasses} text-slate-300 relative`}>
      {wordChars.map((char, index) => {
        const isTyped = index < typedChars.length;
        const isCorrect = isTyped && typedChars[index] === char;
        const isCursor = index === typedChars.length;

        let colorClass = 'text-slate-400'; // untyped
        if (isTyped) {
          colorClass = isCorrect ? 'text-emerald-300' : 'text-red-500 underline decoration-2';
        }

        const cursorClass = isCursor ? 'border-l-2 border-yellow-400 animate-blink -ml-0.5' : '';

        return (
          <span key={index} className={`${colorClass} ${cursorClass}`}>
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
    </span>
  );
};

const WordDisplay: React.FC<WordDisplayProps> = ({ words, currentWordIndex, userInput }) => {
  const wordsToShow = words.slice(
    Math.max(0, currentWordIndex - 5),
    currentWordIndex + 20
  );

  return (
    <div className="font-mono text-3xl md:text-4xl tracking-wider select-none p-4 w-full text-left overflow-hidden h-36">
      <div className="flex flex-wrap leading-relaxed">
        {wordsToShow.map((word, index) => {
           const absoluteIndex = index + Math.max(0, currentWordIndex - 5);
           return (
             <Word
               key={absoluteIndex}
               text={word}
               isCurrent={absoluteIndex === currentWordIndex}
               userInput={absoluteIndex < currentWordIndex ? `${word} ` : (absoluteIndex === currentWordIndex ? userInput : '')}
             />
           );
        })}
      </div>
    </div>
  );
};

export default WordDisplay;
