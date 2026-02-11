import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api } from "../../lib/api";
import { CATEGORY_ICONS, STATUS_COLORS } from "@cofound/shared";
import { colors, spacing, fontSize } from "../../lib/theme";
import type { Decision } from "@cofound/shared";

export default function JournalScreen() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getDecisions();
      setDecisions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function renderItem({ item }: { item: Decision }) {
    const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.in_progress;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/decision/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item.category] || "🔮"}</Text>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {item._count ? ` • ${item._count.messages} msgs` : ""}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {item.status.replace("_", " ")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand[600]} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={decisions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand[600]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>📓</Text>
            <Text style={styles.emptyText}>No decisions yet</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/(tabs)/new-decision")}>
              <Text style={styles.emptyBtnText}>Start Your First Decision</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.gray[200] },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  categoryIcon: { fontSize: 18 },
  cardTitle: { flex: 1, fontSize: fontSize.sm, fontWeight: "600", color: colors.gray[900] },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
  cardDate: { fontSize: fontSize.xs, color: colors.gray[500] },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: fontSize.xs, fontWeight: "500" },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyText: { color: colors.gray[500], marginTop: spacing.md, marginBottom: spacing.md },
  emptyBtn: { backgroundColor: colors.brand[600], borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  emptyBtnText: { color: colors.white, fontWeight: "600" },
});
