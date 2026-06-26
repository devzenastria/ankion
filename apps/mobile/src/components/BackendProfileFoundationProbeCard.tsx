import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getBackendApiPublicEnv } from "../lib/apiEnv";
import type {
  BackendProfileFoundationResult,
  BackendProfileFoundationStatus,
} from "../lib/backendApiBoundary";
import { useAuthSessionBoundary } from "../state/AuthSessionProvider";

type ProbeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: BackendProfileFoundationResult }
  | { status: "failed" };

function formatBoolean(value: boolean): string {
  return value ? "evet" : "hayır";
}

function getVisibleMessage(status: BackendProfileFoundationStatus): string {
  switch (status) {
    case "configured_false":
      return "Backend API adresi yapılandırılmadı.";
    case "session_missing":
      return "Oturum yok. Önce giriş yap.";
    case "success":
      return "Backend profil durumu alındı.";
    case "auth_required":
    case "auth_invalid":
      return "Oturum backend tarafından doğrulanamadı.";
    case "backend_configuration_required":
      return "Backend yapılandırması tamamlanmadı.";
    case "read_failed":
      return "Profil durumu güvenli şekilde okunamadı.";
    case "network_failed":
      return "Backend bağlantısı kurulamadı.";
    case "unknown_failed":
      return "Backend kontrolü tamamlanamadı.";
  }
}

function isSuccessResult(result: BackendProfileFoundationResult): boolean {
  return result.status === "success" && result.profileFoundation !== null;
}

export function BackendProfileFoundationProbeCard() {
  const { readBackendProfileFoundation } = useAuthSessionBoundary();
  const [probeState, setProbeState] = useState<ProbeState>({ status: "idle" });
  const apiEnv = getBackendApiPublicEnv();

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
      const result = await readBackendProfileFoundation();
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
      : "Backend profil durumunu kontrol et";
  const result =
    probeState.status === "success" ? probeState.result : null;
  const profileFoundation =
    result !== null && isSuccessResult(result)
      ? result.profileFoundation
      : null;
  const visibleMessage =
    result !== null
      ? getVisibleMessage(result.status)
      : apiEnv.isConfigured
        ? "Henüz backend kontrol sonucu yok."
        : "Backend API adresi yapılandırılmadı.";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Backend profil durumu</Text>
        <Text style={styles.description}>
          Oturum tokenını sadece güvenli istek başlığında kullanır; token,
          ham yanıt veya özel kimlik bilgisi göstermez.
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

      {probeState.status === "failed" ? (
        <Text style={styles.errorText}>Backend kontrolü tamamlanamadı.</Text>
      ) : (
        <Text
          style={[
            styles.message,
            profileFoundation !== null ? styles.messageSuccess : null,
          ]}
        >
          {visibleMessage}
        </Text>
      )}

      {profileFoundation !== null ? (
        <View style={styles.resultPanel}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Profil hazır</Text>
            <Text style={styles.resultValue}>
              {formatBoolean(profileFoundation.profileReady)}
            </Text>
          </View>

          <View style={[styles.resultRow, styles.resultRowLast]}>
            <Text style={styles.resultLabel}>Anonim kimlik hazır</Text>
            <Text style={styles.resultValue}>
              {formatBoolean(profileFoundation.anonymousIdentityReady)}
            </Text>
          </View>
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
  message: {
    color: "#817889",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  messageSuccess: {
    color: "#86efac",
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
  resultRowLast: {
    borderBottomWidth: 0,
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
