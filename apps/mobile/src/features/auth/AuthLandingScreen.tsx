import { Pressable, StyleSheet, Text, View } from "react-native";

export type AuthLandingScreenProps = Readonly<{
  onLoginPress?: () => void;
  onSignupPress?: () => void;
}>;

export function AuthLandingScreen({
  onLoginPress,
  onSignupPress,
}: AuthLandingScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.brandMark}>
          <Text allowFontScaling={false} style={styles.brandMarkText}>
            A
          </Text>
        </View>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Anonim başlangıç</Text>
          <Text style={styles.title}>ANKION</Text>
          <Text style={styles.subtitle}>
            {"Sesle ba\u015fla, ANKION kimli\u011fini kontrol sende tut. Ger\u00e7ek profil sadece izin verdi\u011fin ba\u011flant\u0131larda g\u00f6r\u00fcn\u00fcr."}
          </Text>
        </View>
      </View>

      <View style={styles.actionPanel}>
        <Pressable
          accessibilityRole="button"
          onPress={onSignupPress}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed ? styles.buttonPressed : null,
          ]}
        >
          <Text style={styles.primaryButtonText}>Üye Ol</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onLoginPress}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed ? styles.buttonPressed : null,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Giriş Yap</Text>
        </Pressable>
      </View>

      <View style={styles.notePanel}>
        <Text style={styles.noteText}>
          {"Email ba\u011flant\u0131s\u0131 ile devam et. Hesap kurtarma i\u00e7in eri\u015febildi\u011fin bir email kullanman \u00f6nerilir."}
        </Text>
        <Text style={styles.legalText}>
          {"Email aktivasyonu giri\u015f \u015fart\u0131 de\u011fildir; devam edersen kullan\u0131m ve gizlilik ad\u0131mlar\u0131na ge\u00e7ersin."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#050509",
    flex: 1,
    gap: 18,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 28,
  },
  hero: {
    gap: 18,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: "#d8b46a",
    borderRadius: 18,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  brandMarkText: {
    color: "#050509",
    fontSize: 25,
    fontWeight: "900",
  },
  copy: {
    gap: 8,
  },
  eyebrow: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  title: {
    color: "#fff7ed",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 42,
  },
  subtitle: {
    color: "#b9a8d8",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  actionPanel: {
    gap: 10,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#d8b46a",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16,
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
  buttonPressed: {
    opacity: 0.82,
  },
  primaryButtonText: {
    color: "#050509",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButtonText: {
    color: "#fff7ed",
    fontSize: 15,
    fontWeight: "900",
  },
  notePanel: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    padding: 13,
  },
  noteText: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  legalText: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 17,
  },
});
