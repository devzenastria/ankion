import {
  getPersonaByMemberId,
  getPersonaDisplayName,
  getPersonaHandleLabel,
  getPersonaRevealLabel,
  isPersonaProfileVisible,
  staticPersonas,
  type PersonaContentType,
  type PersonaVariant,
  type RevealStatus,
  type StaticPersona,
} from "./staticPersonas";

export type LocalPersonaPreview = {
  memberId: string;
  threadId: string;
  title: string;
  displayName: string;
  handleLabel: string;
  bioLine: string;
  voiceTitle: string;
  lastVoiceDuration: string;
  lastActive: string;
  lastActiveText: string;
  lastMessagePreview: string;
  connectionStatusLabel: string;
  replyCount: number;
  revealLabel: string;
  isProfileVisible: boolean;
  contentType: PersonaContentType;
  thumbnailVariant: PersonaVariant;
  avatarVariant: PersonaVariant;
  tags: string[];
};

export type LocalThreadPreview = {
  threadId: string;
  memberId: string;
  title: string;
  subtitle: string;
  time: string;
  duration: string;
  statusLabel: string;
  isProfileVisible: boolean;
  thumbnailVariant: PersonaVariant;
  live?: boolean;
  unreadCount?: number;
};

export type LocalRevealRequestPreview = {
  requestId: string;
  memberId: string;
  threadId: string;
  title: string;
  subtitle: string;
  time: string;
  duration: string;
  statusLabel: string;
  isProfileVisible: boolean;
};

export type LocalThreadMessagePreview = {
  id: string;
  threadId: string;
  direction: "incoming" | "outgoing";
  label: string;
  text: string;
  duration: string;
  time: string;
  state: "received" | "sent" | "new" | "local";
  variant: "purple" | "pink" | "orange";
};

export type SafeRevealDecisionStatus =
  | "pending"
  | "sent"
  | "approved"
  | "private"
  | "blocked";

export type LocalDraftPreview = {
  id: string;
  type: "feed-voice" | "feed-camera" | "feed-moment" | "discover-reply";
  label: string;
  text: string;
  time: string;
  state: "local";
};

function withRevealStatus(persona: StaticPersona, revealStatus?: RevealStatus) {
  if (!revealStatus || persona.revealStatus === revealStatus) {
    return persona;
  }

  return {
    ...persona,
    revealStatus,
  };
}

function getRevealLabelFromStatus(revealStatus: RevealStatus) {
  if (revealStatus === "approved") {
    return "Profil açık";
  }

  if (revealStatus === "pending") {
    return "Profil izni bekliyor";
  }

  return "Kimlik gizli";
}

function withThreadRevealStatus(
  thread: LocalThreadPreview,
  revealStatus?: RevealStatus,
) {
  if (!revealStatus) {
    return thread;
  }

  return {
    ...thread,
    isProfileVisible: revealStatus === "approved",
    statusLabel: getRevealLabelFromStatus(revealStatus),
  };
}

export function getSafePersonaPreview(
  persona: StaticPersona,
  revealStatus?: RevealStatus,
): LocalPersonaPreview {
  const safePersona = withRevealStatus(persona, revealStatus);
  const isProfileVisible = isPersonaProfileVisible(safePersona);

  return {
    memberId: safePersona.memberId,
    threadId: safePersona.threadId,
    title: safePersona.anonymousTitle,
    displayName: getPersonaDisplayName(safePersona),
    handleLabel: getPersonaHandleLabel(safePersona),
    bioLine: isProfileVisible
      ? safePersona.shortBio
      : "Önce ses duyulur. Profil yalnızca izinle açılır.",
    voiceTitle: safePersona.voiceTitle,
    lastVoiceDuration: safePersona.lastVoiceDuration,
    lastActive: safePersona.lastActive,
    lastActiveText: safePersona.lastActiveText,
    lastMessagePreview: safePersona.lastMessagePreview,
    connectionStatusLabel: safePersona.connectionStatusLabel,
    replyCount: safePersona.replyCount,
    revealLabel: getPersonaRevealLabel(safePersona),
    isProfileVisible,
    contentType: safePersona.contentType,
    thumbnailVariant: safePersona.thumbnailVariant,
    avatarVariant: safePersona.avatarVariant,
    tags: [...safePersona.tags],
  };
}

export function getSafeThreadPreview(
  thread: StaticPersona,
  revealStatus?: RevealStatus,
): LocalThreadPreview {
  const persona = getSafePersonaPreview(thread, revealStatus);

  return {
    threadId: persona.threadId,
    memberId: persona.memberId,
    title: persona.title,
    subtitle: persona.lastMessagePreview,
    time: persona.lastActive,
    duration: persona.lastVoiceDuration,
    statusLabel: persona.revealLabel,
    isProfileVisible: persona.isProfileVisible,
    thumbnailVariant: persona.thumbnailVariant,
  };
}

const supplementalChatThreads: LocalThreadPreview[] = [
  {
    threadId: "first-voice",
    memberId: "member-rain",
    title: "İlk ses",
    subtitle: "Cevap verirsen özel bağlantı açılır.",
    time: "19:12",
    duration: "0:16",
    statusLabel: "Kimlik gizli",
    isProfileVisible: false,
    thumbnailVariant: "purple",
  },
  {
    threadId: "short-curiosity",
    memberId: "member-night",
    title: "Kısa bir merak",
    subtitle: "Profil hâlâ kapalı.",
    time: "18:40",
    duration: "0:14",
    statusLabel: "Son ses",
    isProfileVisible: false,
    thumbnailVariant: "pink",
    live: true,
  },
  {
    threadId: "old-signal",
    memberId: "member-city",
    title: "Kapanan bağlantı",
    subtitle: "Profil gizli kaldı.",
    time: "dün",
    duration: "0:12",
    statusLabel: "Kimlik gizli",
    isProfileVisible: false,
    thumbnailVariant: "purple",
  },
];

const threadMessageBlueprints: Array<
  Omit<LocalThreadMessagePreview, "id" | "threadId">
> = [
  {
    direction: "incoming",
    label: "Gelen ses",
    text: "Kısa bir anonim ses cevabı.",
    duration: "0:21",
    time: "22:31",
    state: "received",
    variant: "pink",
  },
  {
    direction: "outgoing",
    label: "Senin cevabın",
    text: "Sesli bağlantıyı devam ettiren kısa cevap.",
    duration: "0:18",
    time: "22:33",
    state: "sent",
    variant: "purple",
  },
  {
    direction: "incoming",
    label: "Yeni yanıt",
    text: "Merakı sürdüren yeni anonim yanıt.",
    duration: "0:15",
    time: "22:36",
    state: "new",
    variant: "orange",
  },
];

function getStaticThreadPreviewById(
  threadId?: string,
  revealStatus?: RevealStatus,
) {
  const persona = staticPersonas.find((item) => item.threadId === threadId);

  return persona ? getSafeThreadPreview(persona, revealStatus) : undefined;
}

function getSupplementalThreadPreviewById(
  threadId?: string,
  revealStatus?: RevealStatus,
) {
  const thread = supplementalChatThreads.find((item) => item.threadId === threadId);

  return thread ? withThreadRevealStatus(thread, revealStatus) : undefined;
}

function getRevealRequestPreviewFromThread(
  thread: LocalThreadPreview,
): LocalRevealRequestPreview {
  return {
    requestId: `reveal-${thread.threadId}`,
    memberId: thread.memberId,
    threadId: thread.threadId,
    title: thread.isProfileVisible
      ? "Profil izni verildi"
      : "Bu kişi profilini görmek istiyor",
    subtitle: thread.title,
    time: thread.time,
    duration: thread.duration,
    statusLabel: thread.statusLabel,
    isProfileVisible: thread.isProfileVisible,
  };
}

export function getSafeRevealRequestPreview(
  request: StaticPersona,
  revealStatus?: RevealStatus,
): LocalRevealRequestPreview {
  const persona = getSafePersonaPreview(request, revealStatus);

  return {
    requestId: `reveal-${persona.threadId}`,
    memberId: persona.memberId,
    threadId: persona.threadId,
    title: persona.isProfileVisible
      ? "Profil izni verildi"
      : "Bu kişi profilini görmek istiyor",
    subtitle: persona.title,
    time: persona.lastActive,
    duration: persona.lastVoiceDuration,
    statusLabel: persona.revealLabel,
    isProfileVisible: persona.isProfileVisible,
  };
}

export function getSafeThreadMessagePreview(
  message: LocalThreadMessagePreview,
): LocalThreadMessagePreview {
  return {
    id: message.id,
    threadId: message.threadId,
    direction: message.direction,
    label: message.label,
    text: message.text,
    duration: message.duration,
    time: message.time,
    state: message.state,
    variant: message.variant,
  };
}

export function getSafeRevealDecisionLabel(
  decision: SafeRevealDecisionStatus,
) {
  if (decision === "approved") {
    return {
      chatStatusLabel: "Profil izni var",
      chatText: "Profil bu bağlantıda görünür.",
      metaLabel: "Profil görünür",
      statusLabel: "Profil açıldı",
      text: "Bu bağlantıda profil görünür.",
      title: "Profil açıldı",
    } as const;
  }

  if (decision === "private") {
    return {
      chatStatusLabel: "Anonim devam",
      chatText: "Profil gizli, bağlantı sesle devam eder.",
      metaLabel: "Profil gizli",
      statusLabel: "Anonim kalındı",
      text: "Profil bu bağlantıda gizli.",
      title: "Anonim kalındı",
    } as const;
  }

  if (decision === "blocked") {
    return {
      chatStatusLabel: "Bağlantı kapalı",
      chatText: "Bu bağlantı kapatıldı.",
      metaLabel: "Bağlantı kapalı",
      statusLabel: "Engellendi",
      text: "Bu bağlantı kapatıldı.",
      title: "Engellendi",
    } as const;
  }

  return {
    chatStatusLabel: "Bekliyor",
    chatText: "Profil kararı bekleniyor.",
    metaLabel: "Kimlik kapalı",
    statusLabel: "Bekliyor",
    text: "Karar verilene kadar profil kapalı kalır.",
    title: "Bekleniyor",
  } as const;
}

export function getLocalPersonas() {
  return staticPersonas.map((persona) => getSafePersonaPreview(persona));
}

export function getLocalPersonaById(
  memberId?: string,
  revealStatus?: RevealStatus,
) {
  return getSafePersonaPreview(getPersonaByMemberId(memberId), revealStatus);
}

export function getLocalThreads() {
  return [
    ...staticPersonas.map((persona) => getSafeThreadPreview(persona)),
    ...supplementalChatThreads,
  ];
}

export function getLocalThreadById(
  threadId?: string,
  revealStatus?: RevealStatus,
) {
  return (
    getStaticThreadPreviewById(threadId, revealStatus) ??
    getSupplementalThreadPreviewById(threadId, revealStatus) ??
    getSafeThreadPreview(staticPersonas[0]!, revealStatus)
  );
}

export function getLocalFeedItems() {
  return getLocalPersonas();
}

export function getLocalDiscoverItems() {
  return getLocalPersonas();
}

export function getLocalRevealRequests() {
  return staticPersonas
    .filter((persona) => persona.revealStatus !== "hidden")
    .map((persona) => getSafeRevealRequestPreview(persona));
}

export function getLocalRevealRequestByThreadId(
  threadId?: string,
  revealStatus?: RevealStatus,
) {
  return getRevealRequestPreviewFromThread(
    getLocalThreadById(threadId, revealStatus),
  );
}

export function getLocalThreadMessages(threadId?: string) {
  const thread = getLocalThreadById(threadId);

  return threadMessageBlueprints.map((message, index) =>
    getSafeThreadMessagePreview({
      ...message,
      id: `${thread.threadId}-message-${index + 1}`,
      threadId: thread.threadId,
    }),
  );
}

export function createLocalThreadReplyPreview(threadId?: string) {
  const thread = getLocalThreadById(threadId);

  return getSafeThreadMessagePreview({
    id: `${thread.threadId}-local-reply`,
    threadId: thread.threadId,
    direction: "outgoing",
    label: "Yerel cevap",
    text: "Sesli cevap hazırlandı.",
    duration: "0:12",
    time: "Şimdi",
    state: "local",
    variant: "purple",
  });
}
export function createLocalThreadMediaReplyPreview(threadId?: string) {
  const thread = getLocalThreadById(threadId);

  return getSafeThreadMessagePreview({
    id: `${thread.threadId}-local-media-reply`,
    threadId: thread.threadId,
    direction: "outgoing",
    label: "Kamera yanıtı",
    text: "Fotoğraf-video taslağı hazırlandı.",
    duration: "Taslak",
    time: "Şimdi",
    state: "local",
    variant: "orange",
  });
}

export function createLocalFeedDraftPreview(
  type: "voice" | "camera" | "moment",
): LocalDraftPreview {
  if (type === "camera") {
    return {
      id: "local-feed-draft",
      type: "feed-camera",
      label: "Kamera taslağı hazırlandı.",
      text: "Fotoğraf-video paylaşımı bağlantı öncesi yerel taslak olarak hazır.",
      time: "Şimdi",
      state: "local",
    };
  }

  if (type === "moment") {
    return {
      id: "local-feed-draft",
      type: "feed-moment",
      label: "Yerel taslak",
      text: "An taslağı hazırlandı.",
      time: "Şimdi",
      state: "local",
    };
  }

  return {
    id: "local-feed-draft",
    type: "feed-voice",
    label: "Yerel taslak",
    text: "Yerel ses taslağı hazırlandı.",
    time: "Şimdi",
    state: "local",
  };
}

export function createLocalDiscoverDraftPreview(
  _sourceId?: string,
): LocalDraftPreview {
  return {
    id: "local-discover-draft",
    type: "discover-reply",
    label: "Yerel taslak",
    text: "Bağlantı için sesli yanıt hazır.",
    time: "Şimdi",
    state: "local",
  };
}
