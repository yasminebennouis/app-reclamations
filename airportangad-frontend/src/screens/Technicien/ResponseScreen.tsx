// src/screens/Technicien/ResponseScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { postTechnicianReply } from '@/services/api';
import { StatutReclamation } from '@/services/types';

export default function ResponseScreen({ route, navigation }: any) {
  const { id } = route.params as { id: number };
  const { user } = useAuth();

  const [reponse, setReponse] = useState('');
  // ✅ valeur initiale via l'enum
  const [statut, setStatut] = useState<StatutReclamation>(StatutReclamation.EN_COURS);
  // 👇 champ texte pour afficher ce que tape l'utilisateur (utile pour feedback)
  const [statutInput, setStatutInput] = useState<string>('EN_COURS');

  // Convertit la saisie en valeur d'enum si valide
  const parseStatut = (s: string): StatutReclamation | null => {
    const up = s.trim().toUpperCase();
    switch (up) {
      case 'EN_COURS':      return StatutReclamation.EN_COURS;
      case 'RESOLUE':       return StatutReclamation.RESOLUE;
      case 'NON_RESOLUE':   return StatutReclamation.NON_RESOLUE;
      default:              return null;
    }
  };

  const onChangeStatut = (txt: string) => {
    setStatutInput(txt);
    const parsed = parseStatut(txt);
    if (parsed !== null) {
      setStatut(parsed);
    }
  };

  const submit = async () => {
    try {
      if (!user?.username) {
        Alert.alert('Erreur', 'Utilisateur non connecté.');
        return;
      }
      await postTechnicianReply(id, user.username, { reponse, statut });
      Alert.alert('OK', 'Réponse enregistrée');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', "Impossible d'enregistrer");
    }
  };

  return (
    <View style={{ padding: 12, gap: 8 }}>
      <Text>Réponse</Text>
      <TextInput
        value={reponse}
        onChangeText={setReponse}
        multiline
        style={{ borderWidth: 1, padding: 8, borderRadius: 6, height: 100 }}
      />

      <Text>Statut (EN_COURS / RESOLUE / NON_RESOLUE)</Text>
      <TextInput
        value={statutInput}
        onChangeText={onChangeStatut}
        autoCapitalize="characters"
        style={{ borderWidth: 1, padding: 8, borderRadius: 6 }}
      />

      <Button title="Enregistrer" onPress={submit} />
    </View>
  );
}
