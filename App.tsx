import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <AuthProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </AuthProvider>
  );
}
