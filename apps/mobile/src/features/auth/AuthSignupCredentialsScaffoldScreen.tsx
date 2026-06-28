import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuthSessionBoundary } from "../../state/AuthSessionProvider";

type AuthSignupCredentialsScaffoldScreenProps = Readonly<{
  onBackPress: () => void;
}>;

type SignupUiStatus = "idle" | "loading" | "success" | "failed";

function getSignupMessage(status: SignupUiStatus, safeMessage: string | null) {
  if (status === "success") {
    return "Hesap oluşturuldu.";
  }

  if (status === "failed") {
    return safeMessage ?? "Bilgileri kontrol et.";
  }

  return null;
}

export function AuthSignupCredentialsScaffoldScreen({
  onBackPress,
}: AuthSignupCredentialsScaffoldScreenProps) {
  const { requestUsernameSignup } = useAuthSessionBoundary();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryWarningAcknowledged, setRecoveryWarningAcknowledged] =
    useState(false);
  const [status, setStatus] = useState<SignupUiStatus>("idle");
  const [safeMessage, setSafeMessage] = useState<string | null>(null);

  async function handleSignupPress() {
    if (status === "loading") {
      return;
    }

    setStatus("loading");
    setSafeMessage(null);

    try {
      const result = await requestUsernameSignup({
        username,
        password,
        recoveryEmail,
        recoveryWarningAcknowledged,
      });

      if (result.isSessionEstablished) {
        setStatus("success");
        setSafeMessage(result.safeMessage);
        return;
      }

      setStatus("failed");
      setSafeMessage(result.safeMessage);
    } catch {
      setStatus("failed");
      setSafeMessage("İşlem şu anda tamamlanamadı. Daha sonra tekrar dene.");
    }
  }

  const isLoading = status === "loading";
  const visibleMessage = getSignupMessage(status, safeMessage);

  return (
    <View style={styles.screen}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>ANKION</Text>
        <Text style={styles.title}>Üye Ol</Text>
        <Text style={styles.note}>
          Kullanıcı adı ve şifreyle hesap oluştur. E-posta giriş için değil,
          kurtarma içindir.
        </Text>
      </View>

      <View style={styles.formPanel}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kullanıcı adı</Text>
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
          <Text style={styles.inputLabel}>Şifre</Text>
          <TextInput
            accessibilityLabel="Şifre"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setPassword}
            placeholder="En az 8 karakter"
            placeholderTextColor="#5f5668"
            secureTextEntry
            style={styles.input}
            textContentType="newPassword"
            value={password}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kurtarma e-postası</Text>
          <TextInput
            accessibilityLabel="Kurtarma e-postası"
            autoCapitalize="none"
            autoCorrect={false}
            inputMode="email"
            keyboardType="email-address"
            onChangeText={setRecoveryEmail}
            placeholder="isteğe bağlı"
            placeholderTextColor="#5f5668"
            style={styles.input}
            textContentType="emailAddress"
            value={recoveryEmail}
          />
        </View>

        <View style={styles.recoveryPanel}>
          <Text style={styles.recoveryText}>
            E-posta giriş için kullanılmaz. Şifreni unutursan yalnızca
            erişebildiğin e-posta ile kurtarma mümkün olabilir.
          </Text>
          <Text style={styles.recoveryWarning}>
            Erişemediğin bir e-posta yazarsan hesabı kurtaramayabilirsin.
          </Text>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: recoveryWarningAcknowledged }}
            onPress={() =>
              setRecoveryWarningAcknowledged(
                (currentValue) => !currentValue,
              )
            }
            style={({ pressed }) => [
              styles.acknowledgementRow,
              pressed ? styles.buttonPressed : null,
            ]}
          >
            <View
              style={[
                styles.checkbox,
                recoveryWarningAcknowledged ? styles.checkboxChecked : null,
              ]}
            >
              {recoveryWarningAcknowledged ? (
                <Text style={styles.checkboxMark}>✓</Text>
              ) : null}
            </View>
            <Text style={styles.acknowledgementText}>
              Kurtarma riskini anladım.
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isLoading}
          onPress={handleSignupPress}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !isLoading ? styles.buttonPressed : null,
            isLoading ? styles.buttonDisabled : null,
          ]}
        >
          {isLoading ? <ActivityIndicator color="#050509" size="small" /> : null}
          <Text style={styles.primaryButtonText}>
            {isLoading ? "Hesap oluşturuluyor..." : "Hesap oluştur"}
          </Text>
        </Pressable>

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
  acknowledgementRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  acknowledgementText: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 17,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  checkbox: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#4a4056",
    borderRadius: 7,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: "#d8b46a",
    borderColor: "#d8b46a",
  },
  checkboxMark: {
    color: "#050509",
    fontSize: 15,
    fontWeight: "900",
  },
  copy: {
    gap: 10,
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
  recoveryPanel: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    padding: 12,
  },
  recoveryText: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  recoveryWarning: {
    color: "#e2c27a",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 18,
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
