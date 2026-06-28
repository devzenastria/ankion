import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BlurMediaThumb } from "../src/components/BlurMediaThumb";
import { ContentTypeIcon } from "../src/components/ContentTypeIcon";
import { ScreenContainer } from "../src/components/ScreenContainer";
import {
  createLocalFeedDraftPreview,
  getLocalFeedItems,
  type LocalDraftPreview,
} from "../src/data/localProductState";

type FilterKey = "all" | "voice" | "camera" | "approved";
type ShareMode = "voice" | "camera";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Tümü" },
  { key: "voice", label: "Ses" },
  { key: "camera", label: "Kamera" },
  { key: "approved", label: "İzinli" },
];

function getTypeLabel(type: string) {
  if (type === "voice") return "Ses";
  if (type === "photo" || type === "video") return "Kamera";
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
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [lastShareMode, setLastShareMode] = useState<ShareMode>("voice");
  const [localDraft, setLocalDraft] = useState<LocalDraftPreview | null>(null);

  const visibleMoments = useMemo(() => {
    const feedItems = getLocalFeedItems();

    if (activeFilter === "all") {
      return feedItems;
    }

    if (activeFilter === "camera") {
      return feedItems.filter(
        (persona) =>
          persona.contentType === "photo" || persona.contentType === "video",
      );
    }

    if (activeFilter === "approved") {
      return feedItems.filter(
        (persona) =>
          persona.contentType === "approved" || persona.isProfileVisible,
      );
    }

    return feedItems.filter((persona) => persona.contentType === "voice");
  }, [activeFilter]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isShareSheetOpen) {
          setIsShareSheetOpen(false);
          return true;
        }

        router.replace("/");
        return true;
      },
    );

    return () => subscription.remove();
  }, [isShareSheetOpen, router]);

  function openVoiceThread(threadId: string) {
    router.replace(`/chat?threadId=${threadId}&source=feed`);
  }

  function openMemberProfile(memberId: string, threadId: string) {
    router.replace(
      `/member-profile?memberId=${memberId}&threadId=${threadId}&source=feed`,
    );
  }

  function chooseShareMode(mode: ShareMode) {
    const nextDraft = createLocalFeedDraftPreview(mode);

    setLastShareMode(mode);
    setLocalDraft(
      mode === "voice"
        ? {
            ...nextDraft,
            text: "Yerel taslak hazır. Profil görünürlüğü değişmez.",
          }
        : nextDraft,
    );
    setIsShareSheetOpen(false);
  }

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Bugün</Text>
          <Text style={styles.headerTitle}>Akış</Text>
        </View>

        <Pressable
          accessibilityLabel="Akışa yeni an bırak"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setIsShareSheetOpen(true)}
          style={({ pressed }) => [
            styles.headerAction,
            pressed && styles.headerActionPressed,
          ]}
        >
          <Text style={styles.headerActionText}>+</Text>
        </Pressable>
      </View>

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

      <View style={styles.sectionIntro}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle}>Bugünün anları</Text>
        </View>
        <Text style={styles.sectionText}>
          Yeni sesleri tara, ilgini çekenlere yanıt ver.
        </Text>
      </View>

      {localDraft ? (
        <View style={styles.localDraftRow}>
          <View style={styles.localDraftDot} />
          <View style={styles.localDraftCopy}>
            <Text style={styles.localDraftLabel}>{localDraft.label}</Text>
            <Text style={styles.localDraftText}>{localDraft.text}</Text>
          </View>
          <Text style={styles.localDraftTime}>{localDraft.time}</Text>
        </View>
      ) : null}

      <View style={styles.momentList}>
        {visibleMoments.map((persona) => {
          const isApproved =
            persona.contentType === "approved" || persona.isProfileVisible;

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
                  {persona.title}
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
                  {persona.revealLabel}
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

      <Modal
        animationType="fade"
        onRequestClose={() => setIsShareSheetOpen(false)}
        transparent
        visible={isShareSheetOpen}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Paylaşım seçeneklerini kapat"
            accessibilityRole="button"
            onPress={() => setIsShareSheetOpen(false)}
            style={styles.modalScrim}
          />

          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>Yeni an</Text>
                <Text style={styles.sheetTitle}>Ne bırakmak istiyorsun?</Text>
              </View>

              <Pressable
                accessibilityLabel="Kapat"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setIsShareSheetOpen(false)}
                style={styles.sheetClose}
              >
                <Text style={styles.sheetCloseText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.sheetOptions}>
              <Pressable
                accessibilityLabel="Ses bırak"
                accessibilityRole="button"
                onPress={() => chooseShareMode("voice")}
                style={({ pressed }) => [
                  styles.sheetOption,
                  styles.sheetOptionPrimary,
                  lastShareMode === "voice" && styles.sheetOptionSelected,
                  pressed && styles.sheetOptionPressed,
                ]}
              >
                <View style={styles.sheetIcon}>
                  <ContentTypeIcon type="voice" tone="soft" />
                </View>
                <View style={styles.sheetOptionCopy}>
                  <Text style={styles.sheetOptionTitle}>Anonim ses bırak</Text>
                  <Text style={styles.sheetOptionText}>
                    21 saniyeye kadar profil kapalı ses.
                  </Text>
                </View>
              </Pressable>

              <Pressable
                accessibilityLabel="Kamera ile an bırak"
                accessibilityRole="button"
                onLongPress={() => chooseShareMode("camera")}
                onPress={() => chooseShareMode("camera")}
                style={({ pressed }) => [
                  styles.sheetOption,
                  lastShareMode === "camera" && styles.sheetOptionSelectedSoft,
                  pressed && styles.sheetOptionPressed,
                ]}
              >
                <View style={styles.sheetIcon}>
                  <ContentTypeIcon type="photo" tone="soft" />
                </View>
                <View style={styles.sheetOptionCopy}>
                  <Text style={styles.sheetOptionTitle}>Kamera ile an bırak</Text>
                  <Text style={styles.sheetOptionText}>
                    Yerel taslak oluştur. Profil görünürlüğü değişmez.
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 32,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: "#5f5668",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.35,
  },
  headerTitle: {
    color: "#cfc3dd",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.05,
    lineHeight: 17,
  },
  headerAction: {
    alignItems: "center",
    backgroundColor: "rgba(18, 16, 24, 0.72)",
    borderColor: "rgba(215, 205, 240, 0.1)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  headerActionPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  headerActionText: {
    color: "#d8ccec",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 20,
  },
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
  sectionIntro: {
    gap: 4,
    marginTop: 6,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  sectionDot: {
    backgroundColor: "#c026d3",
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  sectionTitle: {
    color: "#fff7ed",
    fontSize: 16,
    fontWeight: "900",
  },
  sectionText: {
    color: "#9d94aa",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  localDraftRow: {
    alignItems: "center",
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    borderColor: "rgba(240, 171, 252, 0.16)",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 9,
    minHeight: 48,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  localDraftDot: {
    backgroundColor: "#f0abfc",
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  localDraftCopy: {
    flex: 1,
  },
  localDraftLabel: {
    color: "#cfc3dd",
    fontSize: 11,
    fontWeight: "900",
  },
  localDraftText: {
    color: "#9d94aa",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  localDraftTime: {
    color: "#817889",
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
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalScrim: {
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: "#0c0b11",
    borderColor: "rgba(215, 205, 240, 0.08)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 16,
    paddingBottom: 26,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "#30283a",
    borderRadius: 999,
    height: 4,
    width: 38,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sheetEyebrow: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "800",
  },
  sheetTitle: {
    color: "#fff7ed",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },
  sheetClose: {
    alignItems: "center",
    backgroundColor: "#17131d",
    borderColor: "#25202d",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  sheetCloseText: {
    color: "#cfc3dd",
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 22,
  },
  sheetOptions: {
    gap: 10,
  },
  sheetOption: {
    alignItems: "center",
    backgroundColor: "#121017",
    borderColor: "#211d29",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sheetOptionPrimary: {
    backgroundColor: "rgba(236, 72, 153, 0.12)",
    borderColor: "rgba(240, 171, 252, 0.22)",
  },
  sheetOptionSelected: {
    borderColor: "rgba(240, 171, 252, 0.45)",
  },
  sheetOptionSelectedSoft: {
    borderColor: "rgba(199, 186, 214, 0.24)",
  },
  sheetOptionPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.995 }],
  },
  sheetIcon: {
    alignItems: "center",
    backgroundColor: "#0b0a0f",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  sheetOptionCopy: {
    flex: 1,
  },
  sheetOptionTitle: {
    color: "#fff7ed",
    fontSize: 15,
    fontWeight: "900",
  },
  sheetOptionText: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
});
