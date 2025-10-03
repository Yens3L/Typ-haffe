import React, { useState, useEffect, useCallback } from 'react';
import { GameState, LevelId } from './types';
import { LEVELS } from './constants';
import WordDisplay from './components/WordDisplay';
import GameOverlay from './components/GameOverlay';

// Fisher-Yates shuffle algorithm
const shuffle = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Ready);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [currentLevelId, setCurrentLevelId] = useState<LevelId>('A1');

  const currentWord = words[currentWordIndex] || '';

  const startGame = useCallback(() => {
    setGameState(GameState.Playing);
    setUserInput('');
    const phrasesForLevel = LEVELS[currentLevelId].phrases;
    const shuffledPhrases = shuffle(phrasesForLevel);
    setWords(shuffledPhrases);
    setCurrentWordIndex(0);
  }, [currentLevelId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.Playing) return;

      if (e.key === ' ' || e.key === 'Backspace') {
        e.preventDefault();
      }
      
      if (e.key === 'Backspace') {
        setUserInput(prev => prev.slice(0, -1));
      } else if (e.key.length === 1 && e.key.match(/^[a-zA-ZäöüÄÖÜß ]$/)) {
        setUserInput(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);
  
  useEffect(() => {
    if (gameState !== GameState.Playing) return;

    if (currentWord && userInput === currentWord) {
      // If it's the last word, reshuffle the list for endless practice
      if (currentWordIndex === words.length - 1) {
        const newShuffled = shuffle(LEVELS[currentLevelId].phrases);
        setWords(newShuffled);
        setCurrentWordIndex(0);
      } else {
        setCurrentWordIndex(prev => prev + 1);
      }
      setUserInput('');
    }
  }, [userInput, currentWord, gameState, currentWordIndex, words.length, currentLevelId]);

  const handleSpeak = useCallback(() => {
    if (!currentWord || window.speechSynthesis.speaking) return;
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.lang = 'de-DE';
    window.speechSynthesis.speak(utterance);
  }, [currentWord]);

  return (
    <main className="bg-slate-900 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 selection:bg-yellow-500/50">
      <div className="relative w-full max-w-4xl flex flex-col items-center justify-center">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-orbitron text-yellow-300 tracking-wider">
            Typ-Affe
          </h1>
          <p className="text-cyan-300/80 mt-2 text-lg">German Vocabulary Typing Practice</p>
        </header>

        <div className="w-full max-w-3xl min-h-[12rem] flex flex-col items-center justify-center">
          {gameState === GameState.Playing ? (
            <div className="w-full flex items-center justify-center px-2 relative group">
              <WordDisplay word={currentWord} userInput={userInput} />
              <button 
                onClick={handleSpeak}
                aria-label="Wort vorlesen"
                className="absolute right-0 -top-10 text-slate-500 hover:text-cyan-300 transition-colors duration-200 opacity-20 group-hover:opacity-100 focus:opacity-100"
                disabled={!currentWord}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
          ) : (
             <div className="text-slate-500 text-2xl">Wähle ein Level um zu beginnen</div>
          )}
        </div>
        
        {gameState === GameState.Ready && (
          <GameOverlay 
            onStart={startGame}
            levels={LEVELS}
            selectedLevel={currentLevelId}
            onLevelSelect={setCurrentLevelId}
          />
        )}
      </div>
    </main>
  );
};

export default App;
