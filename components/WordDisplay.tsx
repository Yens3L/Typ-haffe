import React from 'react';

interface WordDisplayProps {
  word: string;
  userInput: string;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ word, userInput }) => {
  const typedChars = userInput.split('');

  return (
    <div className="relative font-mono text-3xl md:text-4xl tracking-widest select-none p-2 w-full text-center">
      {/* Invisible element to set the width/height and prevent layout shift */}
      <span className="invisible whitespace-pre-wrap">{word || ' '}</span>
      
      {/* Absolutely positioned overlay with styled characters */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-wrap">
        {!word && <span className="text-slate-500">Laden...</span>}
        {word && word.split('').map((char, index) => {
          let charState: 'untyped' | 'correct' | 'incorrect' = 'untyped';
          if (index < typedChars.length) {
            charState = typedChars[index] === char ? 'correct' : 'incorrect';
          }

          const isCursor = index === typedChars.length;
          
          // Render space as a visible character
          const displayChar = char === ' ' ? '·' : char;

          const colorClass = {
            untyped: 'text-slate-400',
            correct: 'text-emerald-300',
            incorrect: 'text-red-500 underline decoration-2',
          }[charState];
          
          // Make the space character's color different when untyped
          const spaceColorClass = (char === ' ' && charState === 'untyped') ? 'text-slate-600' : colorClass;

          const cursorClass = isCursor ? 'border-l-2 border-yellow-400 animate-blink' : '';

          return (
            <span key={index} className={`${spaceColorClass} ${cursorClass}`}>
              {displayChar}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default WordDisplay;
