import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HistoriqueScreen from '@/screens/Demandeur/HistoriqueScreen';
import NewReclamationScreen from '@/screens/Demandeur/NewReclamationScreen';

import ListeTech from '@/screens/Technicien/ListeScreen';
import ReponseTech from '@/screens/Technicien/ResponseScreen';

import ListeAll from '@/screens/Admin/ListeAllScreen';
import Stats from '@/screens/Admin/StatsScreen';

const Stack = createNativeStackNavigator();

export function DemandeurStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Historique" component={HistoriqueScreen} />
      <Stack.Screen name="Nouvelle" component={NewReclamationScreen} />
    </Stack.Navigator>
  );
}

export function TechnicienStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListeTech" component={ListeTech} options={{ title: 'Réclamations (service)' }} />
      <Stack.Screen name="ReponseTech" component={ReponseTech} options={{ title: 'Réponse' }} />
    </Stack.Navigator>
  );
}

export function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListeAll" component={ListeAll} options={{ title: 'Toutes les réclamations' }} />
      <Stack.Screen name="Stats" component={Stats} options={{ title: 'Statistiques' }} />
    </Stack.Navigator>
  );
} 