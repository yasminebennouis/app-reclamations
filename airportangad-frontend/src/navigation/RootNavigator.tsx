// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';

import LoginScreen from '@/screens/auth/LoginScreen';
import HomeScreen from '@/screens/HomeScreen';
import CreateReclamationScreen from '@/screens/reclamation/CreateReclamationScreen';
import ReclamationListScreen from '@/screens/reclamation/ReclamationListScreen';
import ReclamationDetailModal from '@/screens/reclamation/ReclamationDetailModal';
import TechReplyScreen from '@/screens/Technicien/TechReplyScreen';
import StatsScreen from '@/screens/Admin/StatsScreen';
import ListeAllScreen from '@/screens/Admin/ListeAllScreen'; // ✅ ajout

// ---- Types des params de navigation ----
export type ListMode = 'my' | 'service' | 'all' | 'replied';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;

  // Listes
  MyReclamations: { mode?: ListMode } | undefined;          // défaut: 'my'
  ServiceReclamations: { mode?: ListMode } | undefined;     // défaut: 'service'
  TechnicianReplies: { mode?: ListMode } | undefined;       // défaut: 'replied'
  AdminReclamations: { mode?: ListMode } | undefined;       // défaut: 'all'

  // Création / détail / reply / stats
  CreateReclamation: undefined;
  ReclamationDetail: { id: number; mode?: ListMode };
  TechReply: { id: number };
  AdminStats: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  const isAdmin = user.role === 'ADMIN';
  const isTech = user.role === 'TECHNICIEN';
  const isDemandeur = user.role === 'DEMANDEUR';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* Demandeur : création + ses réclamations */}
      {isDemandeur && (
        <>
          <Stack.Screen name="CreateReclamation" component={CreateReclamationScreen} />
          <Stack.Screen
            name="MyReclamations"
            component={ReclamationListScreen}
            initialParams={{ mode: 'my' }}
          />
        </>
      )}

      {/* Technicien : pannes du service + réclamations auxquelles il a répondu */}
      {isTech && (
        <>
          <Stack.Screen
            name="ServiceReclamations"
            component={ReclamationListScreen}
            initialParams={{ mode: 'service' }}
          />
          <Stack.Screen
            name="TechnicianReplies"
            component={ReclamationListScreen}
            initialParams={{ mode: 'replied' }}
          />
          <Stack.Screen name="TechReply" component={TechReplyScreen} />
        </>
      )}

      {/* Admin : toutes les réclamations + stats */}
      {isAdmin && (
        <>
          <Stack.Screen
            name="AdminReclamations"
            component={ListeAllScreen} // ✅ utilise l'écran admin avec filtres/pagination
            initialParams={{ mode: 'all' }}
          />
          <Stack.Screen name="AdminStats" component={StatsScreen} />
        </>
      )}

      {/* Détail commun */}
      <Stack.Screen
        name="ReclamationDetail"
        component={ReclamationDetailModal}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
