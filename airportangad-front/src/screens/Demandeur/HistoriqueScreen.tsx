import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity } from 'react-native';
import { getMyReclamations } from '@/services/api'; // ✅ nouveau import
import { useAuth } from '@/context/AuthContext';

type Reclamation = {
  id: number;
  titre: string;
  service: string;
  statut: string;
};

export default function HistoriqueScreen({ navigation }: any) {
  const { user } = useAuth();
  const [items, setItems] = useState<Reclamation[]>([]);

  const load = async () => {
    if (!user?.username) return;
    const data = await getMyReclamations(user.username); // ✅ utilisation de la fonction api.ts
    setItems(Array.isArray(data) ? data : [data]);
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Button
        title="➕ Nouvelle réclamation"
        onPress={() => navigation.navigate('Nouvelle')}
      />
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 12, marginTop: 12, borderWidth: 1, borderRadius: 8 }}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.titre}</Text>
            <Text>
              Service: {item.service} • Statut: {item.statut}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

