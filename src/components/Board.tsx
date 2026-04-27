import React, {useMemo, useRef} from 'react';
import {Dimensions, PanResponder, StyleSheet, View} from 'react-native';
import {Cell} from './Cell';
import {Level, PathMap, Point} from '../types/game';
import {
  getCellColor,
  getPairAtPoint,
  getUsedCellOwner,
  isAdjacent,
  samePoint,
} from '../utils/boardUtils';

type Props = {
  level: Level;
  paths: PathMap;
  setPaths: React.Dispatch<React.SetStateAction<PathMap>>;
  setIsDragging?: (value: boolean) => void;
};

const screenWidth = Dimensions.get('window').width;
const boardPadding = 32;
const boardSize = screenWidth - boardPadding;
const cellSize = boardSize / 5;

export function Board({level, paths, setPaths, setIsDragging}: Props) {
  const activePairId = useRef<string | null>(null);
  const boardRef = useRef<View>(null);
  const boardPosition = useRef({x: 0, y: 0});

  const updateBoardPosition = () => {
    boardRef.current?.measureInWindow((x, y) => {
      boardPosition.current = {x, y};
    });
  };

  const pointFromPageTouch = (pageX: number, pageY: number): Point | null => {
    const localX = pageX - boardPosition.current.x;
    const localY = pageY - boardPosition.current.y;

    const x = Math.floor(localX / cellSize);
    const y = Math.floor(localY / cellSize);

    if (x < 0 || y < 0 || x >= level.size || y >= level.size) {
      return null;
    }

    return {x, y};
  };

  const startPath = (point: Point) => {
    const pair = getPairAtPoint(level, point);

    if (!pair) {
      return;
    }

    activePairId.current = pair.id;

    setPaths(prev => ({
      ...prev,
      [pair.id]: [point],
    }));
  };

  const addPointToPath = (point: Point) => {
    const pairId = activePairId.current;

    if (!pairId) {
      return;
    }

    setPaths(prev => {
      const currentPath = prev[pairId] || [];
      const lastPoint = currentPath[currentPath.length - 1];

      if (!lastPoint) {
        return prev;
      }

      if (samePoint(lastPoint, point)) {
        return prev;
      }

      if (!isAdjacent(lastPoint, point)) {
        return prev;
      }

      const existingIndex = currentPath.findIndex(p => samePoint(p, point));

      if (existingIndex >= 0) {
        return {
          ...prev,
          [pairId]: currentPath.slice(0, existingIndex + 1),
        };
      }

      const usedOwner = getUsedCellOwner(prev, point);

      if (usedOwner && usedOwner !== pairId) {
        return prev;
      }

      const endpointPair = getPairAtPoint(level, point);

      if (endpointPair && endpointPair.id !== pairId) {
        return prev;
      }

      return {
        ...prev,
        [pairId]: [...currentPath, point],
      };
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,

        onPanResponderGrant: event => {
            setIsDragging?.(true);
            updateBoardPosition();
          
            const {pageX, pageY} = event.nativeEvent;
            const point = pointFromPageTouch(pageX, pageY);
          
            if (point) {
              startPath(point);
            }
          },
          
        onPanResponderMove: event => {
          const {pageX, pageY} = event.nativeEvent;
          const point = pointFromPageTouch(pageX, pageY);

          if (point) {
            addPointToPath(point);
          }
        },

        onPanResponderRelease: () => {
          activePairId.current = null;
          setIsDragging?.(false);
        },

        onPanResponderTerminate: () => {
          activePairId.current = null;
          setIsDragging?.(false);
        },
      }),
    [level],
  );

  const rows = [];

  for (let y = 0; y < level.size; y++) {
    const cells = [];

    for (let x = 0; x < level.size; x++) {
      const point = {x, y};
      const pair = getPairAtPoint(level, point);
      const color = getCellColor(level, paths, point);

      cells.push(
        <Cell
          key={`${x}-${y}`}
          size={cellSize}
          color={color}
          label={pair?.id}
          isEndpoint={!!pair}
        />,
      );
    }

    rows.push(
      <View key={y} style={styles.row}>
        {cells}
      </View>,
    );
  }

  return (
    <View
      ref={boardRef}
      onLayout={updateBoardPosition}
      style={styles.board}
      {...panResponder.panHandlers}>
      {rows}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: boardSize,
    height: boardSize,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
  },
});