import {Level, PathMap, Point} from '../types/game';

export const pointKey = (p: Point) => `${p.x}-${p.y}`;

export const samePoint = (a: Point, b: Point) => {
  return a.x === b.x && a.y === b.y;
};

export const isAdjacent = (a: Point, b: Point) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
};

export const getPairAtPoint = (level: Level, point: Point) => {
  return level.pairs.find(
    pair => samePoint(pair.start, point) || samePoint(pair.end, point),
  );
};

export const getUsedCellOwner = (paths: PathMap, point: Point) => {
  for (const pairId of Object.keys(paths)) {
    if (paths[pairId].some(p => samePoint(p, point))) {
      return pairId;
    }
  }

  return null;
};

export const getCellColor = (
  level: Level,
  paths: PathMap,
  point: Point,
): string | null => {
  for (const pair of level.pairs) {
    const path = paths[pair.id] || [];

    if (path.some(p => samePoint(p, point))) {
      return pair.color;
    }

    if (samePoint(pair.start, point) || samePoint(pair.end, point)) {
      return pair.color;
    }
  }

  return null;
};

export const isWin = (level: Level, paths: PathMap): boolean => {
  const usedCells = new Set<string>();

  for (const pair of level.pairs) {
    const path = paths[pair.id];

    if (!path || path.length < 2) {
      return false;
    }

    const first = path[0];
    const last = path[path.length - 1];

    const connectedForward =
      samePoint(first, pair.start) && samePoint(last, pair.end);

    const connectedReverse =
      samePoint(first, pair.end) && samePoint(last, pair.start);

    if (!connectedForward && !connectedReverse) {
      return false;
    }

    for (let i = 1; i < path.length; i++) {
      if (!isAdjacent(path[i - 1], path[i])) {
        return false;
      }
    }

    for (const point of path) {
      usedCells.add(pointKey(point));
    }
  }

  return usedCells.size === level.size * level.size;
};