import {Level, Point, Solution} from '../types/game';
import {pointKey, samePoint} from '../utils/boardUtils';

const directions: Point[] = [
  {x: 1, y: 0},
  {x: -1, y: 0},
  {x: 0, y: 1},
  {x: 0, y: -1},
];

const inBounds = (point: Point, size: number) => {
  return point.x >= 0 && point.y >= 0 && point.x < size && point.y < size;
};

export function solveLevel(level: Level): Solution | null {
  const used = new Set<string>();
  const paths: Record<string, Point[]> = {};

  const endpoints = new Map<string, string>();

  for (const pair of level.pairs) {
    endpoints.set(pointKey(pair.start), pair.id);
    endpoints.set(pointKey(pair.end), pair.id);
  }

  const solvePair = (pairIndex: number): boolean => {
    if (pairIndex === level.pairs.length) {
      return used.size === level.size * level.size;
    }

    const pair = level.pairs[pairIndex];
    const path: Point[] = [pair.start];
    used.add(pointKey(pair.start));

    const result = dfs(pair.start, pair.end, pair.id, path, pairIndex);

    if (!result) {
      used.delete(pointKey(pair.start));
    }

    return result;
  };

  const dfs = (
    current: Point,
    target: Point,
    pairId: string,
    path: Point[],
    pairIndex: number,
  ): boolean => {
    if (samePoint(current, target)) {
      paths[pairId] = [...path];

      if (solvePair(pairIndex + 1)) {
        return true;
      }

      delete paths[pairId];
      return false;
    }

    for (const dir of directions) {
      const next = {
        x: current.x + dir.x,
        y: current.y + dir.y,
      };

      if (!inBounds(next, level.size)) {
        continue;
      }

      const key = pointKey(next);

      if (used.has(key)) {
        continue;
      }

      const endpointOwner = endpoints.get(key);

      if (endpointOwner && endpointOwner !== pairId) {
        continue;
      }

      used.add(key);
      path.push(next);

      if (dfs(next, target, pairId, path, pairIndex)) {
        return true;
      }

      path.pop();
      used.delete(key);
    }

    return false;
  };

  const solved = solvePair(0);

  if (!solved) {
    return null;
  }

  return {paths};
}