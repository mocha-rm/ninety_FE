import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { GameProvider } from './src/contexts/GameContext';
import { RoomProvider } from './src/contexts/RoomContext';
import { CharacterProvider } from './src/contexts/CharacterContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GameProvider>
          <RoomProvider>
            <CharacterProvider>
              <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
              <AppNavigator />
            </CharacterProvider>
          </RoomProvider>
        </GameProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
