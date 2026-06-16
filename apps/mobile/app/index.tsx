import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "../src/components/ScreenContainer";
import { getActiveHomePersona } from "../src/data/staticPersonas";

const activePersona = getActiveHomePersona();

export default function HomeScreen() {
  const router = useRouter();

  function openFeed() {
    router.replace("/feed" as any);
  }

  function openConnections() {
    router.replace("/chat" as any);
  }

  function openActiveConnection() {
    router.replace(`/chat?threadId=${activePersona.threadId}&source=home` as any);
  }

  return (
    <ScreenContainer>
      <View style={styles.headerBlock}>
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>ANKION</Text>
          <View style={styles.identityPill}>
            <Text style={styles.identityPillText}>Anonim mod</Text>
          </View>
        </View>

        <Text style={styles.title}>Anonim sesle başla</Text>
        <Text style={styles.subtitle}>
          Sesini bırak, akışı dinle veya bağlantılarına geri dön.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={openFeed}
        style={({ pressed }) => [
          styles.primaryCard,
          pressed && styles.primaryCardPressed,
        ]}
      >
        <View style={styles.primaryTopRow}>
          <View style={styles.primaryIcon}>
            <Text style={styles.primaryIconText}>+</Text>
          </View>
          <Text style={styles.primaryMeta}>Anonim ses · profil kapalı</Text>
        </View>

        <Text style={styles.primaryTitle}>Akışa ses bırak</Text>
        <Text style={styles.primaryBody}>
          Gerçek profilini açmadan başla. Bir yanıt gelirse Chat'te devam eder.
        </Text>
        <Text style={styles.primaryAction}>Anonim akışı aç</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={openConnections}
        style={({ pressed }) => [
          styles.secondaryAction,
          pressed && styles.secondaryActionPressed,
        ]}
      >
        <View>
          <Text style={styles.secondaryTitle}>Bağlantılara dön</Text>
          <Text style={styles.secondaryText}>Aktif sesli konuşmaların Chat'te.</Text>
        </View>
        <Text style={styles.secondaryArrow}>›</Text>
      </Pressable>

      <View style={styles.statusCard}>
        <Text style={styles.cardLabel}>Durum</Text>
        <Text style={styles.statusTitle}>Bekleyen acil işlem yok.</Text>
        <Text style={styles.statusText}>
          Yeni bir ses geldiğinde bağlantılarında görünür.
        </Text>
      </View>

      <View style={styles.privacyCard}>
        <Text style={styles.cardLabel}>Gizlilik</Text>
        <Text style={styles.privacyText}>
          Gerçek profilin herkese açılmaz. Sadece izin verdiğin bağlantıda görünür.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={openActiveConnection}
        style={({ pressed }) => [
          styles.recentConnection,
          pressed && styles.secondaryActionPressed,
        ]}
      >
        <View style={styles.recentDuration}>
          <Text style={styles.recentDurationText}>
            {activePersona.lastVoiceDuration}
          </Text>
        </View>

        <View style={styles.recentCopy}>
          <Text style={styles.cardLabel}>Son konuşma</Text>
          <Text numberOfLines={1} style={styles.recentTitle}>
            Gece yürüyüşü
          </Text>
          <Text numberOfLines={1} style={styles.recentText}>
            Yeni ses cevabı aktif
          </Text>
        </View>

        <Text style={styles.recentAction}>Aç</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: 8,
    paddingTop: 2,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brandName: {
    color: "#fff7ed",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  identityPill: {
    backgroundColor: "#15121d",
    borderColor: "#2d2638",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  identityPillText: {
    color: "#d7cdf0",
    fontSize: 11,
    fontWeight: "800",
  },
  title: {
    color: "#fff7ed",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
  },
  subtitle: {
    color: "#a99cbc",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  primaryCard: {
    backgroundColor: "#14101d",
    borderColor: "rgba(240, 171, 252, 0.22)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 9,
    padding: 15,
  },
  primaryCardPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.996 }],
  },
  primaryTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryIcon: {
    alignItems: "center",
    backgroundColor: "#7c3aed",
    borderRadius: 999,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  primaryIconText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
  },
  primaryMeta: {
    color: "#d7cdf0",
    fontSize: 11,
    fontWeight: "800",
  },
  primaryTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },
  primaryBody: {
    color: "#b9a8d8",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  primaryAction: {
    color: "#f0abfc",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "#0f0e15",
    borderColor: "#24202d",
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 62,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  secondaryActionPressed: {
    opacity: 0.76,
  },
  secondaryTitle: {
    color: "#fff7ed",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryText: {
    color: "#8e849d",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  secondaryArrow: {
    color: "#d7cdf0",
    fontSize: 24,
    fontWeight: "800",
  },
  statusCard: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 13,
  },
  cardLabel: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 5,
  },
  statusTitle: {
    color: "#fff7ed",
    fontSize: 15,
    fontWeight: "900",
  },
  statusText: {
    color: "#9d94aa",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 4,
  },
  privacyCard: {
    backgroundColor: "rgba(124, 58, 237, 0.08)",
    borderColor: "rgba(215, 205, 240, 0.12)",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 13,
  },
  privacyText: {
    color: "#d7cdf0",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  recentConnection: {
    alignItems: "center",
    backgroundColor: "#0f0e15",
    borderColor: "#24202d",
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    minHeight: 70,
    padding: 11,
  },
  recentDuration: {
    alignItems: "center",
    backgroundColor: "#1d1727",
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 48,
  },
  recentDurationText: {
    color: "#f0abfc",
    fontSize: 11,
    fontWeight: "900",
  },
  recentCopy: {
    flex: 1,
  },
  recentTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  recentText: {
    color: "#8e849d",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  recentAction: {
    color: "#f0abfc",
    fontSize: 12,
    fontWeight: "900",
  },
});