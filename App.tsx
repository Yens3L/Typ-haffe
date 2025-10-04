import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, LevelId, TestDuration, TestStats, GeneratedPhrase, WPMDataPoint, WordHistoryEntry, AccuracyDataPoint } from './types';
import { LEVELS, TEST_DURATIONS } from './constants';
import WordDisplay from './components/WordDisplay';
import GameOverlay from './components/GameOverlay';
import GameUI from './components/GameUI';
import Header from './components/Header';
import { GoogleGenAI, Type } from "@google/genai";

const PHRASE_COUNT = 25;

const SENTENCE_COLORS = [
  'text-indigo-300',
  'text-rose-300',
  'text-teal-300',
  'text-amber-300',
  'text-purple-300',
  'text-lime-300',
];

const SOUNDS = {
  correct: 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjQwLjEwMQAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIwAAHwAAB1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-A/AAAahANAAGSB//uGQ5FAv/zRFNxWADgAABlR1//uGBAf/4Sg5xwb/80RzEwA4AAA0gA//uGCgf/wShDBv/zRHMDAHAAAADSAIAABQMPBAOAY4AAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-A/-A/AAA',
  incorrect: 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjQwLjEwMQAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIwAAHwAAB1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-A/AAAahANAAGS//uGQ5FAv/zRFNxWADgAABlR1//uGBAf/4Sg5xwb/80RzEwA4AAA0gA//uGCgf/wShDBv/zRHMDAHAAAADSAIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-A/AAA,',
  space: 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjQwLjEwMQAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIwAAHwAAB1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-A/AAAahANAAGSB//uGQ5FAv/zRFNxWADgAABlR1//uGBAf/4Sg5xwb/80RzEwA4AAA0gA//uGCgf/wShDBv/zRHMDAHAAAADSAIAABQMPBAOAY4AAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-A/AAA'
};
type SoundType = keyof typeof SOUNDS;

const SoundPlayer: React.FC = () => (
    <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        {Object.entries(SOUNDS).map(([key, src]) => (
            <audio key={key} id={`sound-${key}`} src={src} preload="auto" />
        ))}
    </div>
);

const useSound = (enabled: boolean) => {
    const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
        correct: null,
        incorrect: null,
        space: null,
    });

    useEffect(() => {
        audioRefs.current.correct = document.getElementById('sound-correct') as HTMLAudioElement;
        audioRefs.current.incorrect = document.getElementById('sound-incorrect') as HTMLAudioElement;
        audioRefs.current.space = document.getElementById('sound-space') as HTMLAudioElement;
    }, []);

    const playSound = useCallback((type: SoundType) => {
        if (!enabled || (window.speechSynthesis && window.speechSynthesis.speaking)) {
            return;
        }

        const audio = audioRefs.current[type];
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.3;
            audio.play().catch(e => { /* Autoplay error is fine, will work after first interaction */ });
        }
    }, [enabled]);

    return playSound;
};


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
  
  const [stats, setStats] = useState<TestStats>({ wpm: 0, accuracy: 0, correctChars: 0, incorrectChars: 0 });
  const [finalStats, setFinalStats] = useState<TestStats | null>(null);
  const [wpmHistory, setWpmHistory] = useState<WPMDataPoint[]>([]);
  const [accuracyHistory, setAccuracyHistory] = useState<AccuracyDataPoint[]>([]);
  const [wordHistory, setWordHistory] = useState<WordHistoryEntry[]>([]);
  const [difficultWords, setDifficultWords] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [levelPhrases, setLevelPhrases] = useState<GeneratedPhrase[]>([]);
  const [activePhrases, setActivePhrases] = useState<GeneratedPhrase[]>([]);
  const [wordSentenceMap, setWordSentenceMap] = useState<number[]>([]);
  const [currentTranslation, setCurrentTranslation] = useState<string | null>(null);
  const [isSentenceTransitioning, setIsSentenceTransitioning] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
        const savedSound = localStorage.getItem('typAffe-sound');
        return savedSound ? JSON.parse(savedSound) : true;
    } catch (error) {
        console.error("Could not read sound setting from localStorage", error);
        return true;
    }
  });
  
  const playSound = useSound(isSoundEnabled);

  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    try {
        localStorage.setItem('typAffe-sound', JSON.stringify(isSoundEnabled));
    } catch (error) {
        console.error("Could not save sound setting to localStorage", error);
    }
  }, [isSoundEnabled]);

  const startGame = useCallback(async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setLoadingProgress(0);
    setApiError(null);
    setCurrentTranslation(null);
    
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(95, prev + Math.random() * 5 + 2));
    }, 150);

    let generatedPhrases: GeneratedPhrase[] = [];
    let success = false;
    const MAX_RETRIES = 2;

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
              generatedPhrases = data.phrases;
              setLevelPhrases(generatedPhrases);
              success = true;
              break;
            }
            throw new Error("API returned no phrases or malformed data");

        } catch (error) {
            console.error(`Fehler beim Generieren von Sätzen (Versuch ${attempt + 1}/${MAX_RETRIES + 1}):`, error);
            if (attempt < MAX_RETRIES) {
                await new Promise(res => setTimeout(res, 1000 * (attempt + 1)));
            }
        }
    }

    if (!success) {
        console.error("Alle Versuche fehlgeschlagen. Fallback auf lokale Daten.");
        setApiError("Sätze konnten nicht vom Server geladen werden. Es werden Standard-Sätze verwendet.");
        generatedPhrases = LEVELS[currentLevelId].phrases.map(p => ({ german: p, spanish: '' }));
        setLevelPhrases(generatedPhrases);
    }
    
    clearInterval(progressInterval);
    setLoadingProgress(100);

    setTimeout(() => {
      if (generatedPhrases.length === 0) {
        setIsGenerating(false);
        return;
      }
      
      setGameState(GameState.Playing);
      setUserInput('');
      
      const shuffledPhrases = shuffle(generatedPhrases);
      setActivePhrases(shuffledPhrases);

      const newWordSentenceMap: number[] = [];
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
      setStats({ wpm: 0, accuracy: 0, correctChars: 0, incorrectChars: 0 });
      setFinalStats(null);
      setWpmHistory([]);
      setAccuracyHistory([]);
      setWordHistory([]);
      setDifficultWords([]);
      setIsTimerActive(false);
      setIsGenerating(false);
      
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 500);
  }, [currentLevelId, isGenerating, testDuration]);

  const restartGame = useCallback(() => {
     setGameState(GameState.Ready);
     setUserInput('');
     setCurrentTranslation(null);
     setTimeLeft(testDuration);
     setElapsedTime(0);
     setWpmHistory([]);
     setAccuracyHistory([]);
     setWordHistory([]);
     setDifficultWords([]);
     setIsTimerActive(false);
  }, [testDuration]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };
  
  const handleToggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };

  useEffect(() => {
    if (gameState !== GameState.Playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    if (isTimerActive) {
      if (!timerRef.current) {
        timerRef.current = window.setInterval(() => {
          setTimeLeft(prev => (isInfiniteMode ? prev : prev - 1));
          setElapsedTime(prev => prev + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, isTimerActive, isInfiniteMode]);

  useEffect(() => {
    if (!isInfiniteMode && timeLeft <= 0 && gameState === GameState.Playing) {
      setIsTimerActive(false);
      
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
    const accuracy = totalChars > 0 ? Math.round((stats.correctChars / totalChars) * 100) : 0;
    
    const wpm = elapsedTime > 0 ? Math.round((stats.correctChars / 5) / (elapsedTime / 60)) : 0;

    setStats(prev => ({ ...prev, accuracy, wpm }));

    if (elapsedTime > 0) {
        setWpmHistory(prevHistory => [...prevHistory, { time: elapsedTime, wpm }]);
        setAccuracyHistory(prevHistory => [...prevHistory, { time: elapsedTime, accuracy }]);
    }

  }, [stats.correctChars, stats.incorrectChars, elapsedTime, gameState]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== GameState.Playing || words.length === 0) return;

    if (!isTimerActive) {
        setIsTimerActive(true);
        setCurrentTranslation(null);
    }

    const newValue = e.target.value;
    const currentWord = words[currentWordIndex];

    if (newValue.endsWith(' ')) {
        const typedWord = newValue.trim();
        if (!typedWord) return; 

        playSound('space');
        
        const entry: WordHistoryEntry = { word: currentWord, typed: typedWord };
        setWordHistory(prev => [...prev, entry]);
        
        const missedChars = Math.max(0, currentWord.length - typedWord.length);
        if (missedChars > 0) {
            setStats(prev => ({...prev, incorrectChars: prev.incorrectChars + missedChars }));
        }
        
        if (typedWord === currentWord) {
            setStats(prev => ({...prev, correctChars: prev.correctChars + 1}));
        }
        
        const isLastWordOfTest = currentWordIndex === words.length - 1;
        if (isLastWordOfTest) {
            setIsTimerActive(false);
            const finalWordHistory = [...wordHistory, entry];
            const incorrectWords = finalWordHistory
                .filter(w => w.typed !== w.word)
                .map(w => w.word);
            setDifficultWords([...new Set(incorrectWords)]);
            
            setGameState(GameState.Finished);
            setFinalStats(stats);
            return;
        }
        
        const isLastWordOfSentence = wordSentenceMap[currentWordIndex] !== wordSentenceMap[currentWordIndex + 1];
        if (isLastWordOfSentence) {
            setIsTimerActive(false);
            const sentenceIndex = wordSentenceMap[currentWordIndex];
            if (sentenceIndex !== undefined) {
                const phrase = activePhrases[sentenceIndex];
                if (phrase && phrase.spanish) {
                    setCurrentTranslation(phrase.spanish);
                }
            }
            setIsSentenceTransitioning(true);
            setTimeout(() => {
                setIsSentenceTransitioning(false);
            }, 600);
        }

        setCurrentWordIndex(prev => prev + 1);
        setUserInput('');
        return;
    }

    if (newValue.length > userInput.length) {
        const addedChar = newValue[newValue.length - 1];
        const isCorrect = currentWord[newValue.length - 1] === addedChar;
        playSound(isCorrect ? 'correct' : 'incorrect');
        if (isCorrect) {
            setStats(prev => ({...prev, correctChars: prev.correctChars + 1}));
        } else {
            setStats(prev => ({...prev, incorrectChars: prev.incorrectChars + 1}));
        }
    }
    else if (newValue.length < userInput.length) {
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
    
    setUserInput(newValue);
  }, [gameState, userInput, words, currentWordIndex, wordSentenceMap, stats, wordHistory, activePhrases, isTimerActive, playSound]);

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
      setCurrentTranslation(currentTranslation ? null : phrase.spanish);
    }
  }, [gameState, currentWordIndex, wordSentenceMap, activePhrases, currentTranslation]);

  const handleSkipSentence = useCallback(() => {
    if (gameState !== GameState.Playing || words.length === 0) return;

    const currentSentenceIdx = wordSentenceMap[currentWordIndex];
    if (currentSentenceIdx === undefined) return;
    
    const lastWordOfSentenceIndex = wordSentenceMap.lastIndexOf(currentSentenceIdx);

    if (lastWordOfSentenceIndex >= words.length - 1) {
        setUserInput('');
        return;
    }

    const nextWordIndex = lastWordOfSentenceIndex + 1;

    setIsSentenceTransitioning(true);
    setTimeout(() => setIsSentenceTransitioning(false), 600);
    
    setCurrentWordIndex(nextWordIndex);
    setUserInput('');
    setCurrentTranslation(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [gameState, words, currentWordIndex, wordSentenceMap]);


  const timeForUI = isInfiniteMode ? elapsedTime : timeLeft;
  const isTranslationAvailable = levelPhrases.length > 0 && !!levelPhrases.some(p => p.spanish);

  return (
    <main className="bg-slate-900 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 selection:bg-yellow-500/50">
      <SoundPlayer />
      <Header 
        onRestart={restartGame} 
        onFullScreen={toggleFullScreen} 
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
      />
      <div className="relative w-full flex flex-col items-center justify-center pt-16">

        {apiError && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-lg relative w-full text-center mb-4" role="alert">
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
            <>
                <h1 className="text-5xl md:text-6xl font-bold font-orbitron text-yellow-300 tracking-wider mb-8">
                    Typ-Affe
                </h1>
                <GameUI 
                    time={timeForUI} 
                    isInfiniteMode={isInfiniteMode} 
                    wpm={stats.wpm} 
                    accuracy={stats.accuracy} 
                    onTTS={handleTTS}
                    onTranslate={handleTranslate}
                    isTranslationAvailable={isTranslationAvailable}
                    onSkipSentence={handleSkipSentence}
                    correctChars={stats.correctChars}
                    incorrectChars={stats.incorrectChars}
                />
            </>
        )}
        
        <div 
          className="relative w-full min-h-[10rem] flex flex-col items-center justify-center cursor-text px-4"
          onClick={() => inputRef.current?.focus()}
          aria-label="Typing area, click to focus"
        >
          {gameState === GameState.Playing ? (
            <WordDisplay 
              words={words} 
              currentWordIndex={currentWordIndex} 
              userInput={userInput}
              isSentenceTransitioning={isSentenceTransitioning}
              wordSentenceMap={wordSentenceMap}
              sentenceColors={SENTENCE_COLORS}
            />
          ) : (
             <div className="text-slate-500 text-2xl min-h-36 flex items-center">Konfiguriere deinen Test, um zu beginnen</div>
          )}
          
          <input
              ref={inputRef}
              type="text"
              className="absolute inset-0 w-full h-full bg-transparent border-none outline-none p-0 text-transparent caret-transparent cursor-text"
              value={userInput}
              onChange={handleInputChange}
              disabled={gameState !== GameState.Playing}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
          />
        </div>

        {currentTranslation && gameState === GameState.Playing && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg w-full text-center relative border border-slate-700">
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
            onRestart={restartGame}
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
            loadingProgress={loadingProgress}
          />
        )}
      </div>
    </main>
  );
};

export default App;