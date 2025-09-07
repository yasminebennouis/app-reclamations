// src/screens/reclamation/ReclamationListScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import {
  getMyReclamations,
  getServiceReclamations,
  getAllReclamations,
  getTechnicianReplies,
} from "@/services/api";

type Mode = "my" | "service" | "all" | "replied";
type ListRoute = RouteProp<{ ReclamationList: { mode?: Mode } }, "ReclamationList">;

function formatFR(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReclamationListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ListRoute>();
  const { user } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mode: Mode = route.params?.mode ?? "my";

  const headerTitle = useMemo(
    () =>
      mode === "my"
        ? "Mes réclamations"
        : mode === "service"
        ? "Pannes de mon service"
        : mode === "replied"
        ? "Mes réponses"
        : "Toutes les réclamations",
    [mode]
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        let rows: any[] = [];
        if (mode === "my") {
          rows = await getMyReclamations(user!.username);
        } else if (mode === "service") {
          rows = await getServiceReclamations(user!.username);
        } else if (mode === "replied") {
          rows = await getTechnicianReplies(user!.username);
        } else {
          rows = await getAllReclamations();
        }
        setItems(rows);
      } catch (e) {
        console.error("Erreur chargement", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, user?.username]);

  const goDetail = (id: number) => navigation.navigate("ReclamationDetail", { id, mode });

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardWrap}
      onPress={() => goDetail(item.id)}
      accessibilityRole="button"
    >
      <View style={styles.card}>
        {/* Titre + Statut */}
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="document-text-outline" size={18} color="#4F46E5" style={{ marginRight: 8 }} />
            <Text numberOfLines={1} style={styles.cardTitle}>
              {item.titre || "Sans titre"}
            </Text>
          </View>
          <StatutBadge statut={item.statut} />
        </View>

        {/* Description (2 lignes) */}
        {!!item.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Méta */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="layers-outline" size={14} color="#2563eb" style={{ marginRight: 4 }} />
            <Text style={styles.metaTxt}>{item.service}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={14} color="#0ea5e9" style={{ marginRight: 4 }} />
            <Text style={styles.metaTxt}>Créé le {formatFR(item.dateCreation)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={["#eef2ff", "#eaf1ff"]} style={styles.loader}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 8, color: "#475569" }}>Chargement…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#eef2ff", "#eaf1ff"]} style={styles.container}>
      {/* Header gradient : flèche seule + titre centré plus bas */}
      <LinearGradient
        colors={["#6c5ce7", "#4f46e5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </LinearGradient>

      {/* Liste */}
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="file-tray-outline" size={40} color="#94a3b8" />
          <Text style={{ color: "#64748b", marginTop: 8, fontWeight: "700" }}>Aucune réclamation</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

/** Badge statut avec couleurs modernes */
function StatutBadge({ statut }: { statut: string }) {
  let bg = "#e5e7eb";
  let color = "#374151";
  if (statut === "OUVERT") {
    bg = "#dbeafe";
    color = "#1d4ed8";
  }
  if (statut === "EN_COURS") {
    bg = "#fef3c7";
    color = "#b45309";
  }
  if (statut === "RESOLUE") {
    bg = "#dcfce7";
    color = "#166534";
  }
  if (statut === "NON_RESOLUE") {
    bg = "#fee2e2";
    color = "#b91c1c";
  }
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]} numberOfLines={1}>
        {statut}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },

  /* HEADER */
  header: {
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: "center", // centre le contenu
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 6 },
      default: {},
    }),
  },
  // flèche seule, positionnée en absolu à gauche
  backBtn: {
    position: "absolute",
    left: 16,
    top: 16,
    padding: 4,
  },
  // titre centré et un peu plus bas
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
    textAlign: "center",
    marginTop: 20, // descend le titre sous la flèche
  },

  /* CARDS (glass) */
  cardWrap: {
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 3 },
      default: {},
    }),
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.20)",
  },

  cardHeader: { flexDirection: "row", alignItems: "center" },

  cardTitle: { fontSize: 16, fontWeight: "900", color: "#4F46E5", flex: 1 },
  cardDesc: { marginTop: 6, color: "#475569", lineHeight: 20 },

  metaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10,
    alignItems: "center",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaTxt: { color: "#0f172a", fontSize: 12, fontWeight: "700" },

  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 10 },
  badgeText: { fontWeight: "900", fontSize: 11 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40 },
});
