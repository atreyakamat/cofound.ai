import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { api } from "../../lib/api";
import { CATEGORIES, DECISION_TEMPLATES } from "@cofound/shared";
import { colors, spacing, fontSize } from "../../lib/theme";

export default function NewDecisionScreen() {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [category, setCategory] = useState("other");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) {
      Alert.alert("Error", "Please describe your decision");
      return;
    }
    setLoading(true);
    try {
      const decision = await api.createDecision({ title, context, category });
      setTitle("");
      setContext("");
      router.push(`/decision/${decision.id}`);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create decision");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>What decision are you facing?</Text>

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.categoryBtn, category === c.value && styles.categoryActive]}
              onPress={() => setCategory(c.value)}
            >
              <Text style={styles.categoryIcon}>{c.icon}</Text>
              <Text style={styles.categoryLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <Text style={styles.label}>Decision</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Should I hire full-time or use contractors?"
          value={title}
          onChangeText={setTitle}
          multiline
        />

        {/* Context */}
        <Text style={styles.label}>Context (optional)</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="Background, constraints, key factors..."
          value={context}
          onChangeText={setContext}
          multiline
        />

        <TouchableOpacity
          style={[styles.createBtn, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.createBtnText}>
            {loading ? "Starting..." : "Start Decision Session →"}
          </Text>
        </TouchableOpacity>

        {/* Templates */}
        <Text style={styles.templateHeading}>Or try a common decision:</Text>
        {DECISION_TEMPLATES.map((t, i) => (
          <TouchableOpacity
            key={i}
            style={styles.templateBtn}
            onPress={() => { setTitle(t.title); setCategory(t.category); }}
          >
            <Text style={styles.templateText}>{t.title}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: spacing.md },
  heading: { fontSize: fontSize.xl, fontWeight: "bold", color: colors.gray[900], marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: "500", color: colors.gray[700], marginTop: spacing.md, marginBottom: spacing.xs },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, padding: 14, fontSize: fontSize.base },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  categoryBtn: { width: "31%", backgroundColor: colors.white, borderRadius: 10, padding: spacing.sm, alignItems: "center", borderWidth: 1, borderColor: colors.gray[200] },
  categoryActive: { borderColor: colors.brand[600], borderWidth: 2, backgroundColor: colors.brand[50] },
  categoryIcon: { fontSize: 20 },
  categoryLabel: { fontSize: fontSize.xs, marginTop: 2, color: colors.gray[700] },
  createBtn: { backgroundColor: colors.brand[600], borderRadius: 12, padding: 16, marginTop: spacing.lg, alignItems: "center" },
  createBtnText: { color: colors.white, fontWeight: "600", fontSize: fontSize.base },
  templateHeading: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: spacing.xl, marginBottom: spacing.sm },
  templateBtn: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, padding: 14, marginBottom: spacing.sm },
  templateText: { fontSize: fontSize.sm, color: colors.gray[700] },
});
