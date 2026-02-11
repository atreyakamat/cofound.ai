import { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import Markdown from "react-native-markdown-display";
import { api } from "../../lib/api";
import { useSpeech } from "../../lib/useSpeech";
import { colors, spacing, fontSize } from "../../lib/theme";
import type { Decision } from "@cofound/shared";

export default function DecisionChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const {
    listening,
    transcript,
    interimTranscript,
    toggleListening,
    supported: speechSupported,
  } = useSpeech();

  // Append speech transcript to input
  useEffect(() => {
    if (transcript) {
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    }
  }, [transcript]);

  useEffect(() => {
    if (!id) return;
    api.getDecision(id).then(setDecision).catch(() => {
      Alert.alert("Error", "Decision not found");
      router.back();
    });
  }, [id]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [decision?.messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending || !id) return;
    const msg = input;
    setInput("");
    setSending(true);

    // Optimistic
    setDecision((prev) =>
      prev ? { ...prev, messages: [...prev.messages, { id: "temp", role: "user", content: msg, createdAt: new Date().toISOString() }] } : null
    );

    try {
      const data = await api.sendMessage(id, msg);
      setDecision((prev) => {
        if (!prev) return null;
        const msgs = prev.messages.filter((m) => m.id !== "temp");
        return {
          ...prev,
          messages: [
            ...msgs,
            { id: Date.now().toString(), role: "user" as const, content: msg, createdAt: new Date().toISOString() },
            { id: data.aiMessage.id, role: "assistant" as const, content: data.aiMessage.content, createdAt: new Date().toISOString() },
          ],
        };
      });
    } catch {
      Alert.alert("Error", "Failed to send message");
      setDecision((prev) =>
        prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== "temp") } : null
      );
    } finally {
      setSending(false);
    }
  }, [input, sending, id]);

  async function handleAnalyze() {
    if (!id) return;
    setAnalyzing(true);
    try {
      const updated = await api.requestAnalysis(id);
      setDecision(updated);
      Alert.alert("Success", "Analysis generated!");
    } catch {
      Alert.alert("Error", "Failed to generate analysis");
    } finally {
      setAnalyzing(false);
    }
  }

  if (!decision) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand[600]} /></View>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: decision.title,
          headerTitleStyle: { fontSize: fontSize.sm, fontWeight: "600" },
          headerBackTitle: "Back",
          headerRight: () =>
            decision.status === "in_progress" ? (
              <TouchableOpacity onPress={handleAnalyze} disabled={analyzing}>
                <Text style={{ color: colors.brand[600], fontWeight: "600", fontSize: fontSize.sm }}>
                  {analyzing ? "..." : "📊 Analyze"}
                </Text>
              </TouchableOpacity>
            ) : null,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.gray[50] }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={{ padding: spacing.md }}>
          {decision.messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.bubble, msg.role === "user" ? styles.userBubble : styles.aiBubble]}
            >
              {msg.role === "assistant" ? (
                <Markdown style={markdownStyles}>{msg.content}</Markdown>
              ) : (
                <Text style={styles.userText}>{msg.content}</Text>
              )}
            </View>
          ))}
          {sending && (
            <View style={[styles.bubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color={colors.gray[400]} />
            </View>
          )}
        </ScrollView>

        {/* Input */}
        {decision.status !== "completed" && (
          <View style={styles.inputBar}>
            {interimTranscript ? (
              <Text style={styles.interimText}>🎤 {interimTranscript}</Text>
            ) : null}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type or speak..."
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={2000}
              />
              {speechSupported && (
                <TouchableOpacity
                  style={[styles.micBtn, listening && styles.micBtnActive]}
                  onPress={toggleListening}
                >
                  <Text style={{ fontSize: 20 }}>🎤</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]}
                onPress={sendMessage}
                disabled={!input.trim() || sending}
              >
                <Text style={styles.sendBtnText}>↑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Outcome */}
        {decision.outcome && (
          <View style={styles.outcomeBar}>
            <Text style={styles.outcomeText}>📋 Outcome: {decision.outcome}</Text>
            <Text style={styles.outcomeRating}>{"⭐".repeat(decision.outcomeRating || 0)}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const markdownStyles = {
  body: { color: colors.gray[900], fontSize: fontSize.sm, lineHeight: 20 },
  heading2: { fontSize: fontSize.lg, fontWeight: "700" as const, marginTop: 8, marginBottom: 4 },
  strong: { fontWeight: "700" as const },
  listItem: { marginBottom: 2 },
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  messages: { flex: 1 },
  bubble: { maxWidth: "85%", borderRadius: 16, padding: 12, marginBottom: spacing.sm },
  userBubble: { alignSelf: "flex-end", backgroundColor: colors.brand[600] },
  aiBubble: { alignSelf: "flex-start", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  userText: { color: colors.white, fontSize: fontSize.sm },
  inputBar: { borderTopWidth: 1, borderTopColor: colors.gray[200], backgroundColor: colors.white, padding: spacing.sm },
  interimText: { fontSize: fontSize.xs, color: colors.gray[400], fontStyle: "italic", paddingHorizontal: spacing.xs, paddingBottom: spacing.xs },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.xs },
  textInput: { flex: 1, backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: fontSize.base, maxHeight: 100 },
  micBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray[100], justifyContent: "center", alignItems: "center" },
  micBtnActive: { backgroundColor: colors.red[100] },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand[600], justifyContent: "center", alignItems: "center" },
  sendBtnText: { color: colors.white, fontSize: 18, fontWeight: "bold" },
  outcomeBar: { borderTopWidth: 1, borderTopColor: colors.gray[200], backgroundColor: colors.green[50], padding: spacing.md },
  outcomeText: { fontSize: fontSize.sm, fontWeight: "500", color: colors.green[800] },
  outcomeRating: { fontSize: fontSize.xs, color: colors.green[600], marginTop: 2 },
});
