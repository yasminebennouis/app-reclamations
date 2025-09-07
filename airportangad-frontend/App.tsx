import 'react-native-gesture-handler'; // ⚠️ doit être tout en haut
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

import AuthProvider from '@/context/AuthContext';
import RootNavigator from '@/navigation/RootNavigator';

export default function App(): React.ReactElement {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
