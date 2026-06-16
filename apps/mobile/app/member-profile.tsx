import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../src/components/AppHeader";
import { AvatarPlaceholder } from "../src/components/AvatarPlaceholder";
import { ScreenContainer } from "../src/components/ScreenContainer";
import { VoiceWave } from "../src/components/VoiceWave";
import { getLocalPersonaById } from "../src/data/localProductState";
import { type RevealStatus } from "../src/data/staticPersonas";
import { getRevealDecision } from "../src/state/revealDecisionStore";

type ProfileSource = "home" | "feed" | "discover" | "chat" | "reveal";

export default function MemberProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    memberId?: string;
    threadId?: string;
    source?: ProfileSource;
    revealStatus?: RevealStatus;
  }>();
  const basePersona = getLocalPersonaById(params.memberId);
  const threadId = params.threadId ?? basePersona.threadId;
  const source = params.source;
  const storedDecision = getRevealDecision(threadId);
  const revealStatus: RevealStatus =
    storedDecision === "approved"
      ? "approved"
      : storedDecision === "private" || storedDecision === "blocked"
        ? "hidden"
        : params.revealStatus === "approved"
          ? "approved"
          : basePersona.revealLabel === "Profil izni bekliyor"
            ? "pending"
            : basePersona.isProfileVisible
              ? "approved"
              : "hidden";
  const persona = getLocalPersonaById(params.memberId, revealStatus);
  const isApproved = persona.isProfileVisible;
  const displayName = persona.displayName;
  const handleLabel = persona.handleLabel;
  const revealLabel = persona.revealLabel;
  const avatarInitial = isApproved ? (displayName[0] ?? "A") : "A";
  const isRevealHidden = revealLabel === "Kimlik gizli";
  const isRevealPending = revealLabel === "Profil izni bekliyor";
  const isPrivate = storedDecision === "private";
  const isBlocked = storedDecision === "blocked";

  function returnToSource() {
    if (source === "feed") {
      router.replace("/feed");
      return;
    }

    if (source === "discover") {
      router.replace("/discover");
      return;
    }

    if (source === "chat" && threadId) {
      router.replace(`/chat?threadId=${threadId}&source=chat` as any);
      return;
    }

    if (source === "reveal") {
      router.replace(
        `/reveal-requests?source=reveal&threadId=${threadId}` as any,
      );
      return;
    }

    if (source === "home") {
      router.replace("/");
      return;
    }

    router.replace("/chat");
  }

  function openThread() {
    router.replace(`/chat?threadId=${threadId}&source=chat` as any);
  }

  function openRevealRequests() {
    router.replace(
      `/reveal-requests?source=reveal&threadId=${threadId}` as any,
    );
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        returnToSource();
        return true;
      },
    );

    return () => subscription.remove();
  }, [returnToSource]);

  return (
    <ScreenContainer>
      <AppHeader eyebrow={revealLabel} title={displayName} />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <AvatarPlaceholder
            initial={avatarInitial}
            approved={isApproved}
            size="lg"
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.handle}>{handleLabel}</Text>
          <Text style={styles.bio}>
            {isApproved
              ? persona.bioLine
              : persona.bioLine}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statusRow,
          isBlocked && styles.statusRowBlocked,
          !isBlocked && !isApproved && styles.statusRowPrivate,
        ]}
      >
        <Text
          style={[
            styles.statusTitle,
            isBlocked && styles.statusTitleBlocked,
            !isBlocked && !isApproved && styles.statusTitlePrivate,
          ]}
        >
          {isApproved
            ? revealLabel
            : isBlocked
              ? "Bağlantı kapalı"
              : isPrivate
                ? "Anonim kaldı"
                : isRevealPending
                  ? revealLabel
                  : revealLabel}
        </Text>
        <Text style={styles.statusText}>
          {isApproved
            ? "Bu görünürlük yalnızca bu bağlantı için geçerli."
            : isBlocked
              ? "Bu bağlantıda ses ve profil isteği kapalı."
              : isPrivate
                ? "Bu bağlantıda gerçek profil kapalı kalır; ses bağlantısı sürebilir."
                : isRevealPending
                  ? "Karşı taraf karar verene kadar kimlik kapalı kalır."
                  : "Profil baskısı yok. Kontrol karşı tarafta."}
        </Text>
      </View>

      <View style={styles.voiceCard}>
        <View style={styles.voiceTop}>
          <Text style={styles.sectionTitle}>Ses kimliği</Text>
          <Text style={styles.voiceDuration}>{persona.lastVoiceDuration}</Text>
        </View>
        <View style={styles.waveBox}>
          <VoiceWave size="sm" variant="purple" />
        </View>
      </View>

      <View style={styles.actionStack}>
        {isRevealHidden && !isPrivate && !isBlocked ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={openThread}
              style={styles.primaryAction}
            >
              <Text style={styles.primaryActionText}>Sese cevap ver</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={openRevealRequests}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionText}>Profil izni iste</Text>
            </Pressable>
          </>
        ) : null}

        {isRevealPending && !isPrivate && !isBlocked ? (
          <>
            <View style={styles.disabledAction}>
              <Text style={styles.disabledActionText}>İstek bekliyor</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={openThread}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionText}>Bağlantıya dön</Text>
            </Pressable>
          </>
        ) : null}

        {isPrivate ? (
          <Pressable
            accessibilityRole="button"
            onPress={returnToSource}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>İzinlere dön</Text>
          </Pressable>
        ) : null}

        {isBlocked ? (
          <Pressable
            accessibilityRole="button"
            onPress={returnToSource}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>İzinlere dön</Text>
          </Pressable>
        ) : null}

        {isApproved ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={openThread}
              style={styles.primaryAction}
            >
              <Text style={styles.primaryActionText}>Ses gönder</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={returnToSource}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionText}>Bağlantıya dön</Text>
            </Pressable>
          </>
        ) : null}

        <View style={styles.reportRow}>
          <Text style={styles.reportText}>
            {isApproved
              ? "Şikayet et / Engelle"
              : "Şikayet et"}
          </Text>
        </View>
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
  avatar: {
    alignItems: "center",
    height: 82,
    justifyContent: "center",
    width: 82,
  },
  copy: {
    flex: 1,
  },
  name: {
    color: "#fff7ed",
    fontSize: 17,
    fontWeight: "900",
  },
  handle: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  bio: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  statusRow: {
    backgroundColor: "#101913",
    borderColor: "#254b32",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  statusRowPrivate: {
    backgroundColor: "#0d0c12",
    borderColor: "#211d29",
  },
  statusRowBlocked: {
    backgroundColor: "#160d12",
    borderColor: "#3b1d2a",
  },
  statusTitle: {
    color: "#86efac",
    fontSize: 14,
    fontWeight: "900",
  },
  statusTitlePrivate: {
    color: "#d7cdf0",
  },
  statusTitleBlocked: {
    color: "#fca5a5",
  },
  statusText: {
    color: "#a99cbc",
    fontSize: 12,
    marginTop: 4,
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
  primaryAction: {
    alignItems: "center",
    backgroundColor: "#7c3aed",
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 46,
  },
  primaryActionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  actionStack: {
    gap: 8,
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "#15121d",
    borderColor: "#2d2638",
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  secondaryActionText: {
    color: "#d7cdf0",
    fontSize: 13,
    fontWeight: "900",
  },
  disabledAction: {
    alignItems: "center",
    backgroundColor: "#111017",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  disabledActionText: {
    color: "#9d94aa",
    fontSize: 13,
    fontWeight: "900",
  },
  reportRow: {
    alignItems: "center",
    paddingVertical: 8,
  },
  reportText: {
    color: "#817889",
    fontSize: 12,
    fontWeight: "800",
  },
});
