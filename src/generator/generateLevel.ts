import {Difficulty, Level, Pair} from '../types/game';
import {solveLevel} from '../solver/solveLevel';

type GenerateInput = {
  size: 5;
  difficulty: Difficulty;
};

const colors = {
  A: '#e74c3c',
  B: '#3498db',
  C: '#2ecc71',
  D: '#f59e0b',
  E: '#8b5cf6',
};

const easyPairs: Pair[] = [
  {id: 'A', color: colors.A, start: {x: 0, y: 0}, end: {x: 4, y: 0}},
  {id: 'B', color: colors.B, start: {x: 0, y: 1}, end: {x: 4, y: 1}},
  {id: 'C', color: colors.C, start: {x: 0, y: 2}, end: {x: 4, y: 2}},
  {id: 'D', color: colors.D, start: {x: 0, y: 3}, end: {x: 4, y: 3}},
  {id: 'E', color: colors.E, start: {x: 0, y: 4}, end: {x: 4, y: 4}},
];

const mediumPairs: Pair[] = [
  {id: 'A', color: colors.A, start: {x: 0, y: 0}, end: {x: 4, y: 0}},
  {id: 'B', color: colors.B, start: {x: 0, y: 1}, end: {x: 4, y: 1}},
  {id: 'C', color: colors.C, start: {x: 0, y: 2}, end: {x: 4, y: 2}},
  {id: 'D', color: colors.D, start: {x: 0, y: 3}, end: {x: 0, y: 4}},
];

const hardPairs: Pair[] = [
  {id: 'A', color: colors.A, start: {x: 0, y: 0}, end: {x: 4, y: 0}},
  {id: 'B', color: colors.B, start: {x: 0, y: 1}, end: {x: 4, y: 1}},
  {id: 'C', color: colors.C, start: {x: 0, y: 2}, end: {x: 2, y: 3}},
  {id: 'D', color: colors.D, start: {x: 0, y: 3}, end: {x: 0, y: 4}},
  {id: 'E', color: colors.E, start: {x: 2, y: 4}, end: {x: 4, y: 4}},
];

export function generateLevel({size, difficulty}: GenerateInput): Level {
  const pairs =
    difficulty === 'easy'
      ? easyPairs
      : difficulty === 'medium'
      ? mediumPairs
      : hardPairs;

  const level: Level = {
    id: `generated-${difficulty}-${Date.now()}`,
    size,
    difficulty,
    pairs,
  };

  const solution = solveLevel(level);

  if (!solution) {
    throw new Error('Generated level is not solvable');
  }

  return level;
}