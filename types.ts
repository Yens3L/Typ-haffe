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
