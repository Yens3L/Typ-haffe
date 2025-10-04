export enum GameState {
  Ready,
  Playing,
  Finished,
}

export type LevelId = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Level {
  name: string;
  phrases: string[];
}

export type TestDuration = 0 | 30 | 60 | 90;

export interface TestStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
}

export interface GeneratedPhrase {
  german: string;
  spanish: string;
}
