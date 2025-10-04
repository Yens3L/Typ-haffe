import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, LevelId, TestDuration, TestStats, GeneratedPhrase, WPMDataPoint, WordHistoryEntry, AccuracyDataPoint } from './types';
import { LEVELS, TEST_DURATIONS } from './constants';
import WordDisplay from './components/WordDisplay';
import GameOverlay from './components/GameOverlay';
import GameUI from './components/GameUI';
import { GoogleGenAI, Type } from "@google/genai";

const PHRASE_COUNT = 25;

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
  
  const [currentLevelId, setCurrentLevelId] = useState<LevelId>(() => {
    try {
      const savedLevel = localStorage.getItem('typAffe-level') as LevelId;
      return savedLevel && LEVELS[savedLevel] ? savedLevel : 'A1';
    } catch (error) {
      console.error("Could not read level from localStorage", error);
      return 'A1';
    }
  });
  
  const [testDuration, setTestDuration] = useState<TestDuration>(() => {
    try {
      const savedDuration = localStorage.getItem('typAffe-duration');
      const duration = savedDuration ? parseInt(savedDuration, 10) : 30;
      return TEST_DURATIONS.includes(duration as TestDuration) ? (duration as TestDuration) : 30;
    } catch (error) {
      console.error("Could not read duration from localStorage", error);
      return 30;
    }
  });

  const [timeLeft, setTimeLeft] = useState<number>(testDuration);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [stats, setStats] = useState<TestStats>({ wpm: 0, accuracy: 100, correctChars: 0, incorrectChars: 0 });
  const [finalStats, setFinalStats] = useState<TestStats | null>(null);
  const [wpmHistory, setWpmHistory] = useState<WPMDataPoint[]>([]);
  const [accuracyHistory, setAccuracyHistory] = useState<AccuracyDataPoint[]>([]);
  const [wordHistory, setWordHistory] = useState<WordHistoryEntry[]>([]);
  const [difficultWords, setDifficultWords] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [levelPhrases, setLevelPhrases] = useState<GeneratedPhrase[]>([]);
  const [activePhrases, setActivePhrases] = useState<GeneratedPhrase[]>([]);
  const [wordSentenceMap, setWordSentenceMap] = useState<number[]>([]);
  const [currentTranslation, setCurrentTranslation] = useState<string | null>(null);
  const [isSentenceTransitioning, setIsSentenceTransitioning] = useState(false);

  const timerRef = useRef<number | null>(null);
  const isInfiniteMode = testDuration === 0;

  useEffect(() => {
    try {
      localStorage.setItem('typAffe-level', currentLevelId);
    } catch (error) {
      console.error("Could not save level to localStorage", error);
    }
  }, [currentLevelId]);

  useEffect(() => {
    try {
      localStorage.setItem('typAffe-duration', testDuration.toString());
    } catch (error) {
      console.error("Could not save duration to localStorage", error);
    }
  }, [testDuration]);


  useEffect(() => {
    const generateAndSetPhrases = async () => {
        setIsGenerating(true);
        setApiError(null);
        setCurrentTranslation(null);

        const MAX_RETRIES = 2; // Total of 3 attempts
        let success = false;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `Erstelle ${PHRASE_COUNT} einzigartige deutsche Sätze für einen Tipptest auf dem GER-Niveau "${LEVELS[currentLevelId].name}". Gib auch eine professionelle spanische Übersetzung für jeden Satz an. Sorge dafür, dass die Sätze grammatisch korrekt sind und eine abwechslungsreiche Struktur haben.`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                phrases: {
                                    type: Type.ARRAY,
                                    description: 'Eine Liste von Sätzen und deren Übersetzungen.',
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            german: { type: Type.STRING, description: 'Der deutsche Satz.' },
                                            spanish: { type: Type.STRING, description: 'Die spanische Übersetzung.' }
                                        },
                                        required: ['german', 'spanish']
                                    }
                                }
                            }
                        }
                    },
                });
                
                const data = JSON.parse(response.text) as { phrases: GeneratedPhrase[] };
                if (data.phrases && data.phrases.length > 0) {
                  setLevelPhrases(data.phrases);
                  success = true;
                  break; // Success, exit the loop
                }
                throw new Error("API returned no phrases or malformed data");

            } catch (error) {
                console.error(`Fehler beim Generieren von Sätzen (Versuch ${attempt + 1}/${MAX_RETRIES + 1}):`, error);
                if (attempt < MAX_RETRIES) {
                    await new Promise(res => setTimeout(res, 1000 * (attempt + 1))); // Wait before retrying
                }
            }
        }

        if (!success) {
            console.error("Alle Versuche fehlgeschlagen. Fallback auf lokale Daten.");
            setApiError("Sätze konnten nicht vom Server geladen werden. Es werden Standard-Sätze verwendet.");
            const fallbackPhrases = LEVELS[currentLevelId].phrases.map(p => ({ german: p, spanish: '' }));
            setLevelPhrases(fallbackPhrases);
        }

        setIsGenerating(false);
    };
    generateAndSetPhrases();
  }, [currentLevelId]);

  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (levelPhrases.length === 0) return;
    
    setGameState(GameState.Playing);
    setUserInput('');
    setCurrentTranslation(null);
    
    const shuffledPhrases = shuffle(levelPhrases);
    setActivePhrases(shuffledPhrases);

    const newWordSentenceMap: number[] = [];
    // FIX: Explicitly type the 'phrase' parameter to resolve TypeScript inference issue.
    const allWords = shuffledPhrases.flatMap((phrase: GeneratedPhrase, sentenceIndex) => {
        const sentenceWords = phrase.german.split(' ').filter(Boolean);
        sentenceWords.forEach(() => newWordSentenceMap.push(sentenceIndex));
        return sentenceWords;
    });
    setWords(allWords);
    setWordSentenceMap(newWordSentenceMap);
    
    setCurrentWordIndex(0);
    setTimeLeft(testDuration);
    setElapsedTime(0);
    setStats({ wpm: 0, accuracy: 100, correctChars: 0, incorrectChars: 0 });
    setFinalStats(null);
    setWpmHistory([]);
    setAccuracyHistory([]);
    setWordHistory([]);
    setDifficultWords([]);
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => (isInfiniteMode ? prev : prev - 1));
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, [levelPhrases, testDuration, isInfiniteMode]);

  const restartGame = useCallback(() => {
     if (timerRef.current) clearInterval(timerRef.current);
     setGameState(GameState.Ready);
     setUserInput('');
     setCurrentTranslation(null);
     setTimeLeft(testDuration);
     setElapsedTime(0);
     setWpmHistory([]);
     setAccuracyHistory([]);
     setWordHistory([]);
     setDifficultWords([]);
  }, [testDuration]);

  useEffect(() => {
    if (!isInfiniteMode && timeLeft <= 0 && gameState === GameState.Playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      
      const incorrectWords = wordHistory
        .filter(entry => entry.typed !== entry.word)
        .map(entry => entry.word);
      const uniqueIncorrectWords = [...new Set(incorrectWords)];
      setDifficultWords(uniqueIncorrectWords);
      
      setGameState(GameState.Finished);
      setFinalStats(stats);
    }
  }, [timeLeft, gameState, stats, isInfiniteMode, wordHistory]);
  
  useEffect(() => {
    if (gameState !== GameState.Playing) return;

    const totalChars = stats.correctChars + stats.incorrectChars;
    const accuracy = totalChars > 0 ? Math.round((stats.correctChars / totalChars) * 100) : 100;
    
    const wpm = elapsedTime > 0 ? Math.round((stats.correctChars / 5) / (elapsedTime / 60)) : 0;

    setStats(prev => ({ ...prev, accuracy, wpm }));

    if (elapsedTime > 0) {
        setWpmHistory(prevHistory => [...prevHistory, { time: elapsedTime, wpm }]);
        setAccuracyHistory(prevHistory => [...prevHistory, { time: elapsedTime, accuracy }]);
    }

  }, [stats.correctChars, stats.incorrectChars, elapsedTime, gameState]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== GameState.Playing || words.length === 0) return;

    if (e.key === ' ' || e.key === 'Backspace') {
      e.preventDefault();
    }
    
    const currentWord = words[currentWordIndex];
    
    if (e.key === ' ') {
      if (!userInput) return;
      setCurrentTranslation(null);

      const entry: WordHistoryEntry = { word: currentWord, typed: userInput };
      setWordHistory(prev => [...prev, entry]);
      
      const missedChars = Math.max(0, currentWord.length - userInput.length);
      if (missedChars > 0) {
        setStats(prev => ({...prev, incorrectChars: prev.incorrectChars + missedChars }));
      }
      
      if (userInput === currentWord) {
        setStats(prev => ({...prev, correctChars: prev.correctChars + 1}));
      }
      
      const isLastWordOfSentence = wordSentenceMap.length > 0 &&
                                 currentWordIndex < words.length - 1 &&
                                 wordSentenceMap[currentWordIndex] !== wordSentenceMap[currentWordIndex + 1];
      
      if (isLastWordOfSentence) {
        setIsSentenceTransitioning(true);
        setTimeout(() => setIsSentenceTransitioning(false), 400);
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
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const newUserInput = userInput + e.key;
        setUserInput(newUserInput);
        
        const isCorrect = currentWord[newUserInput.length - 1] === e.key;
        if (isCorrect) {
            setStats(prev => ({...prev, correctChars: prev.correctChars + 1}));
        } else {
            setStats(prev => ({...prev, incorrectChars: prev.incorrectChars + 1}));
        }
    }
  }, [gameState, userInput, words, currentWordIndex, wordSentenceMap]);

  const handleTTS = useCallback(() => {
    if (gameState !== GameState.Playing || !('speechSynthesis' in window)) return;
    const sentenceIndex = wordSentenceMap[currentWordIndex];
    if (sentenceIndex === undefined) return;
    const phrase = activePhrases[sentenceIndex];
    const utterance = new SpeechSynthesisUtterance(phrase.german);
    utterance.lang = 'de-DE';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [gameState, currentWordIndex, wordSentenceMap, activePhrases]);

  const handleTranslate = useCallback(() => {
    if (gameState !== GameState.Playing) return;
    const sentenceIndex = wordSentenceMap[currentWordIndex];
    if (sentenceIndex === undefined) return;
    const phrase = activePhrases[sentenceIndex];
    if (phrase.spanish) {
      setCurrentTranslation(phrase.spanish);
    }
  }, [gameState, currentWordIndex, wordSentenceMap, activePhrases]);


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const timeForUI = isInfiniteMode ? elapsedTime : timeLeft;
  const isTranslationAvailable = levelPhrases.length > 0 && !!levelPhrases[0].spanish;

  return (
    <main className="bg-slate-900 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 selection:bg-yellow-500/50">
      <div className="relative w-full max-w-4xl flex flex-col items-center justify-center">
        <header className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-orbitron text-yellow-300 tracking-wider">
            Typ-Affe
          </h1>
        </header>

        {apiError && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-lg relative max-w-3xl w-full text-center mb-4" role="alert">
            <span className="block sm:inline">{apiError}</span>
            <button 
                onClick={() => setApiError(null)} 
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                aria-label="Fehlermeldung schließen"
            >
                <svg className="fill-current h-6 w-6 text-amber-200/70 hover:text-amber-100" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Schließen</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
          </div>
        )}

        {gameState === GameState.Playing && (
            <GameUI 
              time={timeForUI} 
              isInfiniteMode={isInfiniteMode} 
              wpm={stats.wpm} 
              accuracy={stats.accuracy} 
              onRestart={restartGame}
              onTTS={handleTTS}
              onTranslate={handleTranslate}
              isTranslationAvailable={isTranslationAvailable}
            />
        )}
        
        <div className="w-full max-w-3xl min-h-[10rem] flex flex-col items-center justify-center">
          {gameState === GameState.Playing ? (
            <WordDisplay 
              words={words} 
              currentWordIndex={currentWordIndex} 
              userInput={userInput}
              wordSentenceMap={wordSentenceMap}
              isSentenceTransitioning={isSentenceTransitioning}
            />
          ) : (
             <div className="text-slate-500 text-2xl h-36 flex items-center">Konfiguriere deinen Test, um zu beginnen</div>
          )}
        </div>
        
        {currentTranslation && gameState === GameState.Playing && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg max-w-3xl w-full text-center relative border border-slate-700">
                <p className="text-cyan-300 text-lg italic pr-8">{currentTranslation}</p>
                <button 
                    onClick={() => setCurrentTranslation(null)} 
                    className="absolute top-2 right-2 text-slate-500 hover:text-white"
                    aria-label="Übersetzung schließen"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        )}

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
            isGenerating={isGenerating}
            wpmHistory={wpmHistory}
            accuracyHistory={accuracyHistory}
            difficultWords={difficultWords}
          />
        )}
      </div>
    </main>
  );
};

export default App;