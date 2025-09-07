// src/screens/reclamation/ReclamationDetailModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import {
  getMyReclamationDetail,
  getServiceReclamationDetail,
  getAdminReclamationDetail,
  api,
} from '@/services/api';

type DetailRoute = RouteProp<{ ReclamationDetail: { id: number; mode?: 'my' | 'service' | 'all' } }, 'ReclamationDetail'>;

export default function ReclamationDetailModal() {
  const route = useRoute<DetailRoute>();
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const { id, mode } = route.params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const role = user?.role;
        let d;

        if (role === 'DEMANDEUR' || mode === 'my') {
          d = await getMyReclamationDetail(id, user!.username);
        } else if (role === 'TECHNICIEN' || mode === 'service') {
          d = await getServiceReclamationDetail(id, user!.username);
        } else if (role === 'ADMIN' || mode === 'all') {
          d = await getAdminReclamationDetail(id);
        }

        if (mounted) setData(d);
      } catch (e: any) {
        console.error('detail error', e?.response?.data || e);
        if (mounted) setErr(e?.response?.data?.message || e?.message || 'Erreur de chargement');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, user?.role, user?.username, mode]);

  const imageUri = useMemo(() => {
    if (!data) return null;

    if (data.photoBase64) {
      if (typeof data.photoBase64 === 'string' && data.photoBase64.startsWith('data:')) {
        return data.photoBase64;
      }
      return `data:image/jpeg;base64,${data.photoBase64}`;
    }

    const path: string | undefined = data.photoPath;
    if (!path) return null;

    if (/^https?:\/\//i.test(path)) return path;
    const base = (api.defaults.baseURL || '').replace(/\/$/, '');
    const rel = path.startsWith('/') ? path : `/${path}`;
    return `${base}${rel}`;
  }, [data]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 8 }}>Chargement…</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#b91c1c', fontWeight: '700' }}>{err}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Aucune donnée</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header avec flèche retour et titre centré en dessous */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail réclamation</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{data.titre}</Text>

        <View style={styles.meta}>
          <Badge label={`Service : ${data.service}`} color="#2563eb" />
          <Badge label={`Statut : ${data.statut}`} color="#059669" />
        </View>

        {imageUri ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          </View>
        ) : (
          <View style={[styles.imageWrap, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={40} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF' }}>Aucune image</Text>
          </View>
        )}

        {/* Sections colorées */}
        <Section title="Description" color="#7c3aed" content={data.description} />
        <Section title="Réponse technicien" color="#0ea5e9" content={data.reponseTechnicien} />
        <Section
          title="Dates"
          color="#f59e0b"
          content={`Création : ${data.dateCreation ?? '—'}\nMise à jour : ${data.dateUpdate ?? '—'}\nRésolution : ${data.dateResolution ?? '—'}`}
        />
      </View>

      {user?.role === 'TECHNICIEN' && (
        <View style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            style={styles.replyBtn}
            onPress={() => nav.navigate('TechReply', { id, from: 'detail' })}
          >
            <Ionicons name="chatbox-ellipses-outline" size={18} color="#fff" />
            <Text style={styles.replyBtnText}>Reply / Changer statut</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function Section({ title, content, color = '#111827' }: { title: string; content?: string; color?: string }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      <Text style={styles.sectionContent}>{content || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', padding: 16 },

  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 20, // pousse le titre un peu vers le bas
    textAlign: 'center',
  },

  card: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },

  meta: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  badge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontWeight: '700', fontSize: 12 },

  imageWrap: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginBottom: 14,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', height: 220, borderRadius: 12 },

  section: { marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  sectionContent: { fontSize: 14, color: '#374151', lineHeight: 20 },

  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  replyBtnText: { color: '#fff', fontWeight: '700' },
});
