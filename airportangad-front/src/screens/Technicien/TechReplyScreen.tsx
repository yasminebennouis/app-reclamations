import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/context/AuthContext';
// import { StatutReclamation } from '@/types';
import { StatutReclamation } from '@/services/types';
import { postTechnicianReply } from '@/services/api'; // adapte au nom de ta fonction

export default function TechReplyScreen({ route, navigation }: any) {
  const { id } = route.params; // id de la réclamation
  const { user } = useAuth();

  const [commentaire, setCommentaire] = useState('');
  const [statut, setStatut] = useState<StatutReclamation>(StatutReclamation.EN_COURS);

  const submit = async () => {
    if (!commentaire.trim()) {
      Alert.alert('Validation', 'Merci de saisir un commentaire.');
      return;
    }
    try {
      await postTechnicianReply(id, user!.username, {
        reponse: commentaire.trim(),
        statut, // <-- enum
      });
      Alert.alert('Succès', 'Réponse enregistrée.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || e?.message || 'Échec.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réponse technicien</Text>

      <Text style={styles.label}>Statut</Text>
      <Picker
        selectedValue={statut}
        onValueChange={(v: StatutReclamation) => setStatut(v)}
      >
        <Picker.Item label="En cours" value={StatutReclamation.EN_COURS} />
        <Picker.Item label="Résolue" value={StatutReclamation.RESOLUE} />
        <Picker.Item label="Non résolue" value={StatutReclamation.NON_RESOLUE} />
      </Picker>

      <Text style={styles.label}>Commentaire</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={5}
        value={commentaire}
        onChangeText={setCommentaire}
        placeholder="Décrivez l'intervention…"
      />

      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={styles.btnTxt}>ENVOYER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  textArea: {
    borderWidth: 1, borderColor: '#d0d7e2', borderRadius: 10, padding: 12,
    minHeight: 120, textAlignVertical: 'top'
  },
  btn: {
    marginTop: 16, backgroundColor: '#4F46E5', paddingVertical: 12,
    borderRadius: 10, alignItems: 'center'
  },
  btnTxt: { color: '#fff', fontWeight: '800' },
});