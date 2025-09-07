// src/screens/Admin/ListeAllScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, useColorScheme, RefreshControl, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { getAdminReclamations, getAllReclamations } from '@/services/api';
import { ServiceType, StatutReclamation } from '@/services/types';

type ServiceOpt = '' | ServiceType;
type StatutOpt  = '' | StatutReclamation;

function formatFR(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('fr-FR', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

export default function ListeAllScreen() {
  const nav = useNavigation<any>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const C = useMemo(() => ({
    bgGrad: (isDark ? ['#0f172a', '#0b1220'] : ['#eef2ff', '#eaf1ff']) as [string, string],
    headGrad: ['#6c5ce7', '#4f46e5'] as [string, string],
    card: isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)',
    border: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(148,163,184,0.20)',
    text: isDark ? '#e5e7eb' : '#0f172a',
    sub: isDark ? '#94a3b8' : '#475569',
    title: '#4F46E5',
    chipBg: isDark ? '#1f2937' : '#f1f5f9',
    chipBorder: isDark ? '#334155' : '#e2e8f0',
    primary: '#4F46E5',
    white: '#fff',
    shadowCard: Platform.select({
      ios:  { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 3 },
      default: {},
    }) as any,
  }), [isDark]);

  const [q, setQ] = useState('');
  const [service, setService] = useState<ServiceOpt>('');
  const [statut, setStatut] = useState<StatutOpt>('');

  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const p = reset ? 0 : page;
      let res: { content: any[]; totalPages: number } | null = null;

      try {
        res = await getAdminReclamations({
          page: p,
          size,
          sort: 'dateCreation',
          q: q.trim() || undefined,
          service: service === '' ? undefined : service,
          statut : statut  === '' ? undefined : statut,
        });
      } catch {
        const all = await getAllReclamations();
        const filtered = all.filter((r: any) => {
          const needle = q.trim().toLowerCase();
          const okQ = !needle || (r.titre?.toLowerCase().includes(needle) || r.description?.toLowerCase().includes(needle));
          const okS = !service || r.service === service;
          const okT = !statut  || r.statut  === statut;
          return okQ && okS && okT;
        });
        const paged = filtered.slice(p * size, (p + 1) * size);
        res = { content: paged, totalPages: Math.ceil(filtered.length / size) || 1 };
      }

      setHasMore(p + 1 < res!.totalPages);
      setPage(p + 1);
      setRows(reset ? res!.content : [...rows, ...res!.content]);
    } finally {
      setLoading(false);
      if (reset) setRefreshing(false);
    }
  }, [loading, page, size, q, service, statut, rows]);

  useEffect(() => { load(true); }, []);

  const applyFilters = () => { setPage(0); load(true); };
  const onRefresh    = () => { setRefreshing(true); setPage(0); load(true); };

  const goDetail = (id: number) => nav.navigate('ReclamationDetail', { id, mode: 'all' });

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.cardWrap, C.shadowCard]}
      onPress={() => goDetail(item.id)}
      activeOpacity={0.9}
      accessibilityRole="button"
    >
      <View style={[styles.statusStripe, { backgroundColor: stripeColor(item.statut) }]} />
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Ionicons name="document-text-outline" size={18} color={C.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: C.title }]} numberOfLines={1}>
              {item.titre || 'Sans titre'}
            </Text>
          </View>
          <StatutBadge statut={item.statut} />
        </View>

        {!!item.description && (
          <Text style={[styles.desc, { color: C.sub }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          <View style={[styles.chip, { backgroundColor: C.chipBg, borderColor: C.chipBorder }]}>
            <Ionicons name="layers-outline" size={14} color="#2563eb" style={{ marginRight: 4 }} />
            <Text style={[styles.chipTxt, { color: C.text }]}>{item.service}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: C.chipBg, borderColor: C.chipBorder }]}>
            <Ionicons name="calendar-outline" size={14} color="#0ea5e9" style={{ marginRight: 4 }} />
            <Text style={[styles.chipTxt, { color: C.text }]}>Créé le {formatFR(item.dateCreation)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={C.bgGrad} style={styles.container}>
      {/* HEADER : flèche uniquement, titre centré et un peu plus bas */}
      <LinearGradient colors={C.headGrad} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.header}>
        {/* Zone gauche largeur fixe (60) pour équilibrer */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => nav.navigate('Home')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Toutes les réclamations</Text>

        {/* Spacer droite même largeur que la zone gauche pour garder le centrage */}
        <View style={{ width: 60 }} />
      </LinearGradient>

      {/* BARRE DE RECHERCHE */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#64748b" />
          <TextInput
            placeholder="Rechercher (titre / description)"
            placeholderTextColor="#94a3b8"
            value={q}
            onChangeText={setQ}
            onSubmitEditing={applyFilters}
            style={styles.input}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={applyFilters} style={styles.okBtn} activeOpacity={0.9}>
            <Text style={styles.okBtnTxt}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FILTRES */}
      <View style={styles.filtersRow}>
        <View style={styles.pickerCard}>
          <Picker selectedValue={service} onValueChange={(v: ServiceOpt) => setService(v)} dropdownIconColor="#64748b">
            <Picker.Item label="Service (tous)" value="" />
            <Picker.Item label="IT" value={ServiceType.IT} />
            <Picker.Item label="Équipement" value={ServiceType.EQUIPEMENT} />
            <Picker.Item label="Infrastructure" value={ServiceType.INFRASTRUCTURE} />
          </Picker>
        </View>

        <View style={styles.pickerCard}>
          <Picker selectedValue={statut} onValueChange={(v: StatutOpt) => setStatut(v)} dropdownIconColor="#64748b">
            <Picker.Item label="Statut (tous)" value="" />
            <Picker.Item label="Ouvert" value={StatutReclamation.OUVERT} />
            <Picker.Item label="En cours" value={StatutReclamation.EN_COURS} />
            <Picker.Item label="Résolue" value={StatutReclamation.RESOLUE} />
            <Picker.Item label="Non résolue" value={StatutReclamation.NON_RESOLUE} />
          </Picker>
        </View>

        <TouchableOpacity style={styles.applyBtn} onPress={applyFilters} activeOpacity={0.9}>
          <Text style={styles.applyBtnTxt}>Appliquer</Text>
        </TouchableOpacity>
      </View>

      {/* LISTE */}
      <FlatList
        data={rows}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        onEndReached={() => hasMore && load(false)}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />
        }
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 12 }} color={C.primary} /> : null}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="file-tray-outline" size={40} color="#94a3b8" />
              <Text style={styles.emptyTxt}>Aucune réclamation</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

function stripeColor(statut?: string) {
  if (statut === 'OUVERT') return '#3b82f6';
  if (statut === 'EN_COURS') return '#f59e0b';
  if (statut === 'RESOLUE') return '#10b981';
  if (statut === 'NON_RESOLUE') return '#ef4444';
  return '#94a3b8';
}

function StatutBadge({ statut }: { statut: string }) {
  let bg = '#e5e7eb', color = '#374151';
  if (statut === 'OUVERT')      { bg = '#dbeafe'; color = '#1d4ed8'; }
  if (statut === 'EN_COURS')    { bg = '#fef3c7'; color = '#b45309'; }
  if (statut === 'RESOLUE')     { bg = '#dcfce7'; color = '#166534'; }
  if (statut === 'NON_RESOLUE') { bg = '#fee2e2'; color = '#b91c1c'; }
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeTxt, { color }]} numberOfLines={1}>{statut}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* HEADER */
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 6 },
      default: {},
    }),
  },
  // largeur fixe pour garder le titre centré (et enlever le texte "Retour")
  backBtn: {
    width: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 'auto',
    marginRight: 'auto',
    letterSpacing: 0.2,
    marginTop: 4, // ↓ un peu en dessous
  },

  /* RECHERCHE */
  searchWrap: { paddingHorizontal: 12, marginTop: 12 },
  searchBar: {
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.20)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: { flex: 1, color: '#0f172a', fontSize: 14 },
  okBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    ...Platform.select({
      android: { elevation: 2 },
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
    }),
  },
  okBtnTxt: { color: '#fff', fontWeight: '800' },

  /* FILTRES */
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    alignItems: 'center',
  },
  pickerCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.20)',
  },
  applyBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    ...Platform.select({
      android: { elevation: 2 },
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
    }),
  },
  applyBtnTxt: { color: '#fff', fontWeight: '800' },

  /* CARTES */
  cardWrap: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  statusStripe: { width: 6 },
  card: {
    flex: 1,
    padding: 14,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
  },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  title: { fontSize: 16, fontWeight: '900', maxWidth: '72%' },
  desc: { marginTop: 6, lineHeight: 20 },

  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  chipTxt: { fontSize: 12, fontWeight: '700' },

  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 10 },
  badgeTxt: { fontWeight: '900', fontSize: 11 },

  empty: { alignItems: 'center', marginTop: 40 },
  emptyTxt: { color: '#64748b', marginTop: 8, fontWeight: '700' },
});
