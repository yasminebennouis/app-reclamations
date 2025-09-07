// src/screens/Admin/StatsScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAdminStats } from '@/services/api';
import { ServiceType, StatutReclamation } from '@/services/types';

type Stats = {
  parService: Record<ServiceType, number>;
  parStatut: Record<StatutReclamation, number>;
  dureeMoyenneResolutionMinutes: number | null;
};

export default function StatsScreen() {
  const nav = useNavigation<any>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const C = useMemo(() => ({
    bg: isDark ? '#0F172A' : '#F3F4F6',
    card: isDark ? '#111827' : '#FFFFFF',
    text: isDark ? '#E5E7EB' : '#111827',
    sub: isDark ? '#9CA3AF' : '#6b7280',
    primary: isDark ? '#6366F1' : '#4F46E5',
    chip: isDark ? '#1F2937' : '#F1F5FE',
    barBg: isDark ? '#1F2937' : '#E5E7EB',
    headerText: '#fff',
    shadow: { shadowColor: '#000', shadowOpacity: isDark ? 0.25 : 0.08, shadowRadius: 8, elevation: 3 }
  }), [isDark]);

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totals = useMemo(() => {
    if (!stats) return { service: 0, statut: 0 };
    return {
      service: Object.values(stats.parService || {}).reduce((a, b) => a + b, 0),
      statut : Object.values(stats.parStatut  || {}).reduce((a, b) => a + b, 0),
    };
  }, [stats]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.primary} />
        <Text style={{ marginTop:8, color: C.sub }}>Chargement…</Text>
      </View>
    );
  }
  if (!stats) {
    return <View style={[styles.center, { backgroundColor: C.bg }]}><Text style={{ color: C.sub }}>Pas de données</Text></View>;
  }

  const maxService = Math.max(1, ...Object.values(stats.parService));
  const maxStatut  = Math.max(1, ...Object.values(stats.parStatut));

  return (
    <ScrollView style={{ flex:1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* HEADER : flèche gauche, titre centré et un peu plus bas */}
      <View style={[styles.header, { backgroundColor: C.primary }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => nav.navigate('Home')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={C.headerText} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: C.headerText }]}>Statistiques</Text>

        {/* espace pour équilibrer */}
        <View style={{ width: 40 }} />
      </View>

      {/* KPI cards */}
      <View style={[styles.card, { backgroundColor: C.card }, C.shadow]}>
        <Text style={[styles.cardTitle, { color: '#7C3AED' }]}>Indicateur global</Text>
        <View style={styles.kpiRow}>
          <KpiGradient
            icon="documents-outline"
            label="Total réclamations"
            value={totals.service}
            gradient={['#7C3AED', '#4F46E5']}
          />
          <KpiGradient
            icon="time-outline"
            label="Durée moyenne (min)"
            value={stats.dureeMoyenneResolutionMinutes ?? 0}
            gradient={['#06B6D4', '#0EA5E9']}
          />
        </View>
      </View>

      {/* Par service */}
      <View style={[styles.card, { backgroundColor: C.card }, C.shadow]}>
        <Text style={[styles.cardTitle, { color: '#06B6D4' }]}>Par service</Text>
        {Object.entries(stats.parService).map(([key, val]) => (
          <Bar
            key={key}
            label={key}
            value={val}
            max={maxService}
            barBg={C.barBg}
            primary={C.primary}
            colorText={C.text}
            colorSub={C.sub}
          />
        ))}
      </View>

      {/* Par statut */}
      <View style={[styles.card, { backgroundColor: C.card }, C.shadow]}>
        <Text style={[styles.cardTitle, { color: '#F59E0B' }]}>Par statut</Text>
        {Object.entries(stats.parStatut).map(([key, val]) => (
          <Bar
            key={key}
            label={prettyStatus(key)}
            value={val}
            max={maxStatut}
            barBg={C.barBg}
            primary={C.primary}
            colorText={C.text}
            colorSub={C.sub}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function prettyStatus(k: string) {
  if (k === 'OUVERT') return 'Ouvert';
  if (k === 'EN_COURS') return 'En cours';
  if (k === 'RESOLUE') return 'Résolue';
  if (k === 'NON_RESOLUE') return 'Non résolue';
  return k;
}

function KpiGradient({
  label, value, gradient, icon,
}: {
  label: string; value: number; gradient: [string, string]; icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.kpi}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.kpiChip}>
        <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.kpiValueColor}>{value}</Text>
      </LinearGradient>
      <Text style={styles.kpiLabelMuted}>{label}</Text>
    </View>
  );
}

function Bar({
  label, value, max, barBg, primary, colorText, colorSub
}: {
  label: string; value: number; max: number; barBg: string; primary: string; colorText: string; colorSub: string;
}) {
  const pct = Math.round((value / (max || 1)) * 100);
  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontWeight:'700', color: colorText }}>{label}</Text>
        <Text style={{ color: colorSub }}>{value}</Text>
      </View>
      <View style={[styles.barBg, { backgroundColor: barBg }]}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex:1, alignItems:'center', justifyContent:'center' },

  header: {
    paddingVertical:14,
    paddingHorizontal:16,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    borderBottomLeftRadius:18,
    borderBottomRightRadius:18,
  },
  backBtn: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  // ↓ descendu un peu
  headerTitle: { fontWeight:'800', fontSize:18, textAlign:'center', flex:1, marginTop: 4 },

  card: { borderRadius:14, padding:16, marginHorizontal:12, marginTop:12 },
  // les couleurs des titres sont passées inline pour chaque section
  cardTitle: { fontSize:16, fontWeight:'800' },

  /* KPIs */
  kpiRow: { flexDirection:'row', gap:12, marginTop:10 },
  kpi: { flex:1, alignItems:'center' },
  kpiChip: {
    minWidth: 140, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  kpiValueColor: { fontSize: 20, fontWeight: '900', color: '#fff' },
  kpiLabelMuted: { marginTop: 6, color: '#6b7280', fontWeight: '700' },

  /* Bars */
  barBg: { height:10, borderRadius:999, marginTop:8, overflow:'hidden' },
  barFill: { height:10, borderRadius:999 },
});
