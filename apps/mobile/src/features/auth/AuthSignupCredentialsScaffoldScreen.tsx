import { Pressable, StyleSheet, Text, View } from "react-native";

type AuthSignupCredentialsScaffoldScreenProps = Readonly<{
  onBackPress: () => void;
}>;

export function AuthSignupCredentialsScaffoldScreen({
  onBackPress,
}: AuthSignupCredentialsScaffoldScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>ANKION</Text>
        <Text style={styles.title}>Üye Ol</Text>
        <Text style={styles.note}>
          Kullanıcı adı ve parola adımı burada hazırlanıyor.
        </Text>
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.infoText}>
          E-posta bir sonraki adımda hesap kurtarma için alınacak.
        </Text>
      </View>

      <View style={styles.actionPanel}>
        <Pressable
          accessibilityRole="button"
          disabled
          style={styles.disabledButton}
        >
          <Text style={styles.disabledButtonText}>Yakında</Text>
        </Pressable>

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
    </View>
  );
}

const styles = StyleSheet.create({
  actionPanel: {
    gap: 10,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  copy: {
    gap: 10,
  },
  disabledButton: {
    alignItems: "center",
    backgroundColor: "#26202f",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    opacity: 0.72,
    paddingHorizontal: 16,
  },
  disabledButtonText: {
    color: "#b9a8d8",
    fontSize: 15,
    fontWeight: "900",
  },
  eyebrow: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  infoPanel: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 13,
  },
  infoText: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  note: {
    color: "#b9a8d8",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
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
