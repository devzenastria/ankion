import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { UsernameAuthDiagnostic } from "../../lib/usernameAuthBoundary";
import { useAuthSessionBoundary } from "../../state/AuthSessionProvider";

type AuthLoginScaffoldScreenProps = Readonly<{
  onBackPress: () => void;
}>;

function formatDiagnosticValue(value: string | number | boolean | null): string {
  if (value === null) {
    return "yok";
  }

  if (typeof value === "boolean") {
    return value ? "evet" : "hayır";
  }

  return String(value);
}

function AuthDiagnosticBlock({
  diagnostic,
}: Readonly<{ diagnostic: UsernameAuthDiagnostic | null }>) {
  if (diagnostic === null) {
    return null;
  }

  return (
    <View style={styles.diagnosticPanel}>
      <Text style={styles.diagnosticTitle}>{"Oturum tanısı"}</Text>
      <Text style={styles.diagnosticText}>marker: {diagnostic.marker}</Text>
      <Text style={styles.diagnosticText}>
        errorName: {formatDiagnosticValue(diagnostic.errorName)}
      </Text>
      <Text style={styles.diagnosticText}>
        errorStatus: {formatDiagnosticValue(diagnostic.errorStatus)}
      </Text>
      <Text style={styles.diagnosticText}>
        accessTokenPresent: {formatDiagnosticValue(diagnostic.accessTokenPresent)}
      </Text>
      <Text style={styles.diagnosticText}>
        refreshTokenPresent: {formatDiagnosticValue(diagnostic.refreshTokenPresent)}
      </Text>
    </View>
  );
}
function getLoginMessage(status: LoginUiStatus, safeMessage: string | null) {
  if (status === "success") {
    return "Giriş yapıldı.";
  }

  if (status === "failed") {
    return safeMessage ?? "Kullanıcı adı veya parola hatalı.";
  }

  return null;
}

type LoginUiStatus = "idle" | "loading" | "success" | "failed";

export function AuthLoginScaffoldScreen({
  onBackPress,
}: AuthLoginScaffoldScreenProps) {
  const { requestUsernameLogin } = useAuthSessionBoundary();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoginUiStatus>("idle");
  const [safeMessage, setSafeMessage] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<UsernameAuthDiagnostic | null>(null);

  async function handleLoginPress() {
    if (status === "loading") {
      return;
    }

    setStatus("loading");
    setSafeMessage(null);
    setDiagnostic(null);

    try {
      const result = await requestUsernameLogin({
        username,
        password,
      });

      if (result.isSessionEstablished) {
        setStatus("success");
        setSafeMessage(result.safeMessage);
        setDiagnostic(null);
        return;
      }

      setStatus("failed");
      setSafeMessage(
        result.status === "auth_failed"
          ? "Kullanıcı adı veya parola hatalı."
          : result.safeMessage,
      );
      setDiagnostic(result.diagnostic);
    } catch {
      setStatus("failed");
      setSafeMessage("İşlem şu anda tamamlanamadı. Daha sonra tekrar dene.");
      setDiagnostic(null);
    }
  }

  const isLoading = status === "loading";
  const visibleMessage = getLoginMessage(status, safeMessage);

  return (
    <View style={styles.screen}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>ANKION</Text>
        <Text style={styles.title}>{"Giriş Yap"}</Text>
        <Text style={styles.note}>
          {"Kullanıcı adın ve şifrenle devam et. E-posta giriş için değil, kurtarma içindir."}
        </Text>
      </View>

      <View style={styles.formPanel}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{"Kullanıcı adı"}</Text>
          <TextInput
            accessibilityLabel="Kullanıcı adı"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setUsername}
            placeholder="ankion_kullanici"
            placeholderTextColor="#5f5668"
            style={styles.input}
            textContentType="username"
            value={username}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{"Şifre"}</Text>
          <TextInput
            accessibilityLabel="Şifre"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setPassword}
            placeholder="Şifren"
            placeholderTextColor="#5f5668"
            secureTextEntry
            style={styles.input}
            textContentType="password"
            value={password}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isLoading}
          onPress={handleLoginPress}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !isLoading ? styles.buttonPressed : null,
            isLoading ? styles.buttonDisabled : null,
          ]}
        >
          {isLoading ? <ActivityIndicator color="#050509" size="small" /> : null}
          <Text style={styles.primaryButtonText}>
            {isLoading ? "Giriş yapılıyor..." : "Giriş yap"}
          </Text>
        </Pressable>

        <AuthDiagnosticBlock diagnostic={diagnostic} />

        {visibleMessage !== null ? (
          <Text
            style={[
              styles.message,
              status === "success" ? styles.messageSuccess : null,
            ]}
          >
            {visibleMessage}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onBackPress}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed ? styles.buttonPressed : null,
        ]}
      >
        <Text style={styles.secondaryButtonText}>Geri</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  copy: {
    gap: 10,
  },
  diagnosticPanel: {
    backgroundColor: "#0d0c12",
    borderColor: "#3a3145",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    padding: 10,
  },
  diagnosticText: {
    color: "#b9a8d8",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
  },
  diagnosticTitle: {
    color: "#fff7ed",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 15,
  },
  eyebrow: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  formPanel: {
    backgroundColor: "#111017",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  input: {
    backgroundColor: "#0d0c12",
    borderColor: "#201c27",
    borderRadius: 12,
    borderWidth: 1,
    color: "#fff7ed",
    fontSize: 13,
    fontWeight: "800",
    minHeight: 46,
    paddingHorizontal: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: "#817889",
    fontSize: 11,
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
  note: {
    color: "#b9a8d8",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#d8b46a",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#050509",
    fontSize: 13,
    fontWeight: "900",
  },
  screen: {
    backgroundColor: "#050509",
    flex: 1,
    gap: 18,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 28,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#111017",
    borderColor: "#2a2533",
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: "#fff7ed",
    fontSize: 15,
    fontWeight: "900",
  },
  title: {
    color: "#fff7ed",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
  },
});
