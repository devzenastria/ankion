import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  consumeRememberedAuthCallbackUrl,
  getAuthCallbackUrlSafeSignature,
  getRememberedAuthCallbackUrl,
} from "../src/lib/authCallbackUrlStore";
import { useAuthSessionBoundary } from "../src/state/AuthSessionProvider";

type CallbackUiState =
  | { status: "loading" }
  | { status: "success"; result: AuthCallbackBoundaryResult }
  | { status: "failed"; result: AuthCallbackBoundaryResult | null };

type SafeCallbackRow = {
  label: string;
  value: string;
};

const callbackCaptureDelayMs = 900;

function formatBoolean(value: boolean): string {
  return value ? "Evet" : "Hayır";
}

function hasRouteParams(routeParams: Readonly<Record<string, unknown>>): boolean {
  return Object.keys(routeParams).length > 0;
}

function createAttemptKey(
  callbackUrl: string | null,
  routeParams: Readonly<Record<string, unknown>> | null,
): string {
  const routeParamKeys =
    routeParams !== null ? Object.keys(routeParams).sort().join(",") : "";
  const callbackUrlKey = getAuthCallbackUrlSafeSignature(callbackUrl);

  return `${callbackUrlKey}|${routeParamKeys}`;
}

function getStatusMessage(result: AuthCallbackBoundaryResult): string {
  switch (result.status) {
    case "session_set_client_observed":
      return "Oturum bağlantısı güvenli şekilde alındı.";
    case "code_flow_detected":
      return "Bu bağlantı farklı bir oturum tamamlama yöntemi gerektiriyor.";
    case "missing_tokens":
      return "Oturum bağlantısı eksik veriyle geldi.";
    case "missing_url":
      return "Oturum bağlantısı bulunamadı.";
    case "callback_error":
    case "client_unavailable":
    case "callback_failed":
      return "Oturum bağlantısı tamamlanamadı.";
  }
}

function getSafeRows(result: AuthCallbackBoundaryResult): SafeCallbackRow[] {
  return [
    {
      label: "Bağlantı verisi alındı",
      value: formatBoolean(result.hasCallbackData),
    },
    {
      label: "Erişim anahtarı var",
      value: formatBoolean(result.hasAccessToken),
    },
    {
      label: "Yenileme anahtarı var",
      value: formatBoolean(result.hasRefreshToken),
    },
    { label: "Kod akışı algılandı", value: formatBoolean(result.hasCode) },
    {
      label: "Hata parametresi var",
      value: formatBoolean(result.hasErrorParam),
    },
  ];
}

function isCallbackSuccess(result: AuthCallbackBoundaryResult): boolean {
  return result.status === "session_set_client_observed";
}

export default function AuthCallbackScreen() {
  const incomingUrl = Linking.useURL();
  const routeParams = useLocalSearchParams();
  const routeParamsRef = useRef(routeParams);
  const router = useRouter();
  const { completeAuthCallbackFromUrl } = useAuthSessionBoundary();
  const attemptedCandidatesRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);
  const isSessionSetRef = useRef(false);
  const [callbackState, setCallbackState] = useState<CallbackUiState>({
    status: "loading",
  });

  useEffect(() => {
    routeParamsRef.current = routeParams;
  }, [routeParams]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const completeWithCandidate = useCallback(
    async (
      callbackUrl: string | null,
      candidateRouteParams: Readonly<Record<string, unknown>> | null,
    ) => {
      if (isSessionSetRef.current) {
        return;
      }

      const attemptKey = createAttemptKey(callbackUrl, candidateRouteParams);

      if (attemptedCandidatesRef.current.has(attemptKey)) {
        return;
      }

      attemptedCandidatesRef.current.add(attemptKey);

      try {
        const result = await completeAuthCallbackFromUrl({
          callbackUrl,
          routeParams: candidateRouteParams,
        });

        if (!isMountedRef.current) {
          return;
        }

        if (isCallbackSuccess(result)) {
          isSessionSetRef.current = true;
        }

        setCallbackState(
          isCallbackSuccess(result)
            ? { status: "success", result }
            : { status: "failed", result },
        );
      } catch {
        if (isMountedRef.current) {
          setCallbackState({ status: "failed", result: null });
        }
      }
    },
    [completeAuthCallbackFromUrl],
  );

  const completeWithRememberedCandidate = useCallback(() => {
    const rememberedUrl =
      consumeRememberedAuthCallbackUrl() ?? getRememberedAuthCallbackUrl();

    if (rememberedUrl === null || rememberedUrl.length === 0) {
      return;
    }

    const candidateRouteParams = hasRouteParams(routeParamsRef.current)
      ? routeParamsRef.current
      : null;

    void completeWithCandidate(rememberedUrl, candidateRouteParams);
  }, [completeWithCandidate]);

  useEffect(() => {
    const candidateRouteParams = hasRouteParams(routeParams) ? routeParams : null;

    if (incomingUrl !== null && incomingUrl.length > 0) {
      void completeWithCandidate(incomingUrl, candidateRouteParams);
      return;
    }

    completeWithRememberedCandidate();
  }, [
    completeWithCandidate,
    completeWithRememberedCandidate,
    incomingUrl,
    routeParams,
  ]);

  useEffect(() => {
    if (hasRouteParams(routeParams)) {
      void completeWithCandidate(null, routeParams);
    }
  }, [completeWithCandidate, routeParams]);

  useEffect(() => {
    completeWithRememberedCandidate();
  }, [completeWithRememberedCandidate]);

  useEffect(() => {
    void Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl === null || initialUrl.length === 0) {
        completeWithRememberedCandidate();
        return;
      }

      const candidateRouteParams = hasRouteParams(routeParamsRef.current)
        ? routeParamsRef.current
        : null;

      void completeWithCandidate(initialUrl, candidateRouteParams);
    });

    const subscription = Linking.addEventListener("url", (event) => {
      const candidateRouteParams = hasRouteParams(routeParamsRef.current)
        ? routeParamsRef.current
        : null;

      void completeWithCandidate(event.url, candidateRouteParams);
    });

    return () => {
      subscription.remove();
    };
  }, [completeWithCandidate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const rememberedUrl =
        consumeRememberedAuthCallbackUrl() ?? getRememberedAuthCallbackUrl();
      const candidateRouteParams = hasRouteParams(routeParamsRef.current)
        ? routeParamsRef.current
        : null;

      void completeWithCandidate(
        incomingUrl ?? rememberedUrl,
        candidateRouteParams,
      );
    }, callbackCaptureDelayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [completeWithCandidate, incomingUrl]);

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
          <Text style={styles.successText}>
            {getStatusMessage(callbackState.result)}
          </Text>
        ) : null}

        {callbackState.status === "failed" ? (
          <Text style={styles.errorText}>
            {callbackState.result !== null
              ? getStatusMessage(callbackState.result)
              : "Oturum bağlantısı tamamlanamadı."}
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
