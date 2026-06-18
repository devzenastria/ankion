import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../src/components/AppHeader";
import { BlurMediaThumb } from "../src/components/BlurMediaThumb";
import { ScreenContainer } from "../src/components/ScreenContainer";
import { VoiceWave } from "../src/components/VoiceWave";
import {
  createLocalThreadReplyPreview,
  createLocalThreadMediaReplyPreview,
  getLocalThreadMessages,
  getLocalThreadById,
  getSafeRevealDecisionLabel,
  type LocalThreadMessagePreview,
  type LocalThreadPreview,
} from "../src/data/localProductState";
import { getRevealDecision } from "../src/state/revealDecisionStore";

type ChatTab = "active" | "pending" | "archive";
type ChatSource = "feed" | "discover" | "home" | "chat";
type ConnectionStatus =
  | "Bekliyor"
  | "Son ses"
  | "Cevap bekliyor"
  | "Profil izni var"
  | "Kimlik kapalı"
  | "Profil açıldı"
  | "Anonim"
  | "Anonim devam"
  | "Anonim kalındı"
  | "Bağlantı kapalı"
  | "Engellendi";

type VoiceComposerMode = "replyable" | "waiting" | "closed";

type VoiceConnection = {
  id: string;
  memberId: string;
  title: string;
  subtitle: string;
  time: string;
  duration: string;
  status: ConnectionStatus;
  unread?: number;
  live?: boolean;
  variant: "purple" | "pink" | "orange";
};

function getConnectionVariant(
  thread: LocalThreadPreview,
): VoiceConnection["variant"] {
  if (thread.thumbnailVariant === "pink") {
    return "pink";
  }

  if (thread.isProfileVisible) {
    return "orange";
  }

  return "purple";
}

function getConnectionStatusFromThread(
  thread: LocalThreadPreview,
): ConnectionStatus {
  if (thread.statusLabel === "Profil açık") {
    return "Profil açıldı";
  }

  if (thread.statusLabel === "Profil izni bekliyor") {
    return "Profil izni var";
  }

  if (thread.statusLabel === "Son ses") {
    return "Son ses";
  }

  return "Kimlik kapalı";
}

function createConnection(
  threadId: string,
  overrides: Partial<VoiceConnection> = {},
): VoiceConnection {
  const thread = getLocalThreadById(threadId);

  return {
    id: thread.threadId,
    memberId: thread.memberId,
    title: thread.title,
    subtitle: thread.subtitle,
    time: thread.time,
    duration: thread.duration,
    status: getConnectionStatusFromThread(thread),
    variant: getConnectionVariant(thread),
    ...(thread.live ? { live: true } : {}),
    ...(thread.unreadCount ? { unread: thread.unreadCount } : {}),
    ...overrides,
  };
}

const tabs: Array<{ key: ChatTab; label: string }> = [
  { key: "active", label: "Aktif" },
  { key: "pending", label: "Bekleyen" },
  { key: "archive", label: "Arşiv" },
];

const activeConnections: VoiceConnection[] = [
  createConnection("night-walk", {
    status: "Profil izni var",
    unread: 2,
    live: true,
  }),
  createConnection("rain-after", {
    subtitle: "Cevabını bekliyor.",
    status: "Cevap bekliyor",
    live: true,
  }),
  createConnection("quiet-thought", {
    subtitle: "Profil izni verildi.",
    status: "Profil açıldı",
  }),
  createConnection("city-lights", {
    subtitle: "Cevabını bekliyor.",
    status: "Cevap bekliyor",
  }),
];

const pendingConnections: VoiceConnection[] = [
  createConnection("first-voice"),
  createConnection("short-curiosity"),
];

const archivedConnections: VoiceConnection[] = [
  createConnection("old-signal"),
];

function getEffectiveConnection(connection: VoiceConnection): VoiceConnection {
  const decision = getRevealDecision(connection.id);

  if (decision === "approved") {
    const decisionCopy = getSafeRevealDecisionLabel(decision);

    return {
      ...connection,
      status: decisionCopy.chatStatusLabel,
      subtitle: decisionCopy.chatText,
    };
  }

  if (decision === "private") {
    const decisionCopy = getSafeRevealDecisionLabel(decision);

    return {
      ...connection,
      status: decisionCopy.chatStatusLabel,
      subtitle: decisionCopy.chatText,
    };
  }

  if (decision === "blocked") {
    const decisionCopy = getSafeRevealDecisionLabel(decision);

    return {
      ...connection,
      status: decisionCopy.chatStatusLabel,
      subtitle: decisionCopy.chatText,

      live: false,
    };
  }

  return connection;
}

function getStatusStyle(status: ConnectionStatus) {
  if (status === "Profil açıldı") return styles.statusApproved;
  if (status === "Profil izni var") return styles.statusReveal;
  if (
    status === "Bekliyor" ||
    status === "Cevap bekliyor" ||
    status === "Anonim" ||
    status === "Anonim devam" ||
    status === "Anonim kalındı"
  )
    return styles.statusPassive;
  if (status === "Engellendi" || status === "Bağlantı kapalı")
    return styles.statusBlocked;
  return null;
}

function getConnectionSideLabel(connection: VoiceConnection) {
  const composerMode = getVoiceComposerMode(connection);

  if (composerMode === "closed") {
    return "Kapalı";
  }

  if (composerMode === "waiting") {
    return "Bekle";
  }

  return "Cevap";
}

function getConnectionTab(connection: VoiceConnection): ChatTab {
  if (archivedConnections.some((item) => item.id === connection.id)) {
    return "archive";
  }

  if (pendingConnections.some((item) => item.id === connection.id)) {
    return "pending";
  }

  return "active";
}

function getConnectionSignalText(connection: VoiceConnection) {
  return `${connection.status} ${connection.subtitle} ${connection.title}`
    .toLocaleLowerCase("tr-TR")
    .trim();
}

function isWaitingConnection(connection: VoiceConnection) {
  const signalText = getConnectionSignalText(connection);

  return (
    connection.status === "Bekliyor" ||
    connection.status === "Cevap bekliyor" ||
    signalText.includes("cevap bekliyor") ||
    signalText.includes("cevabını bekliyor") ||
    signalText.includes("waiting") ||
    signalText.includes("reply waiting")
  );
}

function getVoiceComposerMode(connection: VoiceConnection): VoiceComposerMode {
  const connectionTab = getConnectionTab(connection);

  if (
    connectionTab === "archive" ||
    connection.status === "Bağlantı kapalı" ||
    connection.status === "Engellendi"
  ) {
    return "closed";
  }

  if (connectionTab === "pending" || isWaitingConnection(connection)) {
    return "waiting";
  }

  return "replyable";
}

function getVoiceComposerCopy(
  connection: VoiceConnection,
  mode: VoiceComposerMode,
) {
  if (mode === "waiting") {
    return {
      sideLabel: "Bekle",
      text: "Karşı tarafın yeni sesini bekle.",
      title: "Cevap bekleniyor",
    };
  }

  if (mode === "closed") {
    return {
      sideLabel: "Kapalı",
      text: "Bu bağlantıda yeni ses gönderilemez.",
      title: "Bu bağlantı kapalı",
    };
  }

  if (connection.status === "Profil izni var") {
    return {
      sideLabel: "21 sn",
      text: "Profil izni var · Sesli bağlantı sürer",
      title: "Sese cevap ver",
    };
  }

  if (connection.status === "Profil açıldı") {
    return {
      sideLabel: "21 sn",
      text: "Profil açık · Sesli konuşma devam eder",
      title: "Sese cevap ver",
    };
  }

  return {
    sideLabel: "21 sn",
    text: "21 sn anonim ses · Profil kapalı",
    title: "Sese cevap ver",
  };
}

function getThreadHeaderCopy(
  connection: VoiceConnection,
  mode: VoiceComposerMode,
) {
  if (mode === "waiting") {
    return {
      text: "Karşı tarafın yeni sesini bekle.",
      title: "Cevap bekleniyor",
    };
  }

  if (mode === "closed") {
    return {
      text: "Bu bağlantıda yeni ses gönderilemez.",
      title: "Bağlantı kapalı",
    };
  }

  if (connection.status === "Profil izni var") {
    return {
      text: "Görünürlük bu bağlantıyla sınırlı.",
      title: "Profil izni var",
    };
  }

  if (connection.status === "Profil açıldı") {
    return {
      text: "Sesli konuşma devam eder.",
      title: "Profil bu bağlantıda açık",
    };
  }

  return {
    text: "Anonim sesle cevap verebilirsin.",
    title: "Kimlik kapalı",
  };
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    threadId?: string;
    source?: ChatSource;
  }>();
  const allConnections = [
    ...activeConnections,
    ...pendingConnections,
    ...archivedConnections,
  ].map(getEffectiveConnection);
  const selectedConnection =
    allConnections.find((connection) => connection.id === params.threadId) ??
    null;
  const voiceComposerMode = selectedConnection
    ? getVoiceComposerMode(selectedConnection)
    : "closed";
  const voiceComposerCopy = selectedConnection
    ? getVoiceComposerCopy(selectedConnection, voiceComposerMode)
    : null;
  const threadHeaderCopy = selectedConnection
    ? getThreadHeaderCopy(selectedConnection, voiceComposerMode)
    : null;

  const [activeTab, setActiveTab] = useState<ChatTab>("active");
  const [localRepliesByThread, setLocalRepliesByThread] = useState<
    Record<string, LocalThreadMessagePreview>
  >({});
  const [localMediaRepliesByThread, setLocalMediaRepliesByThread] = useState<
    Record<string, LocalThreadMessagePreview>
  >({});
  const localReply = selectedConnection
    ? localRepliesByThread[selectedConnection.id]
    : undefined;
  const localMediaReply = selectedConnection
    ? localMediaRepliesByThread[selectedConnection.id]
    : undefined;
  const threadMessages = selectedConnection
    ? [
        ...getLocalThreadMessages(selectedConnection.id),
        ...(localReply ? [localReply] : []),
        ...(localMediaReply ? [localMediaReply] : []),
      ]
    : [];

  const visibleConnections = (
    activeTab === "active"
      ? activeConnections
      : activeTab === "pending"
        ? pendingConnections
        : archivedConnections
  ).map(getEffectiveConnection);

  const backTarget =
    params.source === "feed"
      ? "/feed"
      : params.source === "discover"
        ? "/discover"
        : params.source === "home"
          ? "/"
          : "/chat";

  const backLabel =
    params.source === "feed"
      ? "Akış"
      : params.source === "discover"
        ? "Keşfet"
        : params.source === "home"
          ? "Ana Sayfa"
          : "Bağlantılar";

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (selectedConnection) {
          router.replace(backTarget as any);
          return true;
        }

        router.replace("/");
        return true;
      },
    );

    return () => subscription.remove();
  }, [backTarget, router, selectedConnection]);

  function openRevealRequests() {
    if (selectedConnection) {
      router.replace(
        `/reveal-requests?source=chat&threadId=${selectedConnection.id}` as any,
      );
      return;
    }

    router.replace("/reveal-requests");
  }

  function openConnection(connection: VoiceConnection) {
    router.replace(`/chat?threadId=${connection.id}&source=chat` as any);
  }

  function closeConnection() {
    router.replace(backTarget as any);
  }

  function openMemberProfile(connection: VoiceConnection) {
    const revealStatus =
      connection.status === "Profil açıldı" ||
      connection.status === "Profil izni var"
        ? "approved"
        : "pending";

    router.replace(
      `/member-profile?memberId=${connection.memberId}&threadId=${connection.id}&source=chat&revealStatus=${revealStatus}` as any,
    );
  }

  function changeTab(tab: ChatTab) {
    if (activeTab === tab) {
      return;
    }

    setActiveTab(tab);
  }

  function prepareLocalReply() {
    if (!selectedConnection) {
      return;
    }

    if (getVoiceComposerMode(selectedConnection) !== "replyable") {
      return;
    }

    const reply = createLocalThreadReplyPreview(selectedConnection.id);

    setLocalRepliesByThread((current) => ({
      ...current,
      [selectedConnection.id]: {
        ...reply,
        label: "Sesli cevap hazır",
        text: "Karşılık gelirse sohbet burada devam eder.",
      },
    }));
  }

  function prepareLocalMediaReply() {
    if (!selectedConnection) {
      return;
    }

    if (getVoiceComposerMode(selectedConnection) !== "replyable") {
      return;
    }

    const reply = createLocalThreadMediaReplyPreview(selectedConnection.id);

    setLocalMediaRepliesByThread((current) => ({
      ...current,
      [selectedConnection.id]: reply,
    }));
  }

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow={selectedConnection ? "Özel bağlantı" : "Bağlantılar"}
        title={
          selectedConnection ? selectedConnection.title : "Ses bağlantıları"
        }
        {...(selectedConnection
          ? {}
          : {
              actionLabel: "İzinler",
              actionHref: "/reveal-requests" as const,
            })}
      />

      {selectedConnection ? (
        <View style={styles.threadShell}>
          <View style={styles.backRow}>
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={closeConnection}
            >
              <Text style={styles.backText}>‹ {backLabel}</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => openMemberProfile(selectedConnection)}
            style={styles.threadStatus}
          >
            <View style={styles.threadAvatar}>
              <BlurMediaThumb
                kind="voice"
                variant={
                  selectedConnection.variant === "pink" ? "pink" : "purple"
                }
              />
              {selectedConnection.live ? <View style={styles.liveDot} /> : null}
            </View>

            <View style={styles.threadCopy}>
              <View style={styles.threadTitleRow}>
                <Text numberOfLines={1} style={styles.threadTitle}>
                  {threadHeaderCopy?.title}
                </Text>

                <View
                  style={[
                    styles.threadStatusBadge,
                    (selectedConnection.status === "Profil açıldı" ||
                      selectedConnection.status === "Profil izni var") &&
                      styles.threadStatusBadgeApproved,
                    (selectedConnection.status === "Anonim" ||
                      selectedConnection.status === "Anonim devam" ||
                      selectedConnection.status === "Anonim kalındı") &&
                      styles.threadStatusBadgePrivate,
                    (selectedConnection.status === "Engellendi" ||
                      selectedConnection.status === "Bağlantı kapalı") &&
                      styles.threadStatusBadgeBlocked,
                  ]}
                >
                  <Text style={styles.threadStatusBadgeText}>
                    {selectedConnection.status}
                  </Text>
                </View>
              </View>

              <Text numberOfLines={1} style={styles.threadText}>
                {threadHeaderCopy?.text}
              </Text>
            </View>

            <Text style={styles.threadDuration}>
              {selectedConnection.duration}
            </Text>
          </Pressable>

          <View style={styles.threadHint}>
            <Text style={styles.threadHintText}>
              Keşif ve Akıştan gelen sesler burada bağlantıya döner. Profil izni ayrı kalır.
            </Text>
          </View>

          <View style={styles.bubbleList}>
            {threadMessages.map((bubble) => {
              const isOutgoing = bubble.direction === "outgoing";

              return (
                <View
                  key={bubble.id}
                  style={[
                    styles.voiceBubble,
                    isOutgoing && styles.voiceBubbleOutgoing,
                  ]}
                >
                  <View style={styles.bubbleTop}>
                    <Text style={styles.bubbleLabel}>{bubble.label}</Text>
                    <Text style={styles.bubbleDuration}>{bubble.duration}</Text>
                  </View>

                  <View style={styles.bubbleWave}>
                    <VoiceWave size="sm" variant={bubble.variant} />
                  </View>

                  {bubble.state === "local" ? (
                    <Text style={styles.localBubbleText}>{bubble.text}</Text>
                  ) : null}

                  <Text
                    style={[
                      styles.bubbleTime,
                      isOutgoing && styles.bubbleTimeOutgoing,
                    ]}
                  >
                    {bubble.time}
                  </Text>
                </View>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={openRevealRequests}
            style={styles.revealRow}
          >
            <View style={styles.revealMark}>
              <Text style={styles.revealMarkText}>○</Text>
            </View>

            <View style={styles.revealCopy}>
              <Text style={styles.revealTitle}>Profil izni</Text>
              <Text style={styles.revealText}>
                Profil yalnızca izin verilirse bu bağlantıda görünür.
              </Text>
            </View>

            <Text style={styles.revealAction}>İzin iste</Text>
          </Pressable>

          {voiceComposerMode === "replyable" ? (
            <View style={styles.replyComposerStack}>
              <Pressable
                accessibilityLabel="Yerel sesli cevap hazırla"
                accessibilityRole="button"
                onPress={prepareLocalReply}
                style={({ pressed }) => [
                  styles.composer,
                  pressed && styles.composerPressed,
                ]}
              >
                <View style={styles.micButton}>
                  <Text style={styles.micText}>●</Text>
                </View>

                <View style={styles.composerCopy}>
                  <Text style={styles.composerTitle}>
                    {voiceComposerCopy?.title}
                  </Text>
                  <Text style={styles.composerText}>
                    {voiceComposerCopy?.text}
                  </Text>
                </View>

                <Text style={styles.holdText}>
                  {voiceComposerCopy?.sideLabel}
                </Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Yerel kamera yanıtı hazırla"
                accessibilityRole="button"
                onPress={prepareLocalMediaReply}
                style={({ pressed }) => [
                  styles.mediaComposer,
                  pressed && styles.mediaComposerPressed,
                ]}
              >
                <View style={styles.mediaButton}>
                  <Text style={styles.mediaButtonText}>□</Text>
                </View>
                <View style={styles.composerCopy}>
                  <Text style={styles.mediaComposerTitle}>Kamera</Text>
                  <Text style={styles.mediaComposerText}>
                    Fotoğraf / Video yerel taslak
                  </Text>
                </View>
                <Text style={styles.holdText}>Taslak</Text>
              </Pressable>
            </View>
          ) : (
            <View
              style={[
                styles.composer,
                styles.composerPassive,
                voiceComposerMode === "closed" && styles.composerClosed,
              ]}
            >
              <View
                style={[
                  styles.micButton,
                  styles.micButtonPassive,
                  voiceComposerMode === "closed" && styles.micButtonClosed,
                ]}
              >
                <Text style={[styles.micText, styles.micTextPassive]}>
                  {voiceComposerMode === "waiting" ? "…" : "×"}
                </Text>
              </View>

              <View style={styles.composerCopy}>
                <Text style={styles.composerTitle}>
                  {voiceComposerCopy?.title}
                </Text>
                <Text style={styles.composerText}>
                  {voiceComposerCopy?.text}
                </Text>
              </View>

              <Text style={styles.holdTextPassive}>
                {voiceComposerCopy?.sideLabel}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <>
          <View style={styles.tabRow}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={tab.key}
                  onPress={() => changeTab(tab.key)}
                  style={[styles.tab, isActive && styles.tabActive]}
                >
                  <Text
                    style={[styles.tabText, isActive && styles.tabTextActive]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.connectionList}>
            {visibleConnections.map((connection) => (
              <Pressable
                accessibilityRole="button"
                key={connection.id}
                onPress={() => openConnection(connection)}
                style={styles.connectionRow}
              >
                <View style={styles.connectionThumb}>
                  <BlurMediaThumb
                    kind="voice"
                    variant={connection.variant === "pink" ? "pink" : "purple"}
                  />
                  {connection.live ? (
                    <View style={styles.smallLiveDot} />
                  ) : null}
                </View>

                <View style={styles.connectionCopy}>
                  <View style={styles.connectionTop}>
                    <Text numberOfLines={1} style={styles.connectionTitle}>
                      {connection.title}
                    </Text>
                    <Text style={styles.connectionTime}>{connection.time}</Text>
                  </View>

                  <Text numberOfLines={1} style={styles.connectionSubtitle}>
                    {connection.subtitle}
                  </Text>

                  <View style={styles.connectionMetaRow}>
                    <Text style={styles.connectionMeta}>
                      {connection.duration}
                    </Text>
                    <Text
                      style={[
                        styles.connectionStatus,
                        getStatusStyle(connection.status),
                      ]}
                    >
                      {connection.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.connectionSide}>
                  {connection.unread ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{connection.unread}</Text>
                    </View>
                  ) : null}
                  <Text
                    style={[
                      styles.answerText,
                      getVoiceComposerMode(connection) === "waiting" &&
                        styles.answerTextPassive,
                      getVoiceComposerMode(connection) === "closed" &&
                        styles.answerTextClosed,
                    ]}
                  >
                    {getConnectionSideLabel(connection)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoTitle}>Keşiften sohbete</Text>
            <Text style={styles.infoText}>
              Keşif ve Akıştan gelen sesler burada devam eder. Profil yalnızca ilgili bağlantıda izinle görünür.
            </Text>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    backgroundColor: "#111017",
    borderColor: "#272331",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    padding: 4,
  },
  tab: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: "#21183a",
  },
  tabText: {
    color: "#9d94aa",
    fontSize: 12,
    fontWeight: "800",
  },
  tabTextActive: {
    color: "#f0abfc",
  },
  connectionList: {
    gap: 8,
  },
  connectionRow: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderBottomColor: "#201c27",
    borderBottomWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    minHeight: 72,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  connectionThumb: {
    alignItems: "center",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    overflow: "hidden",
    width: 52,
  },
  smallLiveDot: {
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
  connectionCopy: {
    flex: 1,
  },
  connectionTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  connectionTitle: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
  },
  connectionTime: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "700",
  },
  connectionSubtitle: {
    color: "#a99cbc",
    fontSize: 12,
    marginTop: 3,
  },
  connectionMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 4,
  },
  connectionMeta: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "700",
  },
  connectionStatus: {
    color: "#bfb5d2",
    fontSize: 11,
    fontWeight: "800",
  },
  statusApproved: {
    color: "#86efac",
  },
  statusReveal: {
    color: "#f0abfc",
  },
  statusPassive: {
    color: "#9d94aa",
  },
  statusBlocked: {
    color: "#fca5a5",
  },
  connectionSide: {
    alignItems: "flex-end",
    gap: 6,
  },
  unreadBadge: {
    alignItems: "center",
    backgroundColor: "#7c3aed",
    borderRadius: 999,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  unreadText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },
  answerText: {
    color: "#f0abfc",
    fontSize: 12,
    fontWeight: "900",
  },
  answerTextPassive: {
    color: "#9d94aa",
  },
  answerTextClosed: {
    color: "#fca5a5",
  },
  infoRow: {
    backgroundColor: "#0d0c12",
    borderColor: "#24202d",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  infoTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  infoText: {
    color: "#9d94aa",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  threadShell: {
    gap: 9,
  },
  backRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  backText: {
    color: "#d7cdf0",
    fontSize: 13,
    fontWeight: "900",
  },
  threadStatus: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 72,
    padding: 10,
  },
  threadAvatar: {
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
  threadCopy: {
    flex: 1,
  },
  threadTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  threadTitle: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
  },
  threadStatusBadge: {
    backgroundColor: "#21183a",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  threadStatusBadgeApproved: {
    backgroundColor: "#12351f",
  },
  threadStatusBadgePrivate: {
    backgroundColor: "#1a1720",
  },
  threadStatusBadgeBlocked: {
    backgroundColor: "#2a1118",
  },
  threadStatusBadgeText: {
    color: "#f0abfc",
    fontSize: 9,
    fontWeight: "900",
  },
  threadText: {
    color: "#a99cbc",
    fontSize: 12,
    marginTop: 3,
  },
  threadDuration: {
    color: "#bfb5d2",
    fontSize: 12,
    fontWeight: "900",
  },
  threadHint: {
    backgroundColor: "#0d0c12",
    borderColor: "#24202d",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  threadHintText: {
    color: "#9d94aa",
    fontSize: 12,
    lineHeight: 16,
  },
  bubbleList: {
    gap: 8,
  },
  voiceBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#111017",
    borderColor: "#211d29",
    borderRadius: 15,
    borderWidth: 1,
    maxWidth: "86%",
    padding: 10,
  },
  voiceBubbleOutgoing: {
    alignSelf: "flex-end",
    backgroundColor: "#1b1430",
    borderColor: "#352852",
  },
  bubbleTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
  },
  bubbleLabel: {
    color: "#fff7ed",
    fontSize: 13,
    fontWeight: "900",
  },
  bubbleDuration: {
    color: "#bfb5d2",
    fontSize: 11,
    fontWeight: "900",
  },
  bubbleWave: {
    marginTop: 8,
    minWidth: 136,
  },
  localBubbleText: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  bubbleTime: {
    color: "#817889",
    fontSize: 11,
    marginTop: 5,
  },
  bubbleTimeOutgoing: {
    textAlign: "right",
  },
  revealRow: {
    alignItems: "center",
    backgroundColor: "#100e15",
    borderColor: "#24202d",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 64,
    padding: 9,
  },
  revealMark: {
    alignItems: "center",
    backgroundColor: "#191329",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  revealMarkText: {
    color: "#f0abfc",
    fontSize: 19,
    fontWeight: "900",
  },
  revealCopy: {
    flex: 1,
  },
  revealTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  revealText: {
    color: "#9d94aa",
    fontSize: 12,
    marginTop: 3,
  },
  revealAction: {
    color: "#f0abfc",
    fontSize: 12,
    fontWeight: "900",
  },
  replyComposerStack: {
    gap: 8,
  },
  mediaComposer: {
    alignItems: "center",
    backgroundColor: "#100f16",
    borderColor: "#24202d",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    minHeight: 56,
    padding: 9,
  },
  mediaComposerPressed: {
    opacity: 0.78,
  },
  mediaButton: {
    alignItems: "center",
    backgroundColor: "#1d1727",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  mediaButtonText: {
    color: "#f0abfc",
    fontSize: 14,
    fontWeight: "900",
  },
  mediaComposerTitle: {
    color: "#fff7ed",
    fontSize: 13,
    fontWeight: "900",
  },
  mediaComposerText: {
    color: "#9d94aa",
    fontSize: 12,
    marginTop: 2,
  },  composer: {
    alignItems: "center",
    backgroundColor: "#111017",
    borderColor: "#2d2638",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 66,
    padding: 10,
  },
  composerPressed: {
    opacity: 0.78,
  },
  composerPassive: {
    backgroundColor: "#0d0c12",
    borderColor: "#24202d",
  },
  composerClosed: {
    backgroundColor: "#100e12",
    borderColor: "#2d2630",
  },
  micButton: {
    alignItems: "center",
    backgroundColor: "#7c3aed",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  micButtonPassive: {
    backgroundColor: "#1a1720",
  },
  micButtonClosed: {
    backgroundColor: "#241821",
  },
  micText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  micTextPassive: {
    color: "#9d94aa",
  },
  composerCopy: {
    flex: 1,
  },
  composerTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  composerText: {
    color: "#9d94aa",
    fontSize: 12,
    marginTop: 3,
  },
  holdText: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "900",
  },
  holdTextPassive: {
    color: "#817889",
    fontSize: 12,
    fontWeight: "900",
  },
});
