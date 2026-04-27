import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Board} from '../components/Board';
import {sampleLevel} from '../data/sampleLevel';
import {generateLevel} from '../generator/generateLevel';
import {Level, PathMap, Score} from '../types/game';
import {isWin} from '../utils/boardUtils';
import {solveLevel} from '../solver/solveLevel';
import {
  fetchLevel,
  fetchLevels,
  fetchScores,
  submitScore,
} from '../api/gameApi';

type Props = {
  playerName: string;
};

const colorPalettes = [
  ['#e74c3c', '#3498db', '#2ecc71', '#f59e0b', '#8b5cf6'],
  ['#ff4fa3', '#22c55e', '#ffcc00', '#38bdf8', '#a855f7'],
  ['#fb7185', '#06b6d4', '#84cc16', '#f97316', '#6366f1'],
];

const alphabetSets = [
  ['A', 'B', 'C', 'D', 'E'],
  ['P', 'Q', 'R', 'S', 'T'],
  ['L', 'M', 'N', 'O', 'Z'],
  ['K', 'U', 'V', 'W', 'X'],
];

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return `Hello ${name || 'Player'}, ${greeting}`;
}

function redesignLevel(level: Level): Level {
  const palette =
    colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  const letters =
    alphabetSets[Math.floor(Math.random() * alphabetSets.length)];

  return {
    ...level,
    id: `${level.id}-style-${Date.now()}`,
    originalId: level.originalId || level.id,
    pairs: level.pairs.map((pair, index) => ({
      ...pair,
      id: letters[index] || pair.id,
      color: palette[index] || pair.color,
    })),
  };
}

function scoreKey(score: Score) {
  return (
    score.id ||
    `${score.levelId}-${score.playerName}-${score.timeSeconds}-${score.createdAt}`
  );
}

export function GameScreen({playerName}: Props) {
  const [levels, setLevels] = useState<Level[]>([sampleLevel]);
  const [level, setLevel] = useState<Level>(redesignLevel(sampleLevel));
  const [paths, setPaths] = useState<PathMap>({});
  const [seconds, setSeconds] = useState(0);
  const [scores, setScores] = useState<Score[]>([]);
  const [allScores, setAllScores] = useState<Score[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(true);
  const [apiStatus, setApiStatus] = useState('Not checked yet');
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const scrollY = useRef(new Animated.Value(0)).current;
  const titleBounce = useRef(new Animated.Value(0)).current;
  const boardFloat = useRef(new Animated.Value(0)).current;
  const cardPulse = useRef(new Animated.Value(1)).current;

  const parallaxHeader = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, -55],
    extrapolate: 'clamp',
  });

  const parallaxScale = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleBounce, {
          toValue: -10,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(titleBounce, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(boardFloat, {
          toValue: -6,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(boardFloat, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cardPulse, {
          toValue: 1.025,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(cardPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [boardFloat, cardPulse, titleBounce]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!hasWon) {
        setSeconds(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [hasWon]);

  useEffect(() => {
    console.log('CURRENT LEVEL:', JSON.stringify(level, null, 2));
    console.log('CURRENT PATHS:', JSON.stringify(paths, null, 2));
    console.log('CURRENT LEVEL SCORES:', JSON.stringify(scores, null, 2));
    console.log('ALL SCORES:', JSON.stringify(allScores, null, 2));

    if (isWin(level, paths) && !hasWon) {
      setHasWon(true);
      setStatusMessage('Game completed. Auto-submitting score...');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths]);

  useEffect(() => {
    if (hasWon && !scoreSubmitted) {
      handleSubmitScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasWon, scoreSubmitted]);

  const resetRoundState = () => {
    setPaths({});
    setSeconds(0);
    setHasWon(false);
    setScoreSubmitted(false);
    setStatusMessage('');
  };

  const addToAllScores = (newScores: Score[]) => {
    setAllScores(prev => {
      const existing = new Set(prev.map(scoreKey));
      const uniqueNew = newScores.filter(score => !existing.has(scoreKey(score)));
      return [...uniqueNew, ...prev];
    });
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setApiStatus('GET /levels loading...');

      const apiLevels = await fetchLevels();

      console.log(
        'GAME SCREEN GET /levels DATA:',
        JSON.stringify(apiLevels, null, 2),
      );

      const validLevels = apiLevels.length > 0 ? apiLevels : [sampleLevel];
      const redesignedLevels = validLevels.map(item => redesignLevel(item));

      setLevels(redesignedLevels);

      const firstLevel = redesignedLevels[0];
      setLevel(firstLevel);

      setApiStatus(`GET /levels success. Levels: ${redesignedLevels.length}`);

      await loadScores(firstLevel.id);

      resetRoundState();
      setApiOnline(true);
    } catch (error: any) {
      console.log('LOAD INITIAL DATA FAILED:', error?.message);

      const local = redesignLevel(sampleLevel);

      setApiOnline(false);
      setApiStatus(`GET /levels failed: ${error?.message || 'Unknown error'}`);
      setLevels([local]);
      setLevel(local);
      resetRoundState();
      setStatusMessage('API is offline. Using local sample level.');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedLevel = async (levelId: string) => {
    try {
      setLoading(true);
      setApiStatus(`Loading level ${levelId}`);

      const selected = levels.find(item => item.id === levelId);

      if (selected) {
        setLevel(selected);
        await loadScores(selected.id);
        setApiStatus(`Selected level loaded: ${selected.id}`);
      } else {
        const apiLevel = await fetchLevel(levelId);
        const redesigned = redesignLevel(apiLevel);
        setLevel(redesigned);
        await loadScores(redesigned.id);
        setApiStatus(`GET /levels/${levelId} success`);
      }

      resetRoundState();
    } catch (error: any) {
      console.log('LOAD SELECTED LEVEL FAILED:', error?.message);
      setApiStatus(`Level load failed: ${error?.message || 'Unknown error'}`);
      Alert.alert('API Error', 'Could not load this level.');
    } finally {
      setLoading(false);
    }
  };

  const loadScores = async (levelId: string) => {
    try {
      const baseLevelId = level.originalId || levelId;
      setApiStatus(`GET /scores?levelId=${baseLevelId} loading...`);

      const apiScores = await fetchScores(baseLevelId);

      console.log('GAME SCREEN SCORES DATA:', JSON.stringify(apiScores, null, 2));

      setScores(apiScores);
      addToAllScores(apiScores);

      setApiStatus(`GET /scores success. Scores: ${apiScores.length}`);
    } catch (error: any) {
      console.log('LOAD SCORES FAILED:', error?.message);
      setApiStatus(`GET /scores failed: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleSubmitScore = async () => {
    if (!isWin(level, paths)) {
      setStatusMessage(
        'Game is not complete. Connect all matching colors and fill every grid cell before submitting.',
      );
      return;
    }

    if (scoreSubmitted) {
      setStatusMessage('Score already submitted for this level attempt.');
      return;
    }

    const newScore: Score = {
      id: `local-${level.id}-${Date.now()}`,
      levelId: level.originalId || level.id,
      playerName: playerName || 'Player',
      timeSeconds: seconds,
      difficulty: level.difficulty,
      createdAt: new Date().toISOString(),
    };

    console.log('POSTING SCORE FOR CURRENT LEVEL:', JSON.stringify(newScore, null, 2));

    setScoreSubmitted(true);
    setHasWon(true);
    setScores(prev => [newScore, ...prev]);
    addToAllScores([newScore]);
    setStatusMessage('Score saved locally. Syncing with API...');
    setApiStatus(`POST /scores loading for level: ${level.id}`);

    try {
      const response = await submitScore(newScore);

      console.log('POST /scores RESPONSE:', JSON.stringify(response, null, 2));

      setApiStatus(`POST /scores success for level: ${level.id}`);
      setStatusMessage('Score submitted successfully.');

      await loadScores(level.id);
    } catch (error: any) {
      console.log('POST /scores FAILED IN GAME SCREEN:', error?.message);

      setApiStatus(`POST /scores failed: ${error?.message || 'Unknown error'}`);
      setStatusMessage('Score saved locally, but API submission failed.');
    }
  };

  const resetGameWithNewDesign = () => {
    const redesigned = redesignLevel(level);

    console.log('RESET NEW LEVEL DESIGN:', JSON.stringify(redesigned, null, 2));

    setLevel(redesigned);
    setLevels(prev => prev.map(item => (item.id === level.id ? redesigned : item)));
    resetRoundState();
    setStatusMessage('New design loaded. Alphabets and colors changed.');
  };

  const handleHint = () => {
    const solution = solveLevel(level);

    console.log('SOLVER OUTPUT:', JSON.stringify(solution, null, 2));

    if (!solution) {
      setStatusMessage(
        'This board is unsolvable. Please generate a new level or reset the game.',
      );
      return;
    }

    for (const pair of level.pairs) {
      const solvedPath = solution.paths[pair.id];
      const currentPath = paths[pair.id] || [pair.start];

      if (!solvedPath || solvedPath.length === 0) {
        continue;
      }

      const nextPoint = solvedPath[currentPath.length];

      if (nextPoint) {
        setPaths(prev => ({
          ...prev,
          [pair.id]: [...currentPath, nextPoint],
        }));

        setStatusMessage(
          `Hint: Continue ${pair.id} to row ${nextPoint.y + 1}, column ${
            nextPoint.x + 1
          }.`,
        );
        return;
      }
    }

    setStatusMessage('No more hints available.');
  };

  const handleGenerateLevel = async (difficulty: 'easy' | 'medium' | 'hard') => {
    try {
      const generated = redesignLevel(generateLevel({size: 5, difficulty}));

      console.log('GENERATED LEVEL:', JSON.stringify(generated, null, 2));

      setLevel(generated);
      setLevels(prev => [generated, ...prev]);
      resetRoundState();
      setStatusMessage(`${difficulty.toUpperCase()} level generated.`);

      await loadScores(generated.id);
    } catch (error: any) {
      console.log('GENERATE LEVEL FAILED:', error?.message);
      setStatusMessage('Could not generate a solvable level.');
    }
  };

  const formattedTime = useMemo(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [seconds]);

  const sortedAllScores = useMemo(() => {
    return [...allScores].sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
  }, [allScores]);

  if (loading) {
    return (
      <LinearGradient
        colors={['#15c7db', '#2670e8', '#4c1d95']}
        style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading puzzles...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#15c7db', '#2670e8', '#4c1d95']}
      style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          scrollEnabled={!isDragging}
          contentContainerStyle={styles.container}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: true},
          )}>
          <View style={styles.bubbleOne} />
          <View style={styles.bubbleTwo} />
          <View style={styles.bubbleThree} />

          <Animated.View
            style={[
              styles.header,
              {
                transform: [
                  {translateY: parallaxHeader},
                  {scale: parallaxScale},
                ],
              },
            ]}>
            <Animated.Text
              style={[styles.title, {transform: [{translateY: titleBounce}]}]}>
              Numberlink
            </Animated.Text>

            <Text style={styles.greeting}>{getGreeting(playerName)}</Text>
            <Text style={styles.subtitle}>
              Match colors, fill the board, beat the clock
            </Text>
          </Animated.View>

          {!apiOnline && (
            <View style={styles.transparentBox}>
              <Text style={styles.warningText}>
                API is offline. Using local sample level.
              </Text>
            </View>
          )}

          <Animated.View
            style={[styles.glassStats, {transform: [{scale: cardPulse}]}]}>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>LEVEL</Text>
              <Text style={styles.statValue}>
                {level?.difficulty?.toUpperCase() || 'LEVEL'}
              </Text>
            </View>

            <View style={styles.statPill}>
              <Text style={styles.statLabel}>TIME</Text>
              <Text style={styles.statValue}>{formattedTime}</Text>
            </View>

            <View style={styles.statPill}>
              <Text style={styles.statLabel}>PLAYER</Text>
              <Text style={styles.statValue}>{playerName || 'Player'}</Text>
            </View>
          </Animated.View>

          <View style={styles.transparentBox}>
            <Text style={styles.sectionTitle}>Levels</Text>

            <View style={styles.generateRow}>
              <TouchableOpacity
                style={styles.glassButton}
                onPress={() => handleGenerateLevel('easy')}>
                <Text style={styles.buttonText}>Easy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.glassButton}
                onPress={() => handleGenerateLevel('medium')}>
                <Text style={styles.buttonText}>Medium</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.glassButton}
                onPress={() => handleGenerateLevel('hard')}>
                <Text style={styles.buttonText}>Hard</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.transparentBox}>
            <Text style={styles.sectionTitle}>Selected Levels</Text>

            <View style={styles.levelRow}>
              {levels.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.levelButton,
                    item.id === level.id && styles.activeLevelButton,
                  ]}
                  onPress={() => loadSelectedLevel(item.id)}>
                  <Text style={styles.levelButtonText}>
                    {item?.difficulty || 'level'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {statusMessage !== '' && (
            <View style={styles.transparentBox}>
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          )}

          {hasWon && (
            <View style={styles.winBox}>
              <Text style={styles.winText}>
                {scoreSubmitted ? 'Score Submitted' : 'Game Completed'}
              </Text>
            </View>
          )}

          <Animated.View
            style={[styles.boardWrapper, {transform: [{translateY: boardFloat}]}]}>
            <Board
              level={level}
              paths={paths}
              setPaths={setPaths}
              setIsDragging={setIsDragging}
            />
          </Animated.View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.glassActionButton}
              onPress={resetGameWithNewDesign}>
              <Text style={styles.actionText}>Reset + New Design</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.glassActionButton} onPress={handleHint}>
              <Text style={styles.actionText}>Hint</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, scoreSubmitted && styles.disabledButton]}
            onPress={handleSubmitScore}
            disabled={scoreSubmitted}>
            <Text style={styles.submitButtonText}>
              {scoreSubmitted ? 'Score Already Submitted' : 'Submit Score'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.refreshButton} onPress={loadInitialData}>
            <Text style={styles.submitButtonText}>Refresh API Data</Text>
          </TouchableOpacity>

          <View style={styles.transparentBox}>
            <Text style={styles.sectionTitle}>All Level Scoreboard</Text>

            {sortedAllScores.length === 0 ? (
              <Text style={styles.emptyText}>No scores yet</Text>
            ) : (
              sortedAllScores.map((score, index) => (
                <View key={`${scoreKey(score)}-${index}`} style={styles.scoreRow}>
                  <View>
                    <Text style={styles.scoreName}>
                      #{index + 1} {score.playerName || 'Unknown'}
                    </Text>
                    <Text style={styles.scoreDifficulty}>
                      {score?.difficulty?.toUpperCase() || 'N/A'}
                    </Text>  
                  </View>

                  <Text style={styles.scoreTime}>{score?.timeSeconds ?? 0}s</Text>
                </View>
              ))
            )}
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {flex: 1},
  safe: {flex: 1},
  container: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 44,
    overflow: 'hidden',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#ffffff',
    fontWeight: '900',
  },
  bubbleOne: {
    position: 'absolute',
    top: -90,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bubbleTwo: {
    position: 'absolute',
    top: 300,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  bubbleThree: {
    position: 'absolute',
    bottom: 80,
    left: -80,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 14,
  },
  title: {
    fontSize: 46,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.28)',
    textShadowOffset: {width: 0, height: 6},
    textShadowRadius: 12,
  },
  greeting: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '800',
    textAlign: 'center',
  },
  transparentBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 28,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  glassStats: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 28,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '900',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  generateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  glassButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelButton: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  activeLevelButton: {
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  levelButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  warningText: {
    color: '#fff7ed',
    fontWeight: '900',
    textAlign: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontWeight: '900',
    textAlign: 'center',
  },
  winBox: {
    backgroundColor: 'rgba(34,197,94,0.75)',
    borderColor: '#ffffff',
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginBottom: 14,
  },
  winText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  boardWrapper: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  glassActionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '900',
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    backgroundColor: 'rgba(34,197,94,0.85)',
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  refreshButton: {
    width: '100%',
    backgroundColor: 'rgba(124,58,237,0.85)',
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  disabledButton: {
    opacity: 0.55,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '800',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  scoreName: {
    color: '#ffffff',
    fontWeight: '900',
  },
  scoreLevel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 3,
  },
  scoreDifficulty: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  scoreTime: {
    color: '#ffcc00',
    fontWeight: '900',
  },
});