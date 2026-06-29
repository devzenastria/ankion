import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../src/components/AppHeader";
import { AuthSessionProbeCard } from "../src/components/AuthSessionProbeCard";
import { BackendProfileFoundationProbeCard } from "../src/components/BackendProfileFoundationProbeCard";
import { OwnerProfileCreationCard } from "../src/components/OwnerProfileCreationCard";
import { ScreenContainer } from "../src/components/ScreenContainer";
import { useAuthSessionBoundary } from "../src/state/AuthSessionProvider";

type LogoutStatus = "idle" | "loading" | "failed";

const summaryChips = ["Anonim", "Ba\u011flant\u0131 bazl\u0131", "\u0130zinle g\u00f6r\u00fcn\u00fcr"];

const settingsSections = [
  {
    title: "Gizlilik",
    rows: [
      { label: "Ba\u015flang\u0131\u00e7 modu", value: "Anonim" },
      { label: "Profil g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fc", value: "Ba\u011flant\u0131 bazl\u0131" },
      { label: "Profil izinleri", value: "Sen onaylars\u0131n" },
      { label: "Engellenenler", value: "0" },
    ],
  },
  {
    title: "Cihaz izinleri",
    rows: [
      { label: "Mikrofon", value: "Gerekti\u011finde istenir" },
      { label: "Kamera", value: "Gerekti\u011finde istenir" },
      { label: "Konum", value: "Kesin konum yok" },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { requestSignOut } = useAuthSessionBoundary();
  const [logoutStatus, setLogoutStatus] = useState<LogoutStatus>("idle");
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  async function handleSignOutPress() {
    if (logoutStatus === "loading") {
      return;
    }

    setLogoutStatus("loading");
    setLogoutMessage(null);

    try {
      const result = await requestSignOut();

      if (result.status === "signed_out") {
        router.replace("/");
        setLogoutStatus("idle");
        return;
      }

      setLogoutStatus("failed");
      setLogoutMessage(result.safeMessage);
    } catch {
      setLogoutStatus("failed");
      setLogoutMessage("\u00c7\u0131k\u0131\u015f yap\u0131lamad\u0131. Tekrar dene.");
    }
  }

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

      <View style={styles.summaryCard}>
        <Text style={styles.summaryEyebrow}>{"Profil"}</Text>
        <Text style={styles.summaryTitle}>{"Anonim profil haz\u0131r"}</Text>
        <Text style={styles.summaryText}>
          {"Ger\u00e7ek profilin yaln\u0131zca izin verdi\u011fin ba\u011flant\u0131larda g\u00f6r\u00fcn\u00fcr."}
        </Text>
        <View style={styles.chipRow}>
          {summaryChips.map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{"Profil durumu"}</Text>
        <OwnerProfileCreationCard />
        <BackendProfileFoundationProbeCard />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{"Kontrol ayarlar\u0131"}</Text>
        <Text style={styles.sectionIntro}>
          {"Profil ve cihaz izinleri sade tutulur. Ayr\u0131nt\u0131lar yaln\u0131zca gerekti\u011finde a\u00e7\u0131l\u0131r."}
        </Text>

        {settingsSections.map((section) => (
          <View key={section.title} style={styles.panel}>
            <Text style={styles.panelTitle}>{section.title}</Text>

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
        ))}
      </View>

      <View style={styles.secondarySection}>
        <Text style={styles.sectionTitle}>{"\u0130kincil oturum ara\u00e7lar\u0131"}</Text>
        <Text style={styles.secondaryText}>
          {"Bu alan normal kullan\u0131m i\u00e7in gerekli de\u011fildir. Sorun ya\u015farsan kontrol ama\u00e7l\u0131 kullan\u0131l\u0131r."}
        </Text>
        <AuthSessionProbeCard />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{"Oturumdan \u00e7\u0131k\u0131\u015f"}</Text>
        <View style={styles.logoutCard}>
          <View style={styles.logoutHeader}>
            <Text style={styles.logoutTitle}>{"Oturum"}</Text>
            <Text style={styles.logoutText}>
              {"Bu cihazdaki oturumu kapat\u0131r. Tekrar devam etmek i\u00e7in giri\u015f yapman gerekir."}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={logoutStatus === "loading"}
            onPress={handleSignOutPress}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && logoutStatus !== "loading"
                ? styles.logoutButtonPressed
                : null,
              logoutStatus === "loading" ? styles.logoutButtonDisabled : null,
            ]}
          >
            <Text style={styles.logoutButtonText}>
              {logoutStatus === "loading"
                ? "\u00c7\u0131k\u0131\u015f yap\u0131l\u0131yor..."
                : "\u00c7\u0131k\u0131\u015f yap"}
            </Text>
          </Pressable>

          {logoutMessage !== null ? (
            <Text style={styles.logoutErrorText}>{logoutMessage}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>{"Sonraki ayarlar"}</Text>
        <Text style={styles.noteText}>
          {"Hesap silme, Google giri\u015fi ve ileri g\u00fcvenlik ayarlar\u0131 bu sprintte eklenmedi."}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#111017",
    borderColor: "#2f2940",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  summaryEyebrow: {
    color: "#d8b46a",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  summaryTitle: {
    color: "#fff7ed",
    fontSize: 22,
    fontWeight: "900",
  },
  summaryText: {
    color: "#a99cbc",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 2,
  },
  chip: {
    backgroundColor: "#17131f",
    borderColor: "#332b44",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipText: {
    color: "#d7cdf0",
    fontSize: 11,
    fontWeight: "900",
  },
  section: {
    gap: 10,
    marginTop: 6,
  },
  secondarySection: {
    gap: 10,
    marginTop: 12,
  },
  sectionTitle: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.3,
    marginLeft: 2,
  },
  sectionIntro: {
    color: "#817889",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginLeft: 2,
  },
  secondaryText: {
    color: "#6f6578",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
    marginLeft: 2,
  },
  panel: {
    backgroundColor: "transparent",
    borderTopColor: "#211d29",
    borderTopWidth: 1,
    overflow: "hidden",
    paddingTop: 4,
  },
  panelTitle: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 2,
    marginLeft: 2,
  },
  settingRow: {
    alignItems: "center",
    borderBottomColor: "#201c27",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
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
  logoutCard: {
    backgroundColor: "#0d0c12",
    borderColor: "#2d1c22",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  logoutHeader: {
    gap: 5,
  },
  logoutTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  logoutText: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 17,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "#2d1c22",
    borderColor: "#6b2f3a",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  logoutButtonDisabled: {
    opacity: 0.72,
  },
  logoutButtonPressed: {
    opacity: 0.82,
  },
  logoutButtonText: {
    color: "#fecdd3",
    fontSize: 13,
    fontWeight: "900",
  },
  logoutErrorText: {
    color: "#e28787",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  note: {
    backgroundColor: "#0d0c12",
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
