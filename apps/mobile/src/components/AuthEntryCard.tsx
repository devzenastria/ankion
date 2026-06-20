import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuthSessionBoundary } from "../state/AuthSessionProvider";

type EntryUiStatus =
  | "idle"
  | "loading"
  | "client_unavailable"
  | "invalid_email"
  | "request_sent"
  | "request_failed";

function getVisibleMessage(status: EntryUiStatus, safeMessage: string | null) {
  if (status === "request_sent") {
    return "Bağlantı isteği gönderildi. E-postanı kontrol et.";
  }

  if (status === "invalid_email") {
    return "Geçerli bir e-posta gir.";
  }

  if (status === "client_unavailable" || status === "request_failed") {
    return "İstek tamamlanamadı. Daha sonra tekrar dene.";
  }

  return safeMessage;
}

export function AuthEntryCard() {
  const { requestEmailAuthEntry } = useAuthSessionBoundary();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<EntryUiStatus>("idle");
  const [safeMessage, setSafeMessage] = useState<string | null>(null);

  async function handleRequestPress() {
    if (status === "loading") {
      return;
    }

    setStatus("loading");
    setSafeMessage(null);

    try {
      const result = await requestEmailAuthEntry(email);

      setStatus(result.status);
      setSafeMessage(result.safeMessage);
    } catch {
      setStatus("request_failed");
      setSafeMessage("İstek tamamlanamadı. Daha sonra tekrar dene.");
    }
  }

  const isLoading = status === "loading";
  const visibleMessage = getVisibleMessage(status, safeMessage);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Oturum başlat</Text>
        <Text style={styles.description}>
          Güvenli e-posta giriş bağlantısı gönderir. ANKION özelliklerini henüz
          açmaz, profil oluşturmaz veya oturum dinleyicisi başlatmaz.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>E-posta</Text>
        <TextInput
          accessibilityLabel="E-posta"
          autoCapitalize="none"
          autoCorrect={false}
          inputMode="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="ornek@posta.com"
          placeholderTextColor="#5f5668"
          style={styles.input}
          textContentType="emailAddress"
          value={email}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isLoading}
        onPress={handleRequestPress}
        style={({ pressed }) => [
          styles.button,
          pressed && !isLoading ? styles.buttonPressed : null,
          isLoading ? styles.buttonDisabled : null,
        ]}
      >
        {isLoading ? <ActivityIndicator color="#050509" size="small" /> : null}
        <Text style={styles.buttonText}>
          {isLoading ? "Gönderiliyor..." : "E-posta bağlantısı iste"}
        </Text>
      </Pressable>

      {visibleMessage !== null ? (
        <Text
          style={[
            styles.message,
            status === "request_sent" ? styles.messageSuccess : null,
          ]}
        >
          {visibleMessage}
        </Text>
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
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "900",
  },
  input: {
    backgroundColor: "#0d0c12",
    borderColor: "#201c27",
    borderRadius: 12,
    borderWidth: 1,
    color: "#fff7ed",
    fontSize: 13,
    fontWeight: "800",
    minHeight: 44,
    paddingHorizontal: 12,
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
    color: "#e28787",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  messageSuccess: {
    color: "#86efac",
  },
});
