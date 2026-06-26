import { useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../src/components/AppHeader";
import { AuthEntryCard } from "../src/components/AuthEntryCard";
import { AuthSessionProbeCard } from "../src/components/AuthSessionProbeCard";
import { BackendProfileFoundationProbeCard } from "../src/components/BackendProfileFoundationProbeCard";
import { OwnerProfileCreationCard } from "../src/components/OwnerProfileCreationCard";
import { ScreenContainer } from "../src/components/ScreenContainer";

const settingsSections = [
  {
    title: "Hesap",
    rows: [
      { label: "Başlangıç modu", value: "Anonim" },
      { label: "Profil fotoğrafı", value: "İzinle sonra" },
    ],
  },
  {
    title: "Gizlilik",
    rows: [
      { label: "Profil görünürlüğü", value: "Bağlantı bazlı" },
      { label: "Profil izinleri", value: "Sen onaylarsın" },
      { label: "Engellenenler", value: "0" },
    ],
  },
  {
    title: "Bildirimler",
    rows: [
      { label: "Yeni sesli bağlantı", value: "Açık" },
      { label: "Profil izni isteği", value: "Açık" },
    ],
  },
  {
    title: "Medya ve izinler",
    rows: [
      { label: "Mikrofon", value: "Gerektiğinde istenir" },
      { label: "Kamera", value: "Gerektiğinde istenir" },
      { label: "Galeri", value: "Profil fotoğrafında istenir" },
    ],
  },
  {
    title: "Güvenlik",
    rows: [
      { label: "Uygulama kilidi", value: "Sonraki güvenli faz" },
      { label: "Ekran koruması", value: "Sonraki fazda" },
      { label: "Konum", value: "Kesin konum yok" },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/profile");
        return true;
      },
    );

    return () => subscription.remove();
  }, [router]);

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="Profil"
        title="Ayarlar"
        actionLabel="Profil"
        actionHref="/profile"
      />

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Kontrol sende</Text>
        <Text style={styles.heroText}>
          Profil, izinler ve medya erişimi bağlantı bazlı yönetilir. Gerçek
          kimlik izinsiz açılmaz.
        </Text>
      </View>

      {settingsSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          <View style={styles.panel}>
            {section.rows.map((row, index) => {
              const isLast = index === section.rows.length - 1;

              return (
                <View
                  key={row.label}
                  style={[styles.settingRow, isLast && styles.settingRowLast]}
                >
                  <View style={styles.settingCopy}>
                    <Text style={styles.settingTitle}>{row.label}</Text>
                    <Text style={styles.settingHint}>{row.value}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <AuthEntryCard />

      <AuthSessionProbeCard />

      <OwnerProfileCreationCard />

      <BackendProfileFoundationProbeCard />

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Henüz kalıcı ayar yok</Text>
        <Text style={styles.noteText}>
          Bu ekran şimdilik bilgi amaçlıdır. Gerçek izin, kilit ve medya
          işlemleri sonraki güvenli fazlarda açılacak.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#111017",
    borderColor: "#211d29",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  heroTitle: {
    color: "#fff7ed",
    fontSize: 17,
    fontWeight: "900",
  },
  heroText: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.3,
    marginLeft: 2,
  },
  panel: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 12,
  },
  settingRow: {
    alignItems: "center",
    borderBottomColor: "#201c27",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingCopy: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    color: "#fff7ed",
    fontSize: 13,
    fontWeight: "900",
  },
  settingHint: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  note: {
    backgroundColor: "#111017",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  noteTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  noteText: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
});
