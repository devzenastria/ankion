import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../src/components/AppHeader";
import { BlurMediaThumb } from "../src/components/BlurMediaThumb";
import { ScreenContainer } from "../src/components/ScreenContainer";
import {
  getLocalRevealRequestByThreadId,
  getSafeRevealDecisionLabel,
} from "../src/data/localProductState";
import {
  getIncomingRevealDecision,
  getSentRevealDecision,
  setRevealOwnerDecision,
  unblockRevealConnection,
  type RevealDecision,
} from "../src/state/revealDecisionStore";

type RevealTab = "incoming" | "sent" | "history";
type RevealSource = "home" | "chat" | "feed" | "discover" | "profile" | "reveal";

type PermissionRequest = {
  id: string;
  memberId: string;
  threadId: string;
  title: string;
  subtitle: string;
  time: string;
  duration: string;
  status: string;
};

function createPermissionRequest(
  threadId: string,
  overrides: Partial<PermissionRequest> = {},
): PermissionRequest {
  const request = getLocalRevealRequestByThreadId(threadId);

  return {
    id: request.requestId,
    memberId: request.memberId,
    threadId: request.threadId,
    title: request.title,
    subtitle: request.subtitle,
    time: request.time,
    duration: request.duration,
    status: request.statusLabel,
    ...overrides,
  };
}

const tabs: Array<{ key: RevealTab; label: string }> = [
  { key: "incoming", label: "Gelen" },
  { key: "sent", label: "Gönderilen" },
  { key: "history", label: "Geçmiş" },
];

const requests: Record<RevealTab, PermissionRequest[]> = {
  incoming: [
    createPermissionRequest("night-walk", {
      id: "incoming-night",
      subtitle: "Son sesinden sonra",
      status: "Yeni",
    }),
    createPermissionRequest("rain-after", {
      id: "incoming-rain",
      title: "Profil izni bekliyor",
      subtitle: "Cevabından sonra",
      time: "12 dk",
      status: "Bekliyor",
    }),
  ],
  sent: [
    createPermissionRequest("night-walk", {
      id: "sent-night",
      title: "Profil isteği gönderildi",
      subtitle: "Gece yürüyüşü için",
      status: "Bekliyor",
    }),
    createPermissionRequest("rain-after", {
      id: "sent-rain",
      title: "Profil isteği gönderildi",
      subtitle: "Yağmurdan sonra için",
      status: "Bekliyor",
    }),
    createPermissionRequest("quiet-thought", {
      id: "sent-quiet",
      title: "Profil izni verildi",
      subtitle: "Sessiz düşünce bağlantısı",
      time: "1 saat",
      status: "İzinli",
    }),
  ],
  history: [
    createPermissionRequest("city-lights", {
      id: "history-city",
      title: "Anonim kalındı",
      subtitle: "Şehrin ışıkları bağlantısı",
      time: "dün",
      status: "Anonim",
    }),
  ],
};

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeTab(value: string | string[] | undefined): RevealTab | undefined {
  const normalized = normalizeParam(value);

  if (
    normalized === "incoming" ||
    normalized === "sent" ||
    normalized === "history"
  ) {
    return normalized;
  }

  return undefined;
}

function getInitialTab(
  source: string | undefined,
  requestedTab: RevealTab | undefined,
): RevealTab {
  if (requestedTab) {
    return requestedTab;
  }

  if (source === "home" || source === "feed" || source === "discover") {
    return "sent";
  }

  return "incoming";
}

function getBackTarget(
  backSource: string | undefined,
  backThreadId: string | undefined,
) {
  if (backSource === "chat" && backThreadId) {
    return `/chat?threadId=${backThreadId}`;
  }

  if (backSource === "feed") {
    return "/feed";
  }

  if (backSource === "discover") {
    return "/discover";
  }

  if (backSource === "profile") {
    return "/profile";
  }

  if (backSource === "reveal" && backThreadId) {
    return `/reveal-requests?source=reveal&threadId=${backThreadId}`;
  }

  return "/";
}

function findRequest(
  tab: RevealTab,
  threadId?: string,
  memberId?: string,
): PermissionRequest | undefined {
  return requests[tab].find(
    (request) =>
      (!threadId || request.threadId === threadId) &&
      (!memberId || request.memberId === memberId),
  );
}

function getSelectedFallback(tab: RevealTab) {
  return requests[tab][0] ?? requests.incoming[0];
}

function getStaticDecision(request: PermissionRequest | undefined): RevealDecision | null {
  if (!request) {
    return null;
  }

  if (request.status === "İzinli") {
    return "approved";
  }

  if (request.status === "Anonim") {
    return "private";
  }

  if (request.status === "Engellendi") {
    return "blocked";
  }

  return null;
}

function getIncomingDecision(request: PermissionRequest | undefined): RevealDecision {
  const staticDecision = getStaticDecision(request);

  if (staticDecision) {
    return staticDecision;
  }

  return getIncomingRevealDecision(request?.threadId);
}

function getSentDecision(request: PermissionRequest | undefined): RevealDecision {
  const staticDecision = getStaticDecision(request);

  if (staticDecision) {
    return staticDecision;
  }

  return getSentRevealDecision(request?.threadId);
}

function getRequestDecision(
  tab: RevealTab,
  request: PermissionRequest | undefined,
): RevealDecision {
  if (tab === "incoming") {
    return getIncomingDecision(request);
  }

  if (tab === "sent") {
    return getSentDecision(request);
  }

  return getStaticDecision(request) ?? "private";
}

function getSentTitle(decision: RevealDecision) {
  if (
    decision === "approved" ||
    decision === "private" ||
    decision === "blocked"
  ) {
    return getSafeRevealDecisionLabel(decision).title;
  }

  return "Profil isteği gönderildi";
}

function getSentText(decision: RevealDecision) {
  if (
    decision === "approved" ||
    decision === "private" ||
    decision === "blocked"
  ) {
    return getSafeRevealDecisionLabel(decision).text;
  }

  return "Karşı taraf karar verene kadar profil kapalı kalır.";
}

function getDecisionStatusLabel(
  tab: RevealTab,
  decision: RevealDecision,
  request?: PermissionRequest,
) {
  if (
    decision === "approved" ||
    decision === "private" ||
    decision === "blocked"
  ) {
    return getSafeRevealDecisionLabel(decision).statusLabel;
  }

  if (tab === "incoming" && decision === "pending") {
    return request?.status === "Yeni" ? "Yeni" : "Bekliyor";
  }

  return "Bekliyor";
}

function getIncomingTitle(decision: RevealDecision, fallback: string) {
  if (
    decision === "approved" ||
    decision === "private" ||
    decision === "blocked"
  ) {
    return getSafeRevealDecisionLabel(decision).title;
  }

  return fallback;
}

function getIncomingText(decision: RevealDecision) {
  if (
    decision === "approved" ||
    decision === "private" ||
    decision === "blocked"
  ) {
    return getSafeRevealDecisionLabel(decision).text;
  }

  return "Profili gösterirsen sadece bu bağlantıda görünür. Anonim kalırsan ses devam eder.";
}

function getRequestMetaLabel(decision: RevealDecision) {
  return getSafeRevealDecisionLabel(decision).metaLabel;
}

export default function RevealRequestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    source?: RevealSource;
    threadId?: string;
    memberId?: string;
    tab?: RevealTab;
  }>();

  const source = normalizeParam(params.source);
  const sourceThreadId = normalizeParam(params.threadId);
  const sourceMemberId = normalizeParam(params.memberId);
  const requestedTab = normalizeTab(params.tab);
  const initialTab = getInitialTab(source, requestedTab);
  const initialRequest =
    findRequest(initialTab, sourceThreadId, sourceMemberId) ??
    getSelectedFallback(initialTab);

  const [activeTab, setActiveTab] = useState<RevealTab>(initialTab);
  const [selectedRequestId, setSelectedRequestId] = useState(
    initialRequest?.id ?? "",
  );
  const [stateVersion, setStateVersion] = useState(0);

  const list = requests[activeTab];
  const selectedRequest =
    list.find((request) => request.id === selectedRequestId) ??
    findRequest(activeTab, sourceThreadId, sourceMemberId) ??
    getSelectedFallback(activeTab);

  const selectedDecision = getRequestDecision(activeTab, selectedRequest);
  const selectedDecisionCopy = getSafeRevealDecisionLabel(selectedDecision);

  useEffect(() => {
    const nextTab = getInitialTab(source, requestedTab);
    const nextRequest =
      findRequest(nextTab, sourceThreadId, sourceMemberId) ??
      getSelectedFallback(nextTab);

    setActiveTab(nextTab);
    setSelectedRequestId(nextRequest?.id ?? "");
  }, [requestedTab, source, sourceMemberId, sourceThreadId]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace(getBackTarget(source, sourceThreadId) as any);
        return true;
      },
    );

    return () => subscription.remove();
  }, [router, source, sourceThreadId]);

  function openChat(threadId = selectedRequest?.threadId ?? "night-walk") {
    router.replace(`/chat?threadId=${threadId}`);
  }

  function openMemberProfile(
    memberId = selectedRequest?.memberId ?? "member-night",
    threadId = selectedRequest?.threadId ?? "night-walk",
  ) {
    router.replace(
      `/member-profile?memberId=${memberId}&threadId=${threadId}&source=reveal&revealStatus=approved`,
    );
  }

  function selectTab(tab: RevealTab) {
    const nextRequest =
      findRequest(tab, sourceThreadId, sourceMemberId) ??
      getSelectedFallback(tab);

    setActiveTab(tab);
    setSelectedRequestId(nextRequest?.id ?? "");
  }

  function selectRequest(request: PermissionRequest) {
    setSelectedRequestId(request.id);
  }

  function saveDecision(
    nextDecision: Exclude<RevealDecision, "pending" | "sent">,
  ) {
    if (!selectedRequest) {
      return;
    }

    setRevealOwnerDecision(selectedRequest.threadId, nextDecision);
    setStateVersion((current) => current + 1);
  }

  function unblockConnection() {
    if (!selectedRequest) {
      return;
    }

    unblockRevealConnection(selectedRequest.threadId);
    setStateVersion((current) => current + 1);
  }

  function getRequestStatus(request: PermissionRequest) {
    const decision = getRequestDecision(activeTab, request);

    return getDecisionStatusLabel(activeTab, decision, request);
  }

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="İzinler"
        title="Profil izinleri"
        actionLabel="Profil"
        actionHref="/profile"
      />

      <View style={styles.summaryRow}>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>
            {activeTab === "sent" ? "İsteklerin" : "Kontrol sende"}
          </Text>
          <Text style={styles.summaryText}>
            {activeTab === "sent"
              ? "Gönderdiğin profil istekleri karşı tarafın kararını bekler."
              : "Profilin sen izin vermeden görünmez."}
          </Text>
        </View>
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryBadgeText}>{list.length}</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              accessibilityRole="button"
              key={tab.key}
              onPress={() => selectTab(tab.key)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === "incoming" && selectedRequest ? (
        <View style={styles.permissionCard}>
          <View style={styles.permissionTop}>
            <View style={styles.avatar}>
              <BlurMediaThumb kind="voice" variant="pink" />
            </View>
            <View style={styles.permissionCopy}>
              <View style={styles.permissionTitleRow}>
                <Text style={styles.permissionTitle}>
                  {getIncomingTitle(selectedDecision, selectedRequest.title)}
                </Text>
                <Text
                  style={[
                    styles.permissionStatus,
                    selectedDecision === "approved" && styles.statusApproved,
                    selectedDecision === "private" && styles.statusPassive,
                    selectedDecision === "blocked" && styles.statusBlocked,
                  ]}
                >
                  {getDecisionStatusLabel(
                    activeTab,
                    selectedDecision,
                    selectedRequest,
                  )}
                </Text>
              </View>
              <Text style={styles.permissionText}>
                {getIncomingText(selectedDecision)}
              </Text>
            </View>
          </View>

          <View style={styles.voiceContext}>
            <Text style={styles.voiceTitle}>Anonim ses</Text>
            <View style={styles.voiceWave}>
              <BlurMediaThumb kind="voice" variant="purple" />
            </View>
            <Text style={styles.voiceMeta}>{selectedRequest.duration}</Text>
          </View>

          {selectedDecision === "pending" ? (
            <>
              <View style={styles.actionRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => saveDecision("approved")}
                  style={styles.primaryAction}
                >
                  <Text style={styles.primaryActionText}>Profili göster</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => saveDecision("private")}
                  style={styles.secondaryAction}
                >
                  <Text style={styles.secondaryActionText}>Anonim kal</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => saveDecision("blocked")}
                style={styles.blockAction}
              >
                <Text style={styles.blockActionText}>Güvenlik: engelle</Text>
              </Pressable>
            </>
          ) : null}

          {selectedDecision === "approved" ? (
            <View style={styles.decisionBoxApproved}>
              <Text style={styles.decisionTitleApproved}>
                {selectedDecisionCopy.title}
              </Text>
              <Text style={styles.decisionText}>
                {selectedDecisionCopy.text}
              </Text>

              <View style={styles.nextActionRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    openMemberProfile(
                      selectedRequest.memberId,
                      selectedRequest.threadId,
                    )
                  }
                  style={styles.nextPrimary}
                >
                  <Text style={styles.nextPrimaryText}>Profili gör</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openChat(selectedRequest.threadId)}
                  style={styles.nextSecondary}
                >
                  <Text style={styles.nextSecondaryText}>Bağlantıya dön</Text>
                </Pressable>
              </View>

              <View style={styles.nextActionRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => saveDecision("private")}
                  style={styles.nextSecondary}
                >
                  <Text style={styles.nextSecondaryText}>Anonim kal</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => saveDecision("blocked")}
                  style={styles.nextDanger}
                >
                  <Text style={styles.nextDangerText}>Güvenlik: engelle</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {selectedDecision === "private" ? (
            <View style={styles.decisionBoxPrivate}>
              <Text style={styles.decisionTitlePrivate}>
                {selectedDecisionCopy.title}
              </Text>
              <Text style={styles.decisionText}>
                {selectedDecisionCopy.text}
              </Text>

              <View style={styles.nextActionRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => saveDecision("approved")}
                  style={styles.nextPrimary}
                >
                  <Text style={styles.nextPrimaryText}>Profili göster</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openChat(selectedRequest.threadId)}
                  style={styles.nextSecondary}
                >
                  <Text style={styles.nextSecondaryText}>Bağlantıya dön</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => saveDecision("blocked")}
                style={styles.blockAction}
              >
                <Text style={styles.blockActionText}>Güvenlik: engelle</Text>
              </Pressable>
            </View>
          ) : null}

          {selectedDecision === "blocked" ? (
            <View style={styles.decisionBoxBlocked}>
              <Text style={styles.decisionTitleBlocked}>
                {selectedDecisionCopy.title}
              </Text>
              <Text style={styles.decisionText}>
                {selectedDecisionCopy.text}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={unblockConnection}
                style={styles.singleSecondary}
              >
                <Text style={styles.nextSecondaryText}>Engeli kaldır</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      {activeTab === "sent" && selectedRequest ? (
        <View style={styles.permissionCard}>
          <View style={styles.permissionTop}>
            <View style={styles.avatar}>
              <BlurMediaThumb kind="voice" variant="pink" />
            </View>
            <View style={styles.permissionCopy}>
              <View style={styles.permissionTitleRow}>
                <Text style={styles.permissionTitle}>
                  {getSentTitle(selectedDecision)}
                </Text>
                <Text
                  style={[
                    styles.permissionStatus,
                    selectedDecision === "approved" && styles.statusApproved,
                    selectedDecision === "private" && styles.statusPassive,
                    selectedDecision === "blocked" && styles.statusBlocked,
                  ]}
                >
                  {getDecisionStatusLabel(
                    activeTab,
                    selectedDecision,
                    selectedRequest,
                  )}
                </Text>
              </View>
              <Text style={styles.permissionText}>
                {getSentText(selectedDecision)}
              </Text>
            </View>
          </View>

          <View style={styles.voiceContext}>
            <Text style={styles.voiceTitle}>İstek bağlamı</Text>
            <View style={styles.voiceWave}>
              <BlurMediaThumb kind="voice" variant="purple" />
            </View>
            <Text style={styles.voiceMeta}>{selectedRequest.duration}</Text>
          </View>

          {(selectedDecision === "pending" || selectedDecision === "sent") ? (
            <View style={styles.sentInfoBox}>
              <Text style={styles.sentInfoTitle}>Bekleniyor</Text>
              <Text style={styles.decisionText}>
                Profil sahibinin kararı olmadan gerçek profil açılmaz.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => openChat(selectedRequest.threadId)}
                style={styles.singleSecondary}
              >
                <Text style={styles.nextSecondaryText}>Bağlantıya dön</Text>
              </Pressable>
            </View>
          ) : null}

          {selectedDecision === "approved" ? (
            <View style={styles.decisionBoxApproved}>
              <Text style={styles.decisionTitleApproved}>
                {selectedDecisionCopy.title}
              </Text>
              <Text style={styles.decisionText}>
                {selectedDecisionCopy.text}
              </Text>
              <View style={styles.nextActionRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    openMemberProfile(
                      selectedRequest.memberId,
                      selectedRequest.threadId,
                    )
                  }
                  style={styles.nextPrimary}
                >
                  <Text style={styles.nextPrimaryText}>Profili gör</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openChat(selectedRequest.threadId)}
                  style={styles.nextSecondary}
                >
                  <Text style={styles.nextSecondaryText}>Bağlantıya dön</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {selectedDecision === "private" ? (
            <View style={styles.decisionBoxPrivate}>
              <Text style={styles.decisionTitlePrivate}>
                {selectedDecisionCopy.title}
              </Text>
              <Text style={styles.decisionText}>
                {selectedDecisionCopy.text}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => openChat(selectedRequest.threadId)}
                style={styles.singleSecondary}
              >
                <Text style={styles.nextSecondaryText}>Bağlantıya dön</Text>
              </Pressable>
            </View>
          ) : null}

          {selectedDecision === "blocked" ? (
            <View style={styles.decisionBoxBlocked}>
              <Text style={styles.decisionTitleBlocked}>
                {selectedDecisionCopy.title}
              </Text>
              <Text style={styles.decisionText}>
                {selectedDecisionCopy.text}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.requestList}>
        {list.map((request) => {
          const isSelected = selectedRequestId === request.id;
          const requestDecision = getRequestDecision(activeTab, request);
          const requestStatus = getRequestStatus(request);

          return (
            <Pressable
              accessibilityRole="button"
              key={`${request.id}-${stateVersion}`}
              onPress={() => selectRequest(request)}
              style={[styles.requestRow, isSelected && styles.requestRowActive]}
            >
              <View style={styles.requestWave}>
                <BlurMediaThumb kind="voice" variant="purple" />
              </View>
              <View style={styles.requestCopy}>
                <Text numberOfLines={1} style={styles.requestTitle}>
                  {activeTab === "sent"
                    ? getSentTitle(getRequestDecision("sent", request))
                    : activeTab === "incoming"
                      ? getIncomingTitle(
                          getRequestDecision("incoming", request),
                          request.title,
                        )
                      : request.title}
                </Text>
                <Text numberOfLines={1} style={styles.requestSubtitle}>
                  {request.subtitle} · {request.time}
                </Text>
                <Text style={styles.requestMeta}>
                  {request.duration} · {getRequestMetaLabel(requestDecision)}
                </Text>
              </View>
              <Text
                style={[
                  styles.statusText,
                  requestStatus === "Profil açıldı" && styles.statusApproved,
                  (requestStatus === "Bekliyor" ||
                    requestStatus === "Yeni" ||
                    requestStatus === "Anonim kalındı") &&
                    styles.statusPassive,
                  requestStatus === "Engellendi" && styles.statusBlocked,
                ]}
              >
                {requestStatus}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 72,
    padding: 12,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    color: "#fff7ed",
    fontSize: 16,
    fontWeight: "900",
  },
  summaryText: {
    color: "#a99cbc",
    fontSize: 12,
    marginTop: 4,
  },
  summaryBadge: {
    alignItems: "center",
    backgroundColor: "#21183a",
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  summaryBadgeText: {
    color: "#f0abfc",
    fontSize: 12,
    fontWeight: "900",
  },
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
  permissionCard: {
    backgroundColor: "#111017",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  permissionTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    overflow: "hidden",
    width: 52,
  },
  permissionCopy: {
    flex: 1,
  },
  permissionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  permissionTitle: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 19,
  },
  permissionStatus: {
    color: "#f0abfc",
    fontSize: 11,
    fontWeight: "900",
  },
  permissionText: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  voiceContext: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderColor: "#24202d",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    minHeight: 50,
    padding: 10,
  },
  voiceTitle: {
    color: "#fff7ed",
    fontSize: 13,
    fontWeight: "900",
  },
  voiceWave: {
    flex: 1,
    overflow: "hidden",
  },
  voiceMeta: {
    color: "#bfb5d2",
    fontSize: 11,
    fontWeight: "900",
  },
  actionRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 10,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    flex: 1,
    paddingVertical: 11,
  },
  primaryActionText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "#15121d",
    borderColor: "#2d2638",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: "#d7cdf0",
    fontSize: 13,
    fontWeight: "900",
  },
  blockAction: {
    alignItems: "center",
    backgroundColor: "#120f16",
    borderColor: "#3a2630",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 9,
    paddingVertical: 10,
  },
  blockActionText: {
    color: "#fca5a5",
    fontSize: 12,
    fontWeight: "900",
  },
  decisionBoxApproved: {
    backgroundColor: "#101913",
    borderColor: "#254b32",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
  },
  decisionBoxPrivate: {
    backgroundColor: "#0d0c12",
    borderColor: "#2d2638",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
  },
  decisionBoxBlocked: {
    backgroundColor: "#130f13",
    borderColor: "#4a2531",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
  },
  sentInfoBox: {
    backgroundColor: "#0d0c12",
    borderColor: "#2d2638",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
  },
  sentInfoTitle: {
    color: "#d7cdf0",
    fontSize: 13,
    fontWeight: "900",
  },
  decisionTitleApproved: {
    color: "#86efac",
    fontSize: 13,
    fontWeight: "900",
  },
  decisionTitlePrivate: {
    color: "#d7cdf0",
    fontSize: 13,
    fontWeight: "900",
  },
  decisionTitleBlocked: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "900",
  },
  decisionText: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  nextActionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  nextPrimary: {
    alignItems: "center",
    backgroundColor: "#15121d",
    borderColor: "#2d2638",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 9,
  },
  nextPrimaryText: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "900",
  },
  nextSecondary: {
    alignItems: "center",
    backgroundColor: "#15121d",
    borderColor: "#2d2638",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 9,
  },
  nextSecondaryText: {
    color: "#d7cdf0",
    fontSize: 12,
    fontWeight: "900",
  },
  nextDanger: {
    alignItems: "center",
    backgroundColor: "#120f16",
    borderColor: "#3a2630",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 9,
  },
  nextDangerText: {
    color: "#fca5a5",
    fontSize: 12,
    fontWeight: "900",
  },
  singleSecondary: {
    alignItems: "center",
    backgroundColor: "#15121d",
    borderColor: "#2d2638",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 9,
  },
  requestList: {
    gap: 8,
  },
  requestRow: {
    alignItems: "center",
    backgroundColor: "#0d0c12",
    borderBottomColor: "#201c27",
    borderBottomWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    minHeight: 76,
    padding: 10,
  },
  requestRowActive: {
    backgroundColor: "#15121d",
    borderBottomColor: "#403250",
  },
  requestWave: {
    alignItems: "center",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    overflow: "hidden",
    width: 52,
  },
  requestCopy: {
    flex: 1,
  },
  requestTitle: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  requestSubtitle: {
    color: "#a99cbc",
    fontSize: 12,
    marginTop: 3,
  },
  requestMeta: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  statusText: {
    color: "#f0abfc",
    fontSize: 12,
    fontWeight: "900",
  },
  statusApproved: {
    color: "#86efac",
  },
  statusPassive: {
    color: "#9d94aa",
  },
  statusBlocked: {
    color: "#fca5a5",
  },
});
