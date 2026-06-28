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
      return "\u0130stemci yok";
    case "unauthenticated":
      return "Oturum yok";
    case "authenticated_client_observed":
      return "Oturum g\u00f6zlemlendi";
    case "expired":
      return "Oturum s\u00fcresi dolmu\u015f";
    case "read_failed":
      return "Kontrol ba\u015far\u0131s\u0131z";
  }
}

function getSafeRows(result: AuthSessionReadBoundaryResult): SafeProbeRow[] {
  return [
    { label: "Kontrol durumu", value: formatStatus(result.status) },
    { label: "\u0130stemci haz\u0131r", value: formatBoolean(result.clientAvailable) },
    { label: "Oturum var", value: formatBoolean(result.sessionPresent) },
    {
      label: "Sunucu onay\u0131",
      value: formatBoolean(result.isServerConfirmed),
    },
    {
      label: "Sunucu yetkisi",
      value: formatBoolean(result.isBackendAuthority),
    },
    {
      label: "Dinleyici a\u00e7\u0131k",
      value: formatBoolean(result.isListenerEnabled),
    },
    {
      label: "De\u011fi\u015fiklik yetkisi",
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
      : "Oturumu kontrol et";
  const safeRows =
    probeState.status === "success" ? getSafeRows(probeState.result) : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{"Oturum kontrol\u00fc"}</Text>
        <Text style={styles.description}>
          {"Sorun ya\u015farsan oturum durumunu g\u00fcvenli \u015fekilde tekrar okur. Giri\u015f yapmaz veya \u00f6zellik kilidi a\u00e7maz."}
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
        <Text style={styles.emptyText}>{"Hen\u00fcz kontrol sonucu yok."}</Text>
      ) : null}

      {probeState.status === "failed" ? (
        <Text style={styles.errorText}>
          {"Kontrol g\u00fcvenli \u015fekilde tamamlanamad\u0131."}
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
    backgroundColor: "#0d0c12",
    borderColor: "#201c27",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  header: {
    gap: 5,
  },
  title: {
    color: "#d7cdf0",
    fontSize: 13,
    fontWeight: "900",
  },
  description: {
    color: "#817889",
    fontSize: 12,
    lineHeight: 17,
  },
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#21183a",
    borderColor: "#4b3b68",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 12,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonText: {
    color: "#f0abfc",
    fontSize: 12,
    fontWeight: "900",
  },
  emptyText: {
    color: "#6f6578",
    fontSize: 11,
    fontWeight: "700",
  },
  errorText: {
    color: "#e28787",
    fontSize: 12,
    fontWeight: "800",
  },
  resultPanel: {
    backgroundColor: "#09080d",
    borderColor: "#201c27",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  resultRow: {
    alignItems: "center",
    borderBottomColor: "#201c27",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 36,
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
    color: "#d7cdf0",
    fontSize: 11,
    fontWeight: "900",
  },
});
