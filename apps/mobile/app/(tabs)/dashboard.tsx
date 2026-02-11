import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { api } from "../../lib/api";
import { colors, spacing, fontSize } from "../../lib/theme";
import type { DashboardData } from "@cofound/shared";

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const d = await api.getDashboard();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand[600]} /></View>;
  }

  const stats = [
    { label: "Total", value: data?.totalDecisions || 0, icon: "📝" },
    { label: "In Progress", value: data?.inProgressCount || 0, icon: "⏳" },
    { label: "Decided", value: data?.decidedCount || 0, icon: "✅" },
    { label: "Tracking", value: data?.trackingCount || 0, icon: "📊" },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand[600]} />}
    >
      {/* Stats */}
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* New Decision Button */}
      <TouchableOpacity style={styles.newButton} onPress={() => router.push("/(tabs)/new-decision")}>
        <Text style={styles.newButtonText}>💡 New Decision</Text>
      </TouchableOpacity>

      {/* Recent */}
      <Text style={styles.sectionTitle}>Recent Decisions</Text>
      {data?.recentDecisions && data.recentDecisions.length > 0 ? (
        data.recentDecisions.map((d: any) => (
          <TouchableOpacity
            key={d.id}
            style={styles.decisionCard}
            onPress={() => router.push(`/decision/${d.id}`)}
          >
            <Text style={styles.decisionTitle} numberOfLines={1}>{d.title}</Text>
            <View style={styles.decisionMeta}>
              <Text style={styles.decisionDate}>
                {new Date(d.createdAt).toLocaleDateString()}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(d.status) }]}>
                <Text style={styles.statusText}>{d.status.replace("_", " ")}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No decisions yet. Start your first one!</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    in_progress: colors.yellow[100],
    decided: colors.green[100],
    tracking: colors.blue[100],
    completed: colors.gray[100],
  };
  return map[status] || colors.gray[100];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: spacing.md },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statCard: { width: "48%", backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.gray[200] },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: fontSize["2xl"], fontWeight: "bold", color: colors.gray[900], marginTop: spacing.xs },
  statLabel: { fontSize: fontSize.xs, color: colors.gray[500] },
  newButton: { backgroundColor: colors.brand[600], borderRadius: 12, padding: spacing.md, marginTop: spacing.md, alignItems: "center" },
  newButtonText: { color: colors.white, fontWeight: "600", fontSize: fontSize.base },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "600", color: colors.gray[900], marginTop: spacing.lg, marginBottom: spacing.sm },
  decisionCard: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.gray[200] },
  decisionTitle: { fontSize: fontSize.sm, fontWeight: "600", color: colors.gray[900] },
  decisionMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.xs },
  decisionDate: { fontSize: fontSize.xs, color: colors.gray[500] },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: fontSize.xs, fontWeight: "500" },
  emptyState: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.xl, alignItems: "center", borderWidth: 1, borderColor: colors.gray[200] },
  emptyText: { color: colors.gray[500], fontSize: fontSize.sm },
});
