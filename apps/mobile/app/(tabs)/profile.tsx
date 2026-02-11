import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../lib/AuthContext";
import { colors, spacing, fontSize } from "../../lib/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "U"}</Text>
      </View>
      <Text style={styles.name}>{user?.name || "User"}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {user?.companyName && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Company</Text>
          <Text style={styles.infoValue}>{user.companyName}</Text>
        </View>
      )}
      {user?.industry && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Industry</Text>
          <Text style={styles.infoValue}>{user.industry}</Text>
        </View>
      )}
      {user?.stage && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Stage</Text>
          <Text style={styles.infoValue}>{user.stage}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>CofounderAI v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], alignItems: "center", padding: spacing.lg, paddingTop: spacing.xxl },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brand[100], justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: fontSize["2xl"], fontWeight: "bold", color: colors.brand[700] },
  name: { fontSize: fontSize.xl, fontWeight: "bold", color: colors.gray[900], marginTop: spacing.md },
  email: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: spacing.xs },
  infoRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.white, borderRadius: 10, padding: spacing.md, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.gray[200] },
  infoLabel: { fontSize: fontSize.sm, color: colors.gray[500] },
  infoValue: { fontSize: fontSize.sm, fontWeight: "500", color: colors.gray[900] },
  logoutBtn: { width: "100%", borderWidth: 1, borderColor: colors.red[500], borderRadius: 10, padding: 14, alignItems: "center", marginTop: spacing.xl },
  logoutText: { color: colors.red[500], fontWeight: "600", fontSize: fontSize.base },
  version: { color: colors.gray[400], fontSize: fontSize.xs, marginTop: spacing.lg },
});
