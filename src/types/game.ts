export type Difficulty = 'easy' | 'medium' | 'hard';

export type Point = {
  x: number;
  y: number;
};

export type Pair = {
  id: string;
  color: string;
  start: Point;
  end: Point;
};

export type Level = {
  id: string;
  size: number;
  difficulty: Difficulty;
  pairs: Pair[];
};

export type PathMap = Record<string, Point[]>;

export type Solution = {
  paths: PathMap;
};

export type Score = {
  id?: string;
  levelId: string;
  playerName: string;
  timeSeconds: number;
  createdAt?: string;
};