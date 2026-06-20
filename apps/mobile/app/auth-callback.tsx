import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppHeader } from "../src/components/AppHeader";
import { ScreenContainer } from "../src/components/ScreenContainer";
import type { AuthCallbackBoundaryResult } from "../src/lib/authCallbackBoundary";
import { useAuthSessionBoundary } from "../src/state/AuthSessionProvider";

type CallbackUiState =
  | { status: "loading" }
  | { status: "success"; result: AuthCallbackBoundaryResult }
  | { status: "failed"; result: AuthCallbackBoundaryResult | null };

type SafeCallbackRow = {
  label: string;
  value: string;
};

function formatBoolean(value: boolean): string {
  return value ? "true" : "false";
}

function getSafeRows(result: AuthCallbackBoundaryResult): SafeCallbackRow[] {
  return [
    { label: "Backend yetkisi", value: formatBoolean(result.isBackendAuthority) },
    { label: "Dinleyici açık", value: formatBoolean(result.isListenerEnabled) },
    {
      label: "Ürün kilidi açıldı",
      value: formatBoolean(result.isProductUnlockEnabled),
    },
  ];
}

function isCallbackSuccess(result: AuthCallbackBoundaryResult): boolean {
  return result.status === "session_set_client_observed";
}

export default function AuthCallbackScreen() {
  const incomingUrl = Linking.useURL();
  const router = useRouter();
  const { completeAuthCallbackFromUrl } = useAuthSessionBoundary();
  const hasCompletedRef = useRef(false);
  const [callbackState, setCallbackState] = useState<CallbackUiState>({
    status: "loading",
  });

  useEffect(() => {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    let isMounted = true;

    async function completeCallback() {
      try {
        const callbackUrl = incomingUrl ?? (await Linking.getInitialURL());
        const result = await completeAuthCallbackFromUrl(callbackUrl);

        if (!isMounted) {
          return;
        }

        setCallbackState(
          isCallbackSuccess(result)
            ? { status: "success", result }
            : { status: "failed", result },
        );
      } catch {
        if (isMounted) {
          setCallbackState({ status: "failed", result: null });
        }
      }
    }

    void completeCallback();

    return () => {
      isMounted = false;
    };
  }, [completeAuthCallbackFromUrl, incomingUrl]);

  const result =
    callbackState.status === "success" || callbackState.status === "failed"
      ? callbackState.result
      : null;
  const safeRows = result !== null ? getSafeRows(result) : [];

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="Oturum"
        title="Bağlantı kontrolü"
        actionLabel="Ayarlar"
        actionHref="/settings"
      />

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Oturum bağlantısı</Text>
          <Text style={styles.description}>
            Oturum bağlantısı kontrol ediliyor. Bu ekran ürün kilidi açmaz,
            profil oluşturmaz veya dinleyici başlatmaz.
          </Text>
        </View>

        {callbackState.status === "loading" ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color="#d8b46a" size="small" />
            <Text style={styles.statusText}>
              Oturum bağlantısı kontrol ediliyor.
            </Text>
          </View>
        ) : null}

        {callbackState.status === "success" ? (
          <Text style={styles.successText}>Oturum bağlantısı alındı.</Text>
        ) : null}

        {callbackState.status === "failed" ? (
          <Text style={styles.errorText}>Oturum bağlantısı tamamlanamadı.</Text>
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

        <Text style={styles.safeNote}>
          Güvenli şekilde ayarlara dönebilirsin.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/settings")}
          style={({ pressed }) => [
            styles.button,
            pressed ? styles.buttonPressed : null,
          ]}
        >
          <Text style={styles.buttonText}>Ayarlar'a dön</Text>
        </Pressable>
      </View>
    </ScreenContainer>
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
    fontSize: 15,
    fontWeight: "900",
  },
  description: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 17,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  statusText: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  successText: {
    color: "#86efac",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 17,
  },
  errorText: {
    color: "#e28787",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 17,
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
  safeNote: {
    color: "#a99cbc",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#d8b46a",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: "#050509",
    fontSize: 13,
    fontWeight: "900",
  },
});
