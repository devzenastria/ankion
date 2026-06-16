export type RevealStatus = "hidden" | "pending" | "approved";
export type PersonaContentType = "voice" | "photo" | "video" | "approved";
export type PersonaVariant = "purple" | "pink" | "green" | "neutral";

export type StaticPersona = {
  memberId: string;
  threadId: string;
  anonymousTitle: string;
  approvedName: string;
  handle: string;
  shortBio: string;
  voiceTitle: string;
  lastVoiceDuration: string;
  lastActive: string;
  lastActiveText: string;
  lastMessagePreview: string;
  connectionStatusLabel: string;
  homePriority: number;
  replyCount: number;
  revealStatus: RevealStatus;
  contentType: PersonaContentType;
  thumbnailVariant: PersonaVariant;
  avatarVariant: PersonaVariant;
  tags: string[];
};

export const staticPersonas: StaticPersona[] = [
  {
    memberId: "member-night",
    threadId: "night-walk",
    anonymousTitle: "Gece yürüyüşü",
    approvedName: "Uğur",
    handle: "@anonim-ses",
    shortBio: "Geceleri kısa sesler bırakmayı sever.",
    voiceTitle: "Yeni bir ses cevabı var.",
    lastVoiceDuration: "0:21",
    lastActive: "şimdi",
    lastActiveText: "şimdi aktif",
    lastMessagePreview:
      "Sana kısa bir ses cevabı bıraktı. Yanıt verirsen bağlantı devam eder.",
    connectionStatusLabel: "Yeni ses cevabı",
    homePriority: 100,
    replyCount: 12,
    revealStatus: "pending",
    contentType: "voice",
    thumbnailVariant: "pink",
    avatarVariant: "purple",
    tags: ["gece", "yürüyüş", "şehir", "sakin", "merak"],
  },
  {
    memberId: "member-rain",
    threadId: "rain-after",
    anonymousTitle: "Yağmurdan sonra",
    approvedName: "Deniz",
    handle: "@yagmur-sesi",
    shortBio: "Sakin anları ve gece yürüyüşlerini sever.",
    voiceTitle: "Bugünün önerilen anonim sesi.",
    lastVoiceDuration: "0:18",
    lastActive: "8 dk",
    lastActiveText: "8 dk önce",
    lastMessagePreview: "Yağmurdan sonra kısa ve sakin bir ses bıraktı.",
    connectionStatusLabel: "Cevap verilebilir",
    homePriority: 80,
    replyCount: 8,
    revealStatus: "hidden",
    contentType: "photo",
    thumbnailVariant: "purple",
    avatarVariant: "neutral",
    tags: ["yağmur", "sakin", "gece", "müzik", "duygu"],
  },
  {
    memberId: "member-quiet",
    threadId: "quiet-thought",
    anonymousTitle: "Sessiz düşünce",
    approvedName: "Ece",
    handle: "@sessiz-not",
    shortBio: "Az konuşur, sesle daha iyi anlatır.",
    voiceTitle: "Profil izni verilmiş bağlantı.",
    lastVoiceDuration: "0:15",
    lastActive: "20 dk",
    lastActiveText: "20 dk önce",
    lastMessagePreview:
      "Profil izni açıldı. Bağlantı artık daha kişisel ilerliyor.",
    connectionStatusLabel: "Profil açıldı",
    homePriority: 70,
    replyCount: 7,
    revealStatus: "approved",
    contentType: "approved",
    thumbnailVariant: "green",
    avatarVariant: "green",
    tags: ["sessiz", "derin", "not", "güven", "profil"],
  },
  {
    memberId: "member-city",
    threadId: "city-lights",
    anonymousTitle: "Şehrin ışıkları",
    approvedName: "Mert",
    handle: "@gece-rotasi",
    shortBio: "Kısa videolar ve şehir sesleri paylaşır.",
    voiceTitle: "Kısa bir şehir sesi.",
    lastVoiceDuration: "0:18",
    lastActive: "18 dk",
    lastActiveText: "18 dk önce",
    lastMessagePreview:
      "Şehirden kısa bir ses bıraktı. Henüz profil açık değil.",
    connectionStatusLabel: "Kimlik kapalı",
    homePriority: 60,
    replyCount: 6,
    revealStatus: "hidden",
    contentType: "video",
    thumbnailVariant: "neutral",
    avatarVariant: "neutral",
    tags: ["şehir", "ışık", "video", "gece", "an"],
  },
];

export function getPersonaByThreadId(threadId?: string) {
  return (
    staticPersonas.find((persona) => persona.threadId === threadId) ??
    staticPersonas[0]!
  );
}

export function getPersonaByMemberId(memberId?: string) {
  return (
    staticPersonas.find((persona) => persona.memberId === memberId) ??
    staticPersonas[0]!
  );
}

export function getHomePersonas(limit = 3) {
  return [...staticPersonas]
    .sort((first, second) => second.homePriority - first.homePriority)
    .slice(0, limit);
}

export function getActiveHomePersona() {
  return getHomePersonas(1)[0] ?? staticPersonas[0]!;
}

export function getRecommendedHomePersona() {
  const activePersona = getActiveHomePersona();

  return (
    getHomePersonas(4).find(
      (persona) =>
        persona.threadId !== activePersona.threadId &&
        persona.revealStatus === "hidden",
    ) ??
    getHomePersonas(4).find(
      (persona) => persona.threadId !== activePersona.threadId,
    ) ??
    activePersona
  );
}
export function isPersonaProfileVisible(persona: StaticPersona) {
  return persona.revealStatus === "approved";
}

export function getPersonaDisplayName(persona: StaticPersona) {
  if (isPersonaProfileVisible(persona)) {
    return persona.approvedName;
  }

  return persona.anonymousTitle;
}

export function getPersonaHandleLabel(persona: StaticPersona) {
  if (isPersonaProfileVisible(persona)) {
    return persona.handle;
  }

  return "Anonim profil";
}

export function getPersonaRevealLabel(persona: StaticPersona) {
  if (persona.revealStatus === "approved") {
    return "Profil açık";
  }

  if (persona.revealStatus === "pending") {
    return "Profil izni bekliyor";
  }

  return "Kimlik gizli";
}
