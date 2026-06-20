import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { AuthSessionReadBoundaryResult } from "../lib/authSessionReadBoundary";
import { useAuthSessionBoundary } from "../state/AuthSessionProvider";

type ProbeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AuthSessionReadBoundaryResult }
  | { status: "failed" };

type SafeProbeRow = {
  label: string;
  value: string;
};

function formatBoolean(value: boolean): string {
  return value ? "true" : "false";
}

function getSafeRows(result: AuthSessionReadBoundaryResult): SafeProbeRow[] {
  return [
    { label: "Probe status", value: result.status },
    { label: "Client available", value: formatBoolean(result.clientAvailable) },
    { label: "Session present", value: formatBoolean(result.sessionPresent) },
    {
      label: "Server confirmed",
      value: formatBoolean(result.isServerConfirmed),
    },
    {
      label: "Backend authority",
      value: formatBoolean(result.isBackendAuthority),
    },
    {
      label: "Listener enabled",
      value: formatBoolean(result.isListenerEnabled),
    },
    {
      label: "Mutation enabled",
      value: formatBoolean(result.isMutationEnabled),
    },
  ];
}

export function AuthSessionProbeCard() {
  const { readSessionBoundary } = useAuthSessionBoundary();
  const [probeState, setProbeState] = useState<ProbeState>({ status: "idle" });

  async function handleProbePress() {
    setProbeState({ status: "loading" });

    try {
      const result = await readSessionBoundary();
      setProbeState({ status: "success", result });
    } catch {
      setProbeState({ status: "failed" });
    }
  }

  const isLoading = probeState.status === "loading";
  const safeRows =
    probeState.status === "success" ? getSafeRows(probeState.result) : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Safe session check</Text>
        <Text style={styles.description}>
          Manual diagnostic probe. It does not sign in, subscribe, unlock, or
          confirm backend authority.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isLoading}
        onPress={handleProbePress}
        style={({ pressed }) => [
          styles.button,
          pressed && !isLoading ? styles.buttonPressed : null,
          isLoading ? styles.buttonDisabled : null,
        ]}
      >
        {isLoading ? <ActivityIndicator color="#050509" size="small" /> : null}
        <Text style={styles.buttonText}>
          {isLoading ? "Checking session" : "Run manual session check"}
        </Text>
      </Pressable>

      {probeState.status === "idle" ? (
        <Text style={styles.emptyText}>No probe result yet.</Text>
      ) : null}

      {probeState.status === "failed" ? (
        <Text style={styles.errorText}>
          Session check could not complete safely.
        </Text>
      ) : null}

      {safeRows.length > 0 ? (
        <View style={styles.resultPanel}>
          {safeRows.map((row) => (
            <View key={row.label} style={styles.resultRow}>
              <Text style={styles.resultLabel}>{row.label}</Text>
              <Text style={styles.resultValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111017",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  header: {
    gap: 5,
  },
  title: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  description: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 17,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#d8b46a",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonText: {
    color: "#050509",
    fontSize: 13,
    fontWeight: "900",
  },
  emptyText: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "700",
  },
  errorText: {
    color: "#e28787",
    fontSize: 12,
    fontWeight: "800",
  },
  resultPanel: {
    backgroundColor: "#0d0c12",
    borderColor: "#201c27",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  resultRow: {
    alignItems: "center",
    borderBottomColor: "#201c27",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 38,
    paddingHorizontal: 10,
  },
  resultLabel: {
    color: "#817889",
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    paddingRight: 8,
  },
  resultValue: {
    color: "#fff7ed",
    fontSize: 11,
    fontWeight: "900",
  },
});
