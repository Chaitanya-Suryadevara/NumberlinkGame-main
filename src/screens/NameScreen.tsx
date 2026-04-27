import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onContinue: (name: string) => void;
};

export function NameScreen({onContinue}: Props) {
  const [name, setName] = useState('');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 17) {
      return 'Good afternoon';
    }

    return 'Good evening';
  }, []);

  const handleContinue = () => {
    const finalName = name.trim() || 'Player';
    onContinue(finalName);
  };

  return (
    <LinearGradient
      colors={['#15c7db', '#2670e8', '#4c1d95']}
      style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}>
          <View style={styles.bubbleOne} />
          <View style={styles.bubbleTwo} />

          <View style={styles.card}>
            <Text style={styles.emoji}></Text>
            <Text style={styles.title}>Ready to Play?</Text>
            <Text style={styles.subtitle}>
              Enter your name so we can personalize your puzzle dashboard.
            </Text>

            <Text style={styles.label}>Your Name</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Example: Chaithanya"
              placeholderTextColor="rgba(255,255,255,0.65)"
              style={styles.input}
              autoCapitalize="words"
            />

            <Text style={styles.preview}>
              {greeting}, {name.trim() || 'Player'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.button}
              onPress={handleContinue}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    padding: 24,
    justifyContent: 'center',
  },
  bubbleOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.13)',
    top: -70,
    left: -90,
  },
  bubbleTwo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.10)',
    bottom: -40,
    right: -80,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  emoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    color: '#ffffff',
    fontWeight: '900',
    marginTop: 28,
    marginBottom: 8,
  },
  input: {
    color: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    fontWeight: '700',
  },
  preview: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 22,
  },
  button: {
    backgroundColor: '#ffcc00',
    borderRadius: 22,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  buttonText: {
    color: '#4b1fa7',
    fontWeight: '900',
    fontSize: 17,
  },
});