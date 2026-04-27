import React, {useEffect, useRef} from 'react';
import {
  Animated,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onStart: () => void;
};

const candies = [
  {label: 'A', color: '#ff4d4d', left: 30, top: 90, size: 54},
  {label: 'B', color: '#38bdf8', left: 280, top: 130, size: 62},
  {label: 'C', color: '#22c55e', left: 55, top: 520, size: 58},
  {label: 'D', color: '#f59e0b', left: 270, top: 590, size: 56},
  {label: 'E', color: '#8b5cf6', left: 160, top: 690, size: 52},
];

export function HomeScreen({onStart}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleBounce = useRef(new Animated.Value(0)).current;
  const playScale = useRef(new Animated.Value(1)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;

  const candyAnims = useRef(candies.map(() => new Animated.Value(0))).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -40) {
          onStart();
        }
      },
    }),
  ).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(titleBounce, {
          toValue: -12,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleBounce, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(playScale, {
          toValue: 1.08,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(playScale, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(swipeAnim, {
          toValue: -18,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(swipeAnim, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    candyAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -22,
            duration: 900 + index * 120,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 900 + index * 120,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  },);

  return (
    <LinearGradient
      colors={['#17c6d8', '#2b7be4', '#4b1fa7']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container} {...panResponder.panHandlers}>
          <View style={styles.decorCircleOne} />
          <View style={styles.decorCircleTwo} />
          <View style={styles.decorCircleThree} />

          {candies.map((item, index) => (
            <Animated.View
              key={item.label}
              style={[
                styles.candy,
                {
                  left: item.left,
                  top: item.top,
                  width: item.size,
                  height: item.size,
                  borderRadius: item.size / 2,
                  backgroundColor: item.color,
                  opacity: fadeAnim,
                  transform: [
                    {translateY: candyAnims[index]},
                    {
                      rotate: candyAnims[index].interpolate({
                        inputRange: [-22, 0],
                        outputRange: ['-12deg', '12deg'],
                      }),
                    },
                  ],
                },
              ]}>
              <Text style={styles.candyText}>{item.label}</Text>
            </Animated.View>
          ))}

          <Animated.View
            style={[
              styles.hero,
              {
                opacity: fadeAnim,
                transform: [{translateY: titleBounce}],
              },
            ]}>
            <Text style={styles.title}>Numberlink</Text>
            <Text style={styles.subtitle}>Puzzle Adventure</Text>
          </Animated.View>

          <Animated.View style={[styles.card, {opacity: fadeAnim}]}>
            <Text style={styles.cardTitle}>Connect the Colors</Text>
            <Text style={styles.cardText}>
              Swipe through the board, solve bright puzzles, and beat your best
              time.
            </Text>
          </Animated.View>

          <TouchableOpacity activeOpacity={0.9} onPress={onStart}>
            <Animated.View
              style={[
                styles.playButton,
                {transform: [{scale: playScale}, {translateY: swipeAnim}]},
              ]}>
              <Text style={styles.playArrow}>⌃</Text>
              <Text style={styles.playText}>Swipe up to unlock</Text>
              <Text style={styles.tapText}>Tap to start</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 110,
    paddingBottom: 55,
    overflow: 'hidden',
  },
  decorCircleOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.13)',
    top: -80,
    left: -80,
  },
  decorCircleTwo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.10)',
    bottom: 80,
    right: -90,
  },
  decorCircleThree: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 330,
    left: 120,
  },
  candy: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  candyText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  hero: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: {width: 0, height: 5},
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  cardText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playArrow: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '600',
    opacity: 0.9,
  },
  
  playText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  
  tapText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4,
  },
});