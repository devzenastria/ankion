import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppHeader } from "../src/components/AppHeader";
import { BlurMediaThumb } from "../src/components/BlurMediaThumb";
import { ScreenContainer } from "../src/components/ScreenContainer";
import {
  createLocalDiscoverDraftPreview,
  getLocalDiscoverItems,
  type LocalDraftPreview,
} from "../src/data/localProductState";

type Topic = {
  key: string;
  label: string;
};

const discoverItems = getLocalDiscoverItems();
const discoveredTags = Array.from(
  new Set(discoverItems.flatMap((persona) => persona.tags)),
).slice(0, 7);

const topics: Topic[] = [
  { key: "all", label: "Tümü" },
  { key: "new", label: "Yeni" },
  { key: "approved", label: "İzinli" },
  ...discoveredTags.map((tag) => ({
    key: tag,
    label: `#${tag}`,
  })),
];

function getThumbKind(contentType: string) {
  if (contentType === "photo") return "photo";
  if (contentType === "video") return "video";
  if (contentType === "approved") return "profile";
  return "voice";
}

export default function DiscoverScreen() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [localDraft, setLocalDraft] = useState<LocalDraftPreview | null>(null);

  const visibleVoices = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

    const topicFiltered = discoverItems.filter((persona) => {
      if (selectedTopic === "all") return true;
      if (selectedTopic === "new") return !persona.isProfileVisible;
      if (selectedTopic === "approved") return persona.isProfileVisible;
      return persona.tags.includes(selectedTopic);
    });

    if (!normalizedQuery) {
      return topicFiltered;
    }

    return topicFiltered.filter((persona) => {
      const searchable = [
        persona.title,
        persona.voiceTitle,
        persona.connectionStatusLabel,
        ...persona.tags,
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return searchable.includes(normalizedQuery);
    });
  }, [query, selectedTopic]);

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
    router.replace(`/chat?threadId=${threadId}`);
  }

  function openMemberProfile(memberId: string, threadId: string) {
    router.replace(
      `/member-profile?memberId=${memberId}&threadId=${threadId}&source=discover`,
    );
  }

  function prepareDiscoverDraft(sourceId?: string) {
    setLocalDraft({
      ...createLocalDiscoverDraftPreview(sourceId),
      text: "Sesli yaklaşım hazır. Profil izni olmadan kimlik kapalı kalır.",
    });
  }

  const firstVoice = visibleVoices[0] ?? discoverItems[0]!;

  return (
    <ScreenContainer>
      <AppHeader eyebrow="Sesler" title="Keşfet" icon="search" />

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          placeholder="Ses veya konu ara"
          placeholderTextColor="#746b80"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.topicRow}>
        {topics.map((topic) => {
          const isActive = selectedTopic === topic.key;

          return (
            <Pressable
              accessibilityRole="button"
              key={topic.key}
              onPress={() => setSelectedTopic(topic.key)}
              style={[styles.topicChip, isActive && styles.topicChipActive]}
            >
              <Text
                style={[
                  styles.topicChipText,
                  isActive && styles.topicChipTextActive,
                ]}
              >
                {topic.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Anonim sesler</Text>
        <View style={styles.sectionActions}>
          <Text style={styles.sectionHint}>{visibleVoices.length} ses</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => prepareDiscoverDraft(firstVoice.threadId)}
            style={({ pressed }) => [
              styles.localAction,
              pressed && styles.localActionPressed,
            ]}
          >
            <Text style={styles.localActionText}>Ses bırak</Text>
          </Pressable>
        </View>
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

      <View style={styles.voiceList}>
        {visibleVoices.map((persona) => (
          <View key={persona.threadId} style={styles.voiceRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                openMemberProfile(persona.memberId, persona.threadId)
              }
              style={styles.waveThumb}
            >
              <BlurMediaThumb
                kind={getThumbKind(persona.contentType)}
                variant={persona.thumbnailVariant}
              />
              {persona.revealLabel === "Profil izni bekliyor" ? (
                <View style={styles.liveDot} />
              ) : null}
            </Pressable>

            <View style={styles.voiceCopy}>
              <View style={styles.voiceTop}>
                <Text numberOfLines={1} style={styles.voiceTitle}>
                  {persona.title}
                </Text>
                <Text style={styles.voiceDuration}>
                  {persona.lastVoiceDuration}
                </Text>
              </View>

              <Text numberOfLines={1} style={styles.voiceSubtitle}>
                {persona.voiceTitle}
              </Text>

              <View style={styles.tagLine}>
                {persona.tags.slice(0, 3).map((tag) => (
                  <Text key={tag} style={styles.tagText}>
                    #{tag}
                  </Text>
                ))}
              </View>

              <Text style={styles.voiceMeta}>
                {persona.lastActive} · {persona.replyCount} cevap ·{" "}
                {persona.revealLabel}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => openVoiceThread(persona.threadId)}
            >
              <Text style={styles.voiceAction}>Yanıtla</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => openVoiceThread(firstVoice.threadId)}
        style={styles.randomRow}
      >
        <View style={styles.randomMark}>
          <BlurMediaThumb kind="voice" variant="pink" />
        </View>
        <View style={styles.randomCopy}>
          <Text style={styles.randomTitle}>Rastgele anonim ses</Text>
          <Text style={styles.randomText}>
            Kimlik kapalı kalır. Merak edersen cevap ver.
          </Text>
        </View>
        <Text style={styles.randomAction}>Başlat</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 9,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  searchIcon: {
    color: "#bfb5d2",
    fontSize: 16,
    fontWeight: "900",
  },
  searchInput: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    padding: 0,
  },
  topicRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  topicChip: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  topicChipActive: {
    backgroundColor: "rgba(124, 58, 237, 0.16)",
    borderColor: "#5b3ca0",
  },
  topicChipText: {
    color: "#a99cbc",
    fontSize: 12,
    fontWeight: "800",
  },
  topicChipTextActive: {
    color: "#f0abfc",
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
  sectionActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  localAction: {
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    borderColor: "rgba(240, 171, 252, 0.18)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  localActionPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  localActionText: {
    color: "#f0abfc",
    fontSize: 11,
    fontWeight: "900",
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
  voiceList: {
    gap: 7,
  },
  voiceRow: {
    alignItems: "center",
    backgroundColor: "#0f0e15",
    borderColor: "#1d1924",
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    minHeight: 82,
    padding: 10,
  },
  waveThumb: {
    alignItems: "center",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    overflow: "hidden",
    width: 52,
  },
  liveDot: {
    backgroundColor: "#f0abfc",
    borderColor: "#111017",
    borderRadius: 999,
    borderWidth: 2,
    bottom: 4,
    height: 10,
    position: "absolute",
    right: 4,
    width: 10,
  },
  voiceCopy: {
    flex: 1,
  },
  voiceTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  voiceTitle: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
  },
  voiceDuration: {
    color: "#bfb5d2",
    fontSize: 11,
    fontWeight: "800",
  },
  voiceSubtitle: {
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
  voiceMeta: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
  voiceAction: {
    color: "#f0abfc",
    fontSize: 12,
    fontWeight: "900",
  },
  randomRow: {
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
  randomMark: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    overflow: "hidden",
    width: 48,
  },
  randomCopy: {
    flex: 1,
  },
  randomTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  randomText: {
    color: "#9d94aa",
    fontSize: 12,
    marginTop: 3,
  },
  randomAction: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "900",
  },
});
