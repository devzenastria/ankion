import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../src/components/AppHeader";
import { AvatarPlaceholder } from "../src/components/AvatarPlaceholder";
import { ScreenContainer } from "../src/components/ScreenContainer";
import { VoiceWave } from "../src/components/VoiceWave";

type ProfileMode = "private" | "approved" | "limited";

const visibilityModes: Array<{
  key: ProfileMode;
  label: string;
  text: string;
  badge: string;
  bio: string;
  helper: string;
}> = [
  {
    key: "private",
    label: "Her yerde anonim",
    text: "Onay vermediğin hiçbir bağlantıda gerçek profil görünmez.",
    badge: "Anonim profil",
    bio: "Profilinden önce sesin duyulur. Gerçek kimliğin yalnızca sen Profili aç dediğinde görünür.",
    helper: "Varsayılan: kimlik kapalı, ses bağlantıları açık.",
  },
  {
    key: "approved",
    label: "Sadece izinle açılır",
    text: "Profili aç dediğin bağlantılar gerçek profilini görebilir.",
    badge: "İzinle açılır",
    bio: "Profilin herkese değil, yalnızca onay verdiğin bağlantılara açılır.",
    helper: "Bu seçim global profil açmaz; her bağlantı yine ayrı onay ister.",
  },
  {
    key: "limited",
    label: "Kısa profil",
    text: "Onay sonrası yalnızca temel profil alanları görünür.",
    badge: "Kısa profil",
    bio: "Profil açıldığında bile sadece temel bilgiler görünür; ses önce kalır.",
    helper: "Detaylı profil yerine güvenli kısa görünüm tercih edilir.",
  },
];
const profileTrustSignals = [
  { label: "Ses ritmi", value: "0:21 tanıtım sesi" },
  { label: "Bağlantı dili", value: "Sakin ve izinli" },
  { label: "Profil güveni", value: "Kimlik bağlantı bazlı" },
];
export default function ProfileScreen() {
  const router = useRouter();
  const [profileMode, setProfileMode] = useState<ProfileMode>("private");
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [profilePhotoHint, setProfilePhotoHint] = useState(false);

  const selectedVisibility = visibilityModes.find(
    (mode) => mode.key === profileMode,
  )!;

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/");
        return true;
      },
    );

    return () => subscription.remove();
  }, [router]);

  function openConnections() {
    router.replace("/chat");
  }

  function openRevealRequests() {
    router.replace("/reveal-requests?source=profile");
  }

  function openSettings() {
    router.replace("/settings");
  }

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="Profil"
        title="Benim alanım"
        actionLabel="Ayarlar"
        actionHref="/settings"
      />

      <View style={styles.profileCard}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setProfilePhotoHint(true)}
          style={styles.avatarWrap}
        >
          <AvatarPlaceholder initial="U" size="md" />
          <View style={styles.photoAddBadge}>
            <Text style={styles.photoAddText}>+</Text>
          </View>
        </Pressable>

        <View style={styles.profileCopy}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.profileName}>
              Uğur
            </Text>
            <Text style={styles.identityBadge}>{selectedVisibility.badge}</Text>
          </View>

          <Text style={styles.handle}>@anonim-ses</Text>

          <Text numberOfLines={2} style={styles.profileBio}>
            {selectedVisibility.bio}
          </Text>

          <View style={styles.profileSignals}>
            <Text style={styles.signalText}>12 bağlantı</Text>
            <Text style={styles.signalDot}>·</Text>
            <Text style={styles.signalText}>Son ses 0:21</Text>
          </View>
        </View>
      </View>
      {profilePhotoHint ? (
        <View style={styles.localHint}>
          <Text style={styles.localHintTitle}>
            Profil fotoğrafı alanı hazır
          </Text>
          <Text style={styles.localHintText}>
            Fotoğraf ekleme daha sonra güvenli galeri/kamera izniyle açılacak.
          </Text>
        </View>
      ) : null}
      <View style={styles.statsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={openConnections}
          style={styles.statItem}
        >
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Bağlantı</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={openRevealRequests}
          style={styles.statItemActive}
        >
          <Text style={styles.statValueActive}>2</Text>
          <Text style={styles.statLabelActive}>İzin isteği</Text>
        </Pressable>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Profil izni</Text>
        </View>
      </View>
      <View style={styles.trustCard}>
        <View style={styles.trustHeader}>
          <Text style={styles.trustTitle}>Profil sinyalleri</Text>
          <Text style={styles.trustText}>
            Profilin kimlik vitrini değil; ses, izin ve güven bağlamıdır.
          </Text>
        </View>

        {profileTrustSignals.map((signal, index) => {
          const isLast = index === profileTrustSignals.length - 1;

          return (
            <View
              key={signal.label}
              style={[
                styles.trustSignalRow,
                isLast && styles.trustSignalRowLast,
              ]}
            >
              <Text style={styles.trustSignalLabel}>{signal.label}</Text>
              <Text style={styles.trustSignalValue}>{signal.value}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.voiceCard}>
        <View style={styles.voiceTop}>
          <View>
            <Text style={styles.sectionTitle}>Ses kimliğin</Text>
            <Text style={styles.voiceText}>
              Kendini anlatan kısa ses alanı burada duracak.
            </Text>
          </View>
          <Text style={styles.voiceDuration}>0:21</Text>
        </View>

        <View style={styles.waveBox}>
          <VoiceWave size="sm" variant="purple" />
        </View>

        <Text style={styles.voiceMeta}>
          Ses kaydı sonraki güvenli fazda açılacak. Şimdilik izin istenmez.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setIsVisibilityOpen((current) => !current)}
        style={styles.visibilityRow}
      >
        <View style={styles.visibilityCopy}>
          <Text style={styles.visibilityTitle}>Profil görünürlüğü</Text>
          <Text style={styles.visibilityText}>{selectedVisibility.label}</Text>
          <Text numberOfLines={2} style={styles.visibilityHelp}>
            {selectedVisibility.helper}
          </Text>
        </View>
        <Text style={styles.chevron}>{isVisibilityOpen ? "⌃" : "›"}</Text>
      </Pressable>

      {isVisibilityOpen ? (
        <View style={styles.visibilityPanel}>
          {visibilityModes.map((mode) => {
            const isActive = profileMode === mode.key;

            return (
              <Pressable
                accessibilityRole="button"
                key={mode.key}
                onPress={() => {
                  setProfileMode(mode.key);
                  setIsVisibilityOpen(false);
                }}
                style={styles.modeRow}
              >
                <View style={styles.modeCopy}>
                  <Text
                    style={[
                      styles.modeTitle,
                      isActive && styles.modeTitleActive,
                    ]}
                  >
                    {mode.label}
                  </Text>
                  <Text numberOfLines={2} style={styles.modeText}>
                    {mode.text}
                  </Text>
                </View>
                <Text
                  style={[styles.modeCheck, isActive && styles.modeCheckActive]}
                >
                  {isActive ? "✓" : "○"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={openRevealRequests}
        style={styles.permissionShortcut}
      >
        <View style={styles.shortcutMark}>
          <Text style={styles.shortcutMarkText}>□</Text>
        </View>
        <View style={styles.shortcutCopy}>
          <Text style={styles.shortcutTitle}>Profil izinleri</Text>
          <Text style={styles.shortcutText}>
            Profilini görmek isteyenleri buradan yönet.
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={openSettings}
        style={styles.settingsShortcut}
      >
        <View style={styles.shortcutCopy}>
          <Text style={styles.shortcutTitle}>Ayarlar</Text>
          <Text style={styles.shortcutText}>
            Bildirimler, gizlilik ve medya tercihleri.
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <View style={styles.privacyBox}>
        <Text style={styles.sectionTitle}>Gizlilik</Text>
        <Text style={styles.privacyText}>
          Gerçek profilin izin vermediğin bağlantılara açılmaz. Kontrol her
          zaman sende kalır.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: "center",
    backgroundColor: "#111017",
    borderColor: "#211d29",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  avatarWrap: {
    alignItems: "center",
    height: 66,
    justifyContent: "center",
    width: 66,
  },
  identityDot: {
    alignItems: "center",
    backgroundColor: "#21183a",
    borderColor: "#111017",
    borderRadius: 999,
    borderWidth: 2,
    bottom: -2,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 22,
  },
  identityDotText: {
    color: "#f0abfc",
    fontSize: 8,
    fontWeight: "900",
  },
  profileCopy: {
    flex: 1,
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  profileName: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
  },
  identityBadge: {
    backgroundColor: "#21183a",
    borderRadius: 999,
    color: "#f0abfc",
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  handle: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  profileBio: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  profileSignals: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 7,
  },
  signalText: {
    color: "#bfb5d2",
    fontSize: 11,
    fontWeight: "800",
  },
  signalDot: {
    color: "#5d5368",
    fontSize: 11,
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    padding: 10,
  },
  statItemActive: {
    alignItems: "center",
    backgroundColor: "#191329",
    borderColor: "#33284a",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 10,
  },
  statValue: {
    color: "#fff7ed",
    fontSize: 17,
    fontWeight: "900",
  },
  statValueActive: {
    color: "#f0abfc",
    fontSize: 17,
    fontWeight: "900",
  },
  statLabel: {
    color: "#9d94aa",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center",
  },
  statLabelActive: {
    color: "#d7cdf0",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
    textAlign: "center",
  },
  voiceCard: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  voiceTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#fff7ed",
    fontSize: 15,
    fontWeight: "900",
  },
  voiceText: {
    color: "#a99cbc",
    fontSize: 12,
    marginTop: 3,
  },
  voiceDuration: {
    color: "#bfb5d2",
    fontSize: 11,
    fontWeight: "900",
  },
  waveBox: {
    backgroundColor: "#0d0c12",
    borderColor: "#24202d",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    overflow: "hidden",
    padding: 10,
  },
  voiceMeta: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
  },
  visibilityRow: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 76,
    padding: 12,
  },
  visibilityCopy: {
    flex: 1,
  },
  visibilityTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  visibilityText: {
    color: "#a99cbc",
    fontSize: 12,
    marginTop: 3,
  },
  visibilityHelp: {
    color: "#817889",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  visibilityPanel: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  modeRow: {
    alignItems: "center",
    borderBottomColor: "#201c27",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  modeCopy: {
    flex: 1,
  },
  modeTitle: {
    color: "#fff7ed",
    fontSize: 13,
    fontWeight: "900",
  },
  modeTitleActive: {
    color: "#f0abfc",
  },
  modeText: {
    color: "#9d94aa",
    fontSize: 12,
    marginTop: 3,
  },
  modeCheck: {
    color: "#817889",
    fontSize: 17,
    fontWeight: "900",
  },
  modeCheckActive: {
    color: "#f0abfc",
  },
  permissionShortcut: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 70,
    padding: 10,
  },
  settingsShortcut: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 62,
    padding: 10,
  },
  shortcutMark: {
    alignItems: "center",
    backgroundColor: "#191329",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  shortcutMarkText: {
    color: "#f0abfc",
    fontSize: 20,
    fontWeight: "900",
  },
  shortcutCopy: {
    flex: 1,
  },
  shortcutTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  shortcutText: {
    color: "#9d94aa",
    fontSize: 12,
    marginTop: 3,
  },
  chevron: {
    color: "#817889",
    fontSize: 22,
    fontWeight: "600",
  },
  privacyBox: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  privacyText: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  photoAddBadge: {
    alignItems: "center",
    backgroundColor: "#21183a",
    borderColor: "#111017",
    borderRadius: 999,
    borderWidth: 2,
    bottom: -2,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 24,
  },
  photoAddText: {
    color: "#f0abfc",
    fontSize: 15,
    fontWeight: "900",
    marginTop: -1,
  },
  localHint: {
    backgroundColor: "#15111f",
    borderColor: "#2b2240",
    borderRadius: 14,
    borderWidth: 1,
    padding: 11,
  },
  localHintTitle: {
    color: "#fff7ed",
    fontSize: 13,
    fontWeight: "900",
  },
  localHintText: {
    color: "#a99cbc",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  trustCard: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  trustHeader: {
    marginBottom: 4,
  },
  trustTitle: {
    color: "#fff7ed",
    fontSize: 15,
    fontWeight: "900",
  },
  trustText: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  trustSignalRow: {
    alignItems: "center",
    borderBottomColor: "#201c27",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 42,
  },
  trustSignalRowLast: {
    borderBottomWidth: 0,
  },
  trustSignalLabel: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "800",
  },
  trustSignalValue: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },
});
