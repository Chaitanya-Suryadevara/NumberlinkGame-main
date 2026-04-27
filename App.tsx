import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {HomeScreen} from './src/screens/HomeScreen';
import {NameScreen} from './src/screens/NameScreen';
import {GameScreen} from './src/screens/GameScreen';

type AppStep = 'home' | 'name' | 'game';

function App(): React.JSX.Element {
  const [step, setStep] = useState<AppStep>('home');
  const [playerName, setPlayerName] = useState('');

  return (
    <>
      <StatusBar barStyle="light-content" />
      {step === 'home' && <HomeScreen onStart={() => setStep('name')} />}

      {step === 'name' && (
        <NameScreen
          onContinue={name => {
            setPlayerName(name);
            setStep('game');
          }}
        />
      )}

      {step === 'game' && <GameScreen playerName={playerName} />}
    </>
  );
}

export default App;