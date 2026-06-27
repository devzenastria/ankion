import { Pressable, StyleSheet, Text, View } from "react-native";

type AuthLoginScaffoldScreenProps = Readonly<{
  onBackPress: () => void;
}>;

export function AuthLoginScaffoldScreen({
  onBackPress,
}: AuthLoginScaffoldScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>ANKION</Text>
        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.note}>
          Hesabına giriş yapma ekranı burada hazırlanıyor.
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
  note: {
    color: "#b9a8d8",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  screen: {
    backgroundColor: "#050509",
    flex: 1,
    gap: 22,
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
