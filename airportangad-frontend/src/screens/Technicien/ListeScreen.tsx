// src/screens/Technicien/ListeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getServiceReclamations } from '@/services/api'; // ✅ bon import

type Rec = { id: number; titre: string; statut: string; demandeur?: { username: string } };

export default function ListeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [items, setItems] = useState<Rec[]>([]);

  const load = async () => {
    if (!user?.username) return;
    const data = await getServiceReclamations(user.username); // ✅ utilise la fonction helper
    setItems(Array.isArray(data) ? data : [data]);
  };

  useEffect(() => {
    const sub = navigation.addListener('focus', load);
    return sub;
  }, [navigation]);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ReponseTech', { id: item.id })}
            style={{ padding: 12, marginTop: 12, borderWidth: 1, borderRadius: 8 }}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.titre}</Text>
            <Text>Demandeur: {item.demandeur?.username ?? '—'} • Statut: {item.statut}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
