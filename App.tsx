import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, LevelId, TestDuration, TestStats } from './types';
import { LEVELS } from './constants';
import WordDisplay from './components/WordDisplay';
import GameOverlay from './components/GameOverlay';
import GameUI from './components/GameUI';

// FIX: Converted from a const arrow function to a function declaration
// to avoid JSX parsing ambiguity with the generic type parameter <T>. This
// resolves the cascade of parsing errors throughout the component.
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  const newArray = [...array];
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Ready);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  
  const [currentLevelId, setCurrentLevelId] = useState<LevelId>('A1');
  const [testDuration, setTestDuration] = useState<TestDuration>(30);
  const [timeLeft, setTimeLeft] = useState(testDuration);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [stats, setStats] = useState<TestStats>({ wpm: 0, accuracy: 100, correctChars: 0, incorrectChars: 0 });
  const [finalStats, setFinalStats] = useState<TestStats | null>(null);

  const timerRef = useRef<number | null>(null);
  const isInfiniteMode = testDuration === 0;

  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setGameState(GameState.Playing);
    setUserInput('');
    
    const phrasesForLevel = LEVELS[currentLevelId].phrases;
    const baseWords = phrasesForLevel.flatMap(p => p.split(' ')).filter(Boolean);
    // Create a long list of words to ensure the test can run for any duration without running out.
    let wordPool: string[] = [];
    while (wordPool.length < 500) {
      wordPool.push(...shuffle(baseWords));
    }
    setWords(wordPool.slice(0, 500));
    
    setCurrentWordIndex(0);
    setTimeLeft(testDuration);
    setElapsedTime(0);
    setStats({ wpm: 0, accuracy: 100, correctChars: 0, incorrectChars: 0 });
    setFinalStats(null);
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => (isInfiniteMode ? prev : prev - 1));
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, [currentLevelId, testDuration, isInfiniteMode]);

  const restartGame = useCallback(() => {
     if (timerRef.current) clearInterval(timerRef.current);
     setGameState(GameState.Ready);
     setUserInput('');
     setTimeLeft(testDuration);
     setElapsedTime(0);
  }, [testDuration]);

  useEffect(() => {
    if (!isInfiniteMode && timeLeft <= 0 && gameState === GameState.Playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState(GameState.Finished);
      setFinalStats(stats);
    }
  }, [timeLeft, gameState, stats, isInfiniteMode]);
  
  useEffect(() => {
    if (gameState !== GameState.Playing) return;

    const totalChars = stats.correctChars + stats.incorrectChars;
    const accuracy = totalChars > 0 ? Math.round((stats.correctChars / totalChars) * 100) : 100;
    
    const wpm = elapsedTime > 0 ? Math.round((stats.correctChars / 5) / (elapsedTime / 60)) : 0;

    setStats(prev => ({ ...prev, accuracy, wpm }));

  }, [stats.correctChars, stats.incorrectChars, elapsedTime, gameState]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== GameState.Playing || words.length === 0) return;

    if (e.key === ' ' || e.key === 'Backspace') {
      e.preventDefault();
    }
    
    const currentWord = words[currentWordIndex];
    
    if (e.key === ' ') {
      if (!userInput) return;
      
      // Account for any characters the user missed by skipping the word early.
      const missedChars = Math.max(0, currentWord.length - userInput.length);
      if (missedChars > 0) {
        setStats(prev => ({...prev, incorrectChars: prev.incorrectChars + missedChars }));
      }
      
      // The space is only counted as a correct character if the word was typed perfectly.
      if (userInput === currentWord) {
        setStats(prev => ({...prev, correctChars: prev.correctChars + 1}));
      }
      
      setCurrentWordIndex(prev => prev + 1);
      setUserInput('');
      return;
    }

    if (e.key === 'Backspace') {
      if (userInput.length > 0) {
        const lastCharIndex = userInput.length - 1;
        const wasExtra = lastCharIndex >= currentWord.length;

        if (wasExtra) {
          setStats(prev => ({ ...prev, incorrectChars: prev.incorrectChars - 1 }));
        } else {
          const wasCorrect = userInput[lastCharIndex] === currentWord[lastCharIndex];
          if (wasCorrect) {
            setStats(prev => ({ ...prev, correctChars: prev.correctChars - 1 }));
          } else {
            setStats(prev => ({ ...prev, incorrectChars: prev.incorrectChars - 1 }));
          }
        }
      }
      setUserInput(prev => prev.slice(0, -1));
    } else if (e.key.length === 1 && e.key.match(/^[a-zA-ZäöüÄÖÜß.,!?"' ]$/)) {
        const newUserInput = userInput + e.key;
        setUserInput(newUserInput);
        
        const isCorrect = currentWord[newUserInput.length - 1] === e.key;
        if (isCorrect) {
            setStats(prev => ({...prev, correctChars: prev.correctChars + 1}));
        } else {
            setStats(prev => ({...prev, incorrectChars: prev.incorrectChars + 1}));
        }
    }
  }, [gameState, userInput, words, currentWordIndex, stats.correctChars, stats.incorrectChars]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const timeForUI = isInfiniteMode ? elapsedTime : timeLeft;

  return (
    <main className="bg-slate-900 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 selection:bg-yellow-500/50">
      <div className="relative w-full max-w-4xl flex flex-col items-center justify-center">
        <header className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-orbitron text-yellow-300 tracking-wider">
            Typ-Affe
          </h1>
        </header>

        {gameState === GameState.Playing && (
            <GameUI time={timeForUI} isInfiniteMode={isInfiniteMode} wpm={stats.wpm} accuracy={stats.accuracy} onRestart={restartGame} />
        )}
        
        <div className="w-full max-w-3xl min-h-[10rem] flex flex-col items-center justify-center">
          {gameState === GameState.Playing ? (
            <WordDisplay words={words} currentWordIndex={currentWordIndex} userInput={userInput} />
          ) : (
             <div className="text-slate-500 text-2xl h-36 flex items-center">Konfiguriere deinen Test, um zu beginnen</div>
          )}
        </div>
        
        {(gameState === GameState.Ready || gameState === GameState.Finished) && (
          <GameOverlay 
            gameState={gameState}
            onStart={startGame}
            levels={LEVELS}
            selectedLevel={currentLevelId}
            onLevelSelect={setCurrentLevelId}
            selectedDuration={testDuration}
            onDurationSelect={setTestDuration}
            stats={finalStats}
          />
        )}
      </div>
    </main>
  );
};

export default App;
