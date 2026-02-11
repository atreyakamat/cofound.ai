import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator,
} from "react-native";
import { api } from "../../lib/api";
import { METRIC_OPTIONS } from "@cofound/shared";
import { colors, spacing, fontSize } from "../../lib/theme";

export default function MetricsScreen() {
  const [data, setData] = useState<any>({ metrics: [], grouped: {} });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [metricName, setMetricName] = useState("mrr");
  const [metricValue, setMetricValue] = useState("");

  async function load() {
    try {
      const d = await api.getMetrics();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!metricValue) { Alert.alert("Error", "Enter a value"); return; }
    const opt = METRIC_OPTIONS.find((m) => m.name === metricName);
    try {
      await api.addMetric({ name: metricName, value: parseFloat(metricValue), unit: opt?.unit });
      setShowModal(false);
      setMetricValue("");
      load();
      Alert.alert("Success", "Metric added!");
    } catch {
      Alert.alert("Error", "Failed to add metric");
    }
  }

  function getLatest(name: string) {
    const arr = data.grouped[name];
    return arr && arr.length > 0 ? arr[0] : null;
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand[600]} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
        <Text style={styles.addBtnText}>+ Add Metric</Text>
      </TouchableOpacity>

      {METRIC_OPTIONS.map((opt) => {
        const latest = getLatest(opt.name);
        return (
          <View key={opt.name} style={styles.card}>
            <Text style={styles.cardLabel}>{opt.label}</Text>
            {latest ? (
              <Text style={styles.cardValue}>
                {opt.unit === "$" ? "$" : ""}{latest.value.toLocaleString()}{opt.unit === "%" ? "%" : ""}{opt.unit === "months" ? " mo" : ""}
              </Text>
            ) : (
              <Text style={styles.noData}>No data</Text>
            )}
            {data.grouped[opt.name] && data.grouped[opt.name].length > 1 && (
              <View style={styles.miniChart}>
                {data.grouped[opt.name].slice(0, 7).reverse().map((m: any, i: number) => {
                  const max = Math.max(...data.grouped[opt.name].map((x: any) => x.value));
                  const h = max > 0 ? (m.value / max) * 40 : 0;
                  return <View key={i} style={[styles.bar, { height: Math.max(h, 2) }]} />;
                })}
              </View>
            )}
          </View>
        );
      })}

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Metric</Text>
            <Text style={styles.label}>Metric</Text>
            <View style={styles.pickerWrap}>
              {METRIC_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.name}
                  style={[styles.pickerBtn, metricName === opt.name && styles.pickerActive]}
                  onPress={() => setMetricName(opt.name)}
                >
                  <Text style={[styles.pickerText, metricName === opt.name && { color: colors.brand[600] }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Value</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5000"
              value={metricValue}
              onChangeText={setMetricValue}
              keyboardType="numeric"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: spacing.md },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  addBtn: { backgroundColor: colors.brand[600], borderRadius: 12, padding: 14, alignItems: "center", marginBottom: spacing.md },
  addBtnText: { color: colors.white, fontWeight: "600", fontSize: fontSize.base },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.gray[200] },
  cardLabel: { fontSize: fontSize.sm, color: colors.gray[500] },
  cardValue: { fontSize: fontSize["2xl"], fontWeight: "bold", color: colors.gray[900], marginTop: spacing.xs },
  noData: { fontSize: fontSize.sm, color: colors.gray[400], marginTop: spacing.xs },
  miniChart: { flexDirection: "row", alignItems: "flex-end", gap: 4, marginTop: spacing.sm, height: 40 },
  bar: { flex: 1, backgroundColor: colors.brand[500], borderRadius: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg },
  modalTitle: { fontSize: fontSize.lg, fontWeight: "600", marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: "500", color: colors.gray[700], marginTop: spacing.md, marginBottom: spacing.xs },
  input: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, padding: 14, fontSize: fontSize.base },
  pickerWrap: { gap: spacing.xs },
  pickerBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.gray[50] },
  pickerActive: { backgroundColor: colors.brand[50], borderWidth: 1, borderColor: colors.brand[600] },
  pickerText: { fontSize: fontSize.sm, color: colors.gray[700] },
  modalBtns: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, padding: 14, alignItems: "center" },
  cancelBtnText: { color: colors.gray[700], fontWeight: "500" },
  saveBtn: { flex: 1, backgroundColor: colors.brand[600], borderRadius: 10, padding: 14, alignItems: "center" },
  saveBtnText: { color: colors.white, fontWeight: "600" },
});
