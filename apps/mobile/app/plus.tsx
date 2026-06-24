import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../src/components/AppHeader";
import { ScreenContainer } from "../src/components/ScreenContainer";

const plusFeatures = [
  "Daha fazla görünürlük",
  "Profil öne çıkarma",
  "Gelişmiş keşif avantajları",
  "Daha fazla bağlantı/reveal hakkı",
  "Gizlilik ve kontrol seçenekleri",
];

export default function PlusScreen() {
  return (
    <ScreenContainer>
      <AppHeader eyebrow="Üyelik" title="ANKION Plus" icon="plus" />

      <View style={styles.heroCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Yakında</Text>
        </View>

        <Text style={styles.heroTitle}>ANKION Plus</Text>
        <Text style={styles.heroText}>
          Daha fazla görünürlük ve gelişmiş keşif avantajları burada açılacak.
        </Text>

        <View style={styles.cta}>
          <Text style={styles.ctaText}>Plus özellikleri hazırlanıyor</Text>
        </View>
      </View>

      <View style={styles.featureList}>
        {plusFeatures.map((feature) => (
          <View key={feature} style={styles.featureCard}>
            <View style={styles.featureMark}>
              <Text style={styles.featureMarkText}>+</Text>
            </View>
            <Text style={styles.featureTitle}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.safeNote}>
        <Text style={styles.safeNoteTitle}>Ön izleme</Text>
        <Text style={styles.safeNoteText}>
          Bu ekran şimdilik üyelik ön izlemesidir. Ödeme veya abonelik işlemi
          başlatmaz.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#111017",
    borderColor: "#2a2038",
    borderRadius: 18,
    borderWidth: 1,
    gap: 11,
    padding: 16,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(240, 171, 252, 0.12)",
    borderColor: "rgba(240, 171, 252, 0.24)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#f0abfc",
    fontSize: 11,
    fontWeight: "900",
  },
  heroTitle: {
    color: "#fff7ed",
    fontSize: 24,
    fontWeight: "900",
  },
  heroText: {
    color: "#bfb5d2",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  cta: {
    alignItems: "center",
    backgroundColor: "#d8b46a",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  ctaText: {
    color: "#050509",
    fontSize: 13,
    fontWeight: "900",
  },
  featureList: {
    gap: 8,
  },
  featureCard: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  featureMark: {
    alignItems: "center",
    backgroundColor: "#191329",
    borderRadius: 999,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  featureMarkText: {
    color: "#f0abfc",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
  },
  featureTitle: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
  },
  safeNote: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  safeNoteTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  safeNoteText: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
});
