// src/screens/HomeScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  useColorScheme,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';

function formatDateFR(d = new Date()) {
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}
function roleLabelFR(role?: string) {
  switch (role) {
    case 'ADMIN': return 'Administrateur';
    case 'TECHNICIEN': return 'Technicien';
    case 'DEMANDEUR': return 'Demandeur';
    default: return '';
  }
}
function serviceLabelFR(s?: string | null) {
  switch (s) {
    case 'IT': return 'Informatique';
    case 'EQUIPEMENT': return 'Équipement';
    case 'INFRASTRUCTURE': return 'Infrastructure';
    default: return '';
  }
}
function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.replace(/[_\-\.]/g, ' ').trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase();
}

// Press animé
function ScalePress({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
    onPress();
  };
  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
}

// === responsive util ===
function useResponsive() {
  const { width } = useWindowDimensions();
  const isXS = width < 360;
  const isMD = width >= 400 && width < 480;
  const isLG = width >= 480;

  const t = (size: number) => {
    const factor = isXS ? 0.92 : isLG ? 1.06 : isMD ? 1.01 : 1;
    return Math.round(size * factor);
  };

  const gap = 12;
  const horizontalPad = 16;
  const twoCols = width >= 380;
  const columns = twoCols ? 2 : 1;

  const usable = width - horizontalPad * 2 - gap * (columns - 1);
  const cardBase = twoCols
    ? Math.min(150, Math.floor(usable / 2))
    : Math.min(300, Math.floor(usable));
  const cardSize = Math.max(108, cardBase);

  return { width, t, gap, horizontalPad, columns, cardSize };
}

export default function HomeScreen() {
  const { user, logout } = useAuth() as any;
  const navigation = useNavigation<any>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const R = useResponsive();

  const C = useMemo(() => ({
    headerGrad: ['#a5b4fc', '#93c5fd'] as const,
    bgGrad: ['#c7d2fe', '#e0e7ff'] as const,
    violetBtn1: ['#8b5cf6', '#6366f1'] as const,
    violetBtn2: ['#7c3aed', '#4f46e5'] as const,
    blueBtn:   ['#38bdf8', '#0284c7'] as const,
    indigoBtn: ['#818cf8', '#4f46e5'] as const,
    adminAll:  ['#7c3aed', '#4f46e5'] as const,
    adminStat: ['#38bdf8', '#0284c7'] as const,
    textDark: '#0f172a',
    subDark: '#334155',
  }), [isDark]);

  const isDemandeur = user?.role === 'DEMANDEUR';
  const isTech = user?.role === 'TECHNICIEN';
  const isAdmin = user?.role === 'ADMIN';

  const dateFR = useMemo(() => formatDateFR(), []);
  const ligneRoleService = useMemo(() => {
    const role = roleLabelFR(user?.role);
    const service = serviceLabelFR(user?.service);
    return service ? `${role} • ${service}` : role;
  }, [user?.role, user?.service]);

  const initials = getInitials(user?.username);
  const displayUser = user?.username ?? 'Utilisateur';

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <LinearGradient colors={C.bgGrad} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: R.horizontalPad, paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== HEADER ===== */}
        <LinearGradient
          colors={C.headerGrad}
          style={[styles.header, { paddingHorizontal: R.horizontalPad, paddingTop: 16, paddingBottom: 14 }]}
        >
          <View style={[styles.headerTop, { alignItems: 'center' }]}>
            {/* Avatar */}
            <ScalePress onPress={() => {}}>
              {user?.photoUrl ? (
                <Image source={{ uri: user.photoUrl }} style={[styles.avatarImg, { width: 52, height: 52, borderRadius: 26 }]} />
              ) : (
                <LinearGradient
                  colors={['#6d28d9', '#4f46e5']}
                  start={{x:0,y:0}} end={{x:1,y:1}}
                  style={[styles.avatarGrad, { width: 52, height: 52, borderRadius: 26 }]}
                >
                  <Text style={[styles.avatarTxt, { fontSize: R.t(18) }]}>{initials}</Text>
                </LinearGradient>
              )}
            </ScalePress>

            {/* Infos user */}
            <View style={[styles.infoRow, { gap: 10 }]}>
              <View style={styles.chip}>
                <Ionicons name="business-outline" size={16} color="#2563eb" style={{ marginRight: 6 }} />
                <Text style={[styles.chipTxt, { color: C.textDark, fontSize: R.t(12) }]}>Aéroport OUJDA ANGAD</Text>
              </View>

              <View style={styles.chip}>
                <Ionicons name="id-card-outline" size={16} color="#16a34a" style={{ marginRight: 6 }} />
                <Text style={[styles.chipTxt, { color: C.subDark, fontSize: R.t(12) }]}>{ligneRoleService}</Text>
              </View>

              <View style={styles.chip}>
                <Ionicons name="calendar-outline" size={16} color="#f59e0b" style={{ marginRight: 6 }} />
                <Text style={[styles.chipTxt, { color: C.subDark, fontSize: R.t(12) }]}>{dateFR}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { padding: 8, borderRadius: 18 }]}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ===== DEMANDEUR ===== */}
        {isDemandeur && (
          <View style={[styles.stackCol, { gap: R.gap }]}>
            <View style={styles.rowCenter}>
              <Text style={[styles.welcomeTitle, { fontSize: R.t(20) }]}>
                Bienvenue {displayUser}
              </Text>
              <Ionicons name="hand-right-outline" size={24} color="#7c3aed" style={{ marginLeft: 8 }} />
            </View>

            <ScalePress onPress={() => navigation.navigate('CreateReclamation')}>
              <LinearGradient colors={C.violetBtn1} style={[styles.squareBtn, styles.stackBtn, { width: R.cardSize, height: R.cardSize }]}>
                <Ionicons name="add-circle-outline" size={28} color="#fff" />
                <Text style={[styles.squareTxt, { fontSize: R.t(14), lineHeight: R.t(18) }]}>Nouvelle</Text>
              </LinearGradient>
            </ScalePress>

            <ScalePress onPress={() => navigation.navigate('MyReclamations', { mode: 'my' })}>
              <LinearGradient colors={C.violetBtn2} style={[styles.squareBtn, styles.stackBtn, { width: R.cardSize, height: R.cardSize }]}>
                <Ionicons name="list-outline" size={28} color="#fff" />
                <Text style={[styles.squareTxt, { fontSize: R.t(14), lineHeight: R.t(18) }]}>Mes réclamations</Text>
              </LinearGradient>
            </ScalePress>
          </View>
        )}

        {/* ===== TECHNICIEN ===== */}
        {isTech && (
          <View style={[styles.stackCol, { gap: R.gap }]}>
            <View style={styles.rowCenter}>
              <Text style={[styles.welcomeTitle, { fontSize: R.t(20) }]}>
                Bienvenue {displayUser}
              </Text>
              <Ionicons name="hand-right-outline" size={24} color="#7c3aed" style={{ marginLeft: 8 }} />
            </View>

            <View style={{ height: 6 }} />

            <ScalePress onPress={() => navigation.navigate('ServiceReclamations', { mode: 'service' })}>
              <LinearGradient
                colors={C.blueBtn}
                style={[styles.squareBtn, styles.stackBtn, { width: R.cardSize, height: R.cardSize, marginTop: 4 }]}
              >
                <Ionicons name="construct-outline" size={28} color="#fff" />
                <Text style={[styles.squareTxt, { fontSize: R.t(14), lineHeight: R.t(18) }]}>Pannes du service</Text>
              </LinearGradient>
            </ScalePress>

            <View style={{ height: 8 }} />

            <ScalePress onPress={() => navigation.navigate('TechnicianReplies', { mode: 'replied' })}>
              <LinearGradient
                colors={C.indigoBtn}
                style={[styles.squareBtn, styles.stackBtn, { width: R.cardSize, height: R.cardSize }]}
              >
                <Ionicons name="chatbubbles-outline" size={28} color="#fff" />
                <Text style={[styles.squareTxt, { fontSize: R.t(14), lineHeight: R.t(18) }]}>Mes réponses</Text>
              </LinearGradient>
            </ScalePress>
          </View>
        )}

        {/* ===== ADMIN ===== */}
        {isAdmin && (
          <View style={[styles.stackCol, { gap: R.gap }]}>
            <View style={styles.rowCenter}>
              <Text style={[styles.welcomeTitle, { fontSize: R.t(20) }]}>
                Bienvenue {displayUser}
              </Text>
              <Ionicons name="hand-right-outline" size={24} color="#7c3aed" style={{ marginLeft: 8 }} />
            </View>

            <View style={{ height: 6 }} />

            <ScalePress onPress={() => navigation.navigate('AdminReclamations', { mode: 'all' })}>
              <LinearGradient colors={C.adminAll} style={[styles.squareBtn, styles.stackBtn, { width: R.cardSize, height: R.cardSize }]}>
                <Ionicons name="folder-open-outline" size={28} color="#fff" />
                <Text style={[styles.squareTxt, { fontSize: R.t(14), lineHeight: R.t(18) }]}>Toutes les réclamations</Text>
              </LinearGradient>
            </ScalePress>

            <View style={{ height: 8 }} />

            <ScalePress onPress={() => navigation.navigate('AdminStats')}>
              <LinearGradient colors={C.adminStat} style={[styles.squareBtn, styles.stackBtn, { width: R.cardSize, height: R.cardSize }]}>
                <Ionicons name="stats-chart-outline" size={28} color="#fff" />
                <Text style={[styles.squareTxt, { fontSize: R.t(14), lineHeight: R.t(18) }]}>Statistiques</Text>
              </LinearGradient>
            </ScalePress>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingTop: 12 },
  header: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 10,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between' },

  // évite TS(2339)
  avatarImg: {},
  chipTxt: {},

  avatarGrad: { alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontWeight: '900' },
  logoutBtn: {
    marginLeft: 8,
    backgroundColor: '#ef4444',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  infoRow: {
    flex: 1, marginHorizontal: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
  },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, marginRight: 6, marginTop: 8,
  },

  // pile verticale (Demandeur + Technicien + Admin)
  stackCol: { marginTop: 20, alignItems: 'center', justifyContent: 'center' },
  rowCenter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
  },
  welcomeTitle: { fontWeight: '900', color: '#4F46E5', textAlign: 'center', letterSpacing: 0.3 },

  // boutons
  squareBtn: {
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  stackBtn: { alignSelf: 'center' },
  squareTxt: { marginTop: 8, color: '#fff', fontWeight: '800', textAlign: 'center', width: '85%' },

  // bloc central (plus utilisé ici, conservé si besoin ailleurs)
  centerCol: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  greet: { fontWeight: '900', color: '#4F46E5' },
});
