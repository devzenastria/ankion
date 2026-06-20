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

function formatStatus(status: AuthSessionReadBoundaryResult["status"]): string {
  switch (status) {
    case "client_unavailable":
      return "İstemci yok";
    case "unauthenticated":
      return "Oturum yok";
    case "authenticated_client_observed":
      return "Oturum gözlemlendi";
    case "expired":
      return "Oturum süresi dolmuş";
    case "read_failed":
      return "Kontrol başarısız";
  }
}

function getSafeRows(result: AuthSessionReadBoundaryResult): SafeProbeRow[] {
  return [
    { label: "Kontrol durumu", value: formatStatus(result.status) },
    { label: "İstemci hazır", value: formatBoolean(result.clientAvailable) },
    { label: "Oturum var", value: formatBoolean(result.sessionPresent) },
    {
      label: "Sunucu onayı",
      value: formatBoolean(result.isServerConfirmed),
    },
    {
      label: "Backend yetkisi",
      value: formatBoolean(result.isBackendAuthority),
    },
    {
      label: "Dinleyici açık",
      value: formatBoolean(result.isListenerEnabled),
    },
    {
      label: "Değişiklik yetkisi",
      value: formatBoolean(result.isMutationEnabled),
    },
  ];
}

export function AuthSessionProbeCard() {
  const { readSessionBoundary } = useAuthSessionBoundary();
  const [probeState, setProbeState] = useState<ProbeState>({ status: "idle" });

  async function handleProbePress() {
    if (probeState.status === "loading") {
      return;
    }

    if (probeState.status === "success" || probeState.status === "failed") {
      setProbeState({ status: "idle" });
      return;
    }

    setProbeState({ status: "loading" });

    try {
      const result = await readSessionBoundary();
      setProbeState({ status: "success", result });
    } catch {
      setProbeState({ status: "failed" });
    }
  }

  const isLoading = probeState.status === "loading";
  const isResultVisible =
    probeState.status === "success" || probeState.status === "failed";
  const buttonLabel = isLoading
    ? "Kontrol ediliyor..."
    : isResultVisible
      ? "Sonucu gizle"
      : "Güvenli oturum kontrolünü çalıştır";
  const safeRows =
    probeState.status === "success" ? getSafeRows(probeState.result) : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Güvenli oturum kontrolü</Text>
        <Text style={styles.description}>
          Manuel tanı kontrolüdür; giriş yapmaz, dinleyici açmaz, özellik
          kilidi çözmez veya backend yetkisini onaylamaz.
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
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </Pressable>

      {probeState.status === "idle" ? (
        <Text style={styles.emptyText}>Henüz kontrol sonucu yok.</Text>
      ) : null}

      {probeState.status === "failed" ? (
        <Text style={styles.errorText}>Kontrol güvenli şekilde tamamlanamadı.</Text>
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
