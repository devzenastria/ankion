import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuthSessionBoundary } from "../state/AuthSessionProvider";

function formatBoolean(value: boolean): string {
  return value ? "evet" : "hayir";
}

export function BackendProfileFoundationProbeCard() {
  const { backendProfileFoundation, refreshBackendProfileFoundation } =
    useAuthSessionBoundary();

  function handleProbePress() {
    if (
      backendProfileFoundation.status === "loading" ||
      backendProfileFoundation.status === "session_missing"
    ) {
      return;
    }

    void refreshBackendProfileFoundation();
  }

  const isLoading = backendProfileFoundation.status === "loading";
  const isSessionMissing = backendProfileFoundation.status === "session_missing";
  const canRefresh =
    !isLoading &&
    !isSessionMissing &&
    (backendProfileFoundation.status === "idle" ||
      backendProfileFoundation.canRetry);
  const buttonLabel = isLoading
    ? "Kontrol ediliyor..."
    : isSessionMissing
      ? "Oturum gerekli"
      : "Backend profil durumunu yenile";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Backend profil durumu</Text>
        <Text style={styles.description}>
          Oturum tokenini sadece guvenli istek basliginda kullanir; token, ham
          yanit veya ozel kimlik bilgisi gostermez.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!canRefresh}
        onPress={handleProbePress}
        style={({ pressed }) => [
          styles.button,
          pressed && canRefresh ? styles.buttonPressed : null,
          !canRefresh ? styles.buttonDisabled : null,
        ]}
      >
        {isLoading ? <ActivityIndicator color="#050509" size="small" /> : null}
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </Pressable>

      <Text
        style={[
          styles.message,
          backendProfileFoundation.status === "success"
            ? styles.messageSuccess
            : null,
        ]}
      >
        {backendProfileFoundation.message}
      </Text>

      <View style={styles.resultPanel}>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Profil hazir</Text>
          <Text style={styles.resultValue}>
            {formatBoolean(backendProfileFoundation.profileReady)}
          </Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Anonim kimlik hazir</Text>
          <Text style={styles.resultValue}>
            {formatBoolean(backendProfileFoundation.anonymousIdentityReady)}
          </Text>
        </View>

        <View style={[styles.resultRow, styles.resultRowLast]}>
          <Text style={styles.resultLabel}>Onboarding tamam</Text>
          <Text style={styles.resultValue}>
            {formatBoolean(backendProfileFoundation.onboardingComplete)}
          </Text>
        </View>
      </View>
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
