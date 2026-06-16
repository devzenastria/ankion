import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../src/components/AppHeader";
import { BlurMediaThumb } from "../src/components/BlurMediaThumb";
import { ContentTypeIcon } from "../src/components/ContentTypeIcon";
import { ScreenContainer } from "../src/components/ScreenContainer";
import { staticPersonas } from "../src/data/staticPersonas";

type FilterKey = "all" | "voice" | "photo" | "video" | "approved";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Tümü" },
  { key: "voice", label: "Ses" },
  { key: "photo", label: "Fotoğraf" },
  { key: "video", label: "Video" },
  { key: "approved", label: "İzinli" },
];

function getTypeLabel(type: string) {
  if (type === "voice") return "Ses";
  if (type === "photo") return "Fotoğraf";
  if (type === "video") return "Video";
  return "Profil izni";
}

function getThumbKind(contentType: string) {
  if (contentType === "photo") return "photo";
  if (contentType === "video") return "video";
  if (contentType === "approved") return "profile";
  return "voice";
}

export default function FeedScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const visibleMoments = useMemo(() => {
    if (activeFilter === "all") {
      return staticPersonas;
    }

    if (activeFilter === "approved") {
      return staticPersonas.filter(
        (persona) =>
          persona.contentType === "approved" ||
          persona.revealStatus === "approved",
      );
    }

    return staticPersonas.filter(
      (persona) => persona.contentType === activeFilter,
    );
  }, [activeFilter]);

  const firstMoment = visibleMoments[0] ?? staticPersonas[0]!;

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

  function openVoiceThread(threadId: string) {
    router.replace(`/chat?threadId=${threadId}&source=feed`);
  }

  function openMemberProfile(memberId: string, threadId: string) {
    router.replace(
      `/member-profile?memberId=${memberId}&threadId=${threadId}&source=feed`,
    );
  }

  return (
    <ScreenContainer>
      <AppHeader eyebrow="Bugün" title="Akış" />

      <View style={styles.filterRow}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <Pressable
              accessibilityRole="button"
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => openVoiceThread(firstMoment.threadId)}
        style={styles.composeRow}
      >
        <View style={styles.composeWave}>
          <BlurMediaThumb kind="voice" variant="pink" />
        </View>
        <View style={styles.composeCopy}>
          <Text style={styles.composeTitle}>Bir ana sesle yaklaş</Text>
          <Text style={styles.composeText}>
            Yanıt verdiğinde özel bağlantı başlar.
          </Text>
        </View>
        <Text style={styles.composeAction}>Yanıtla</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bugünün anları</Text>
        <Text style={styles.sectionHint}>{visibleMoments.length} içerik</Text>
      </View>

      <View style={styles.momentList}>
        {visibleMoments.map((persona) => {
          const isApproved =
            persona.contentType === "approved" ||
            persona.revealStatus === "approved";

          return (
            <View key={persona.threadId} style={styles.momentRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  openMemberProfile(persona.memberId, persona.threadId)
                }
                style={styles.preview}
              >
                <BlurMediaThumb
                  kind={getThumbKind(persona.contentType)}
                  variant={persona.thumbnailVariant}
                />
              </Pressable>

              <View style={styles.momentCopy}>
                <View style={styles.momentTop}>
                  <View style={styles.typeWrap}>
                    <ContentTypeIcon
                      type={
                        persona.contentType === "approved"
                          ? "profile"
                          : persona.contentType
                      }
                      tone={isApproved ? "approved" : "soft"}
                    />
                    <Text style={styles.typeText}>
                      {getTypeLabel(persona.contentType)}
                    </Text>
                  </View>
                  <Text style={styles.momentTime}>{persona.lastActive}</Text>
                </View>

                <Text numberOfLines={1} style={styles.momentTitle}>
                  {persona.anonymousTitle}
                </Text>

                <Text numberOfLines={1} style={styles.momentSubtitle}>
                  {persona.voiceTitle}
                </Text>

                <View style={styles.tagLine}>
                  {persona.tags.slice(0, 3).map((tag) => (
                    <Text key={tag} style={styles.tagText}>
                      #{tag}
                    </Text>
                  ))}
                </View>

                <Text style={styles.momentMeta}>
                  {persona.replyCount} cevap · {persona.lastVoiceDuration} ·{" "}
                  {isApproved ? "Profil açıldı" : "Kimlik kapalı"}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => openVoiceThread(persona.threadId)}
              >
                <Text style={styles.answerButton}>Yanıtla</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.privacyRow}>
        <Text style={styles.privacyTitle}>Akış profil açmaz</Text>
        <Text style={styles.privacyText}>
          Etiketler sadece bağlam verir. Gerçek kimlik yalnızca profil izniyle
          görünür.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  filterChip: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: "rgba(124, 58, 237, 0.16)",
    borderColor: "#5b3ca0",
  },
  filterText: {
    color: "#a99cbc",
    fontSize: 12,
    fontWeight: "800",
  },
  filterTextActive: {
    color: "#f0abfc",
  },
  composeRow: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    minHeight: 72,
    padding: 10,
  },
  composeWave: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    overflow: "hidden",
    width: 48,
  },
  composeCopy: {
    flex: 1,
  },
  composeTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  composeText: {
    color: "#9d94aa",
    fontSize: 12,
    marginTop: 3,
  },
  composeAction: {
    color: "#f0abfc",
    fontSize: 12,
    fontWeight: "900",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#fff7ed",
    fontSize: 16,
    fontWeight: "900",
  },
  sectionHint: {
    color: "#9d94aa",
    fontSize: 11,
    fontWeight: "800",
  },
  momentList: {
    gap: 7,
  },
  momentRow: {
    alignItems: "center",
    backgroundColor: "#0f0e15",
    borderColor: "#1d1924",
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    minHeight: 92,
    padding: 10,
  },
  preview: {
    alignItems: "center",
    justifyContent: "center",
    width: 54,
  },
  momentCopy: {
    flex: 1,
  },
  momentTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  typeText: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "800",
  },
  momentTime: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "700",
  },
  momentTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 3,
  },
  momentSubtitle: {
    color: "#a99cbc",
    fontSize: 12,
    marginTop: 3,
  },
  tagLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 5,
  },
  tagText: {
    color: "#9d94aa",
    fontSize: 10,
    fontWeight: "800",
  },
  momentMeta: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
  answerButton: {
    color: "#f0abfc",
    fontSize: 12,
    fontWeight: "900",
  },
  privacyRow: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  privacyTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  privacyText: {
    color: "#9d94aa",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
});
