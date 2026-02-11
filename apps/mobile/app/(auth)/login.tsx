import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../lib/AuthContext";
import { colors, spacing, fontSize } from "../../lib/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(tabs)/dashboard");
    } catch (e: any) {
      Alert.alert("Login Failed", e.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🧠</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to CofounderAI</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@startup.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand[50] },
  scroll: { flexGrow: 1, justifyContent: "center", padding: spacing.lg },
  logo: { fontSize: 48, textAlign: "center" },
  title: { fontSize: fontSize["3xl"], fontWeight: "bold", textAlign: "center", marginTop: spacing.md, color: colors.gray[900] },
  subtitle: { fontSize: fontSize.base, textAlign: "center", color: colors.gray[500], marginTop: spacing.xs },
  form: { marginTop: spacing.xl, backgroundColor: colors.white, borderRadius: 16, padding: spacing.lg, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  label: { fontSize: fontSize.sm, fontWeight: "500", color: colors.gray[700], marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, padding: 14, fontSize: fontSize.base },
  button: { backgroundColor: colors.brand[600], borderRadius: 10, padding: 16, marginTop: spacing.lg, alignItems: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontWeight: "600", fontSize: fontSize.base },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
  footerText: { color: colors.gray[500], fontSize: fontSize.sm },
  link: { color: colors.brand[600], fontWeight: "600", fontSize: fontSize.sm },
});
