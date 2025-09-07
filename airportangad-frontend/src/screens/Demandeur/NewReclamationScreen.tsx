// src/screens/Demandeur/NewReclamationScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { createReclamation } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { ServiceType } from '@/services/types'; // ✅ import de l’enum

export default function NewReclamationScreen({ navigation }: any) {
  const { user } = useAuth();
  const [service, setService] = useState<ServiceType>(ServiceType.IT); // ✅ enum
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');

  const submit = async () => {
    if (!user?.username) {
      Alert.alert('Erreur', 'Utilisateur non connecté.');
      return;
    }
    try {
      await createReclamation(user.username, {
        service,                 // ✅ type: ServiceType
        titre,
        description,
        photoPath: null,
      });
      Alert.alert('OK', 'Réclamation créée');
      navigation.goBack();
    } catch {
      Alert.alert('Erreur', 'Création impossible');
    }
  };

  return (
    <View style={{ flex: 1, padding: 12, gap: 12 }}>
      <Text>Service (IT / EQUIPEMENT / INFRASTRUCTURE)</Text>
      {/* TextInput renvoie une string → on caste vers ServiceType. 
          Idéalement tu utiliserais un Picker, mais on reste minimal ici. */}
      <TextInput
        value={service} // ServiceType est un enum string → OK
        onChangeText={(t) => setService(t as ServiceType)} // ✅ cast contrôlé
        autoCapitalize="characters"
        style={{ borderWidth: 1, padding: 8, borderRadius: 6 }}
      />

      <Text>Titre</Text>
      <TextInput
        value={titre}
        onChangeText={setTitre}
        style={{ borderWidth: 1, padding: 8, borderRadius: 6 }}
      />

      <Text>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ borderWidth: 1, padding: 8, borderRadius: 6, height: 100 }}
      />

      <Button title="Enregistrer" onPress={submit} />
    </View>
  );
}
