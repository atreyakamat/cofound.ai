import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "./theme";

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.msg}>{this.state.error?.message}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg },
  emoji: { fontSize: 48 },
  title: { fontSize: fontSize.xl, fontWeight: "bold", marginTop: spacing.md, color: colors.gray[900] },
  msg: { fontSize: fontSize.sm, color: colors.gray[500], textAlign: "center", marginTop: spacing.sm },
  btn: { marginTop: spacing.lg, backgroundColor: colors.brand[600], borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: colors.white, fontWeight: "600" },
});
