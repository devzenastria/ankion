export type RevealDecision =
  | "pending"
  | "sent"
  | "approved"
  | "private"
  | "blocked";

type RevealThreadState = {
  requesterStatus?: RevealDecision;
  ownerDecision?: Exclude<RevealDecision, "sent">;
};

const revealStateByThreadId: Record<string, RevealThreadState> = {};

function getRevealState(threadId?: string): RevealThreadState {
  if (!threadId) {
    return {};
  }

  return revealStateByThreadId[threadId] ?? {};
}

function saveRevealState(threadId: string, nextState: RevealThreadState) {
  revealStateByThreadId[threadId] = {
    ...getRevealState(threadId),
    ...nextState,
  };
}

export function getRevealDecision(threadId?: string): RevealDecision {
  const state = getRevealState(threadId);

  if (state.ownerDecision && state.ownerDecision !== "pending") {
    return state.ownerDecision;
  }

  return state.requesterStatus ?? "pending";
}

export function getIncomingRevealDecision(threadId?: string): RevealDecision {
  const state = getRevealState(threadId);

  return state.ownerDecision ?? "pending";
}

export function getSentRevealDecision(threadId?: string): RevealDecision {
  const state = getRevealState(threadId);

  if (state.ownerDecision && state.ownerDecision !== "pending") {
    return state.ownerDecision;
  }

  return state.requesterStatus ?? "sent";
}

export function setRevealDecision(threadId: string, decision: RevealDecision) {
  if (decision === "sent") {
    saveRevealState(threadId, { requesterStatus: "sent" });
    return;
  }

  saveRevealState(threadId, {
    ownerDecision: decision,
    requesterStatus: "sent",
  });
}

export function setRevealOwnerDecision(
  threadId: string,
  decision: Exclude<RevealDecision, "sent">,
) {
  saveRevealState(threadId, {
    ownerDecision: decision,
    requesterStatus: "sent",
  });
}

export function markRevealRequestSent(threadId: string) {
  const state = getRevealState(threadId);

  if (!state.requesterStatus || state.requesterStatus === "pending") {
    saveRevealState(threadId, { requesterStatus: "sent" });
  }
}

export function unblockRevealConnection(threadId: string) {
  saveRevealState(threadId, {
    ownerDecision: "private",
    requesterStatus: "sent",
  });
}

export function getRevealDecisionDisplayLabel(decision: RevealDecision) {
  if (decision === "approved") {
    return "Profil açıldı";
  }

  if (decision === "private") {
    return "Anonim";
  }

  if (decision === "blocked") {
    return "Engellendi";
  }

  return "Bekliyor";
}

export function getRevealDecisionLabel(threadId?: string, fallback = "Bekliyor") {
  const decision = getRevealDecision(threadId);

  if (decision === "pending") {
    return fallback;
  }

  return getRevealDecisionDisplayLabel(decision);
}
