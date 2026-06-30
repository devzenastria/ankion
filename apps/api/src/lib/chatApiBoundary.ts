import type { FastifyReply } from 'fastify';

export type ChatConversationStatus = 'active' | 'paused' | 'closed' | 'blocked';
export type ChatMessageStatus = 'sent' | 'edited' | 'deleted';
export type ChatReportReasonCode = 'safety' | 'spam' | 'harassment' | 'other';

export type ChatConversationDto = {
  id: string;
  status: ChatConversationStatus;
  participantCount: number;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ChatMessageDto = {
  id: string;
  conversationId: string;
  senderPublicId: string;
  body: string;
  sentAt: string;
  status: ChatMessageStatus;
};

export type ChatSendMessageRequest = {
  clientMessageId?: string;
  body: string;
};

export type ChatReportRequest = {
  reasonCode: ChatReportReasonCode;
  messageId?: string;
  note?: string;
};

export type ChatNotReadyResponse = {
  ok: false;
  code: 'CHAT_SCHEMA_NOT_READY';
  message: 'Chat is not ready yet.';
};

export type ChatValidationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      code:
        | 'CHAT_MESSAGE_BODY_INVALID'
        | 'CHAT_CLIENT_MESSAGE_ID_INVALID'
        | 'CHAT_REPORT_REASON_INVALID'
        | 'CHAT_REPORT_NOTE_INVALID'
        | 'CHAT_REPORT_MESSAGE_ID_INVALID'
        | 'CHAT_UNSUPPORTED_FIELD';
    };

const chatMessageBodyMaxLength = 4000;
const chatClientMessageIdMaxLength = 80;
const chatReportNoteMaxLength = 500;
const chatPublicIdMaxLength = 80;
const unsupportedClientAuthorityFields = [
  'owner_user_id',
  'ownerUserId',
  'anonymous_identity_id',
  'anonymousIdentityId',
  'senderAnonymousIdentityId',
];
const unsupportedClientPayloadFields = [
  'metadata',
  'media',
  'mediaUrl',
  'media_asset_ref',
  'mediaAssetRef',
  'attachment',
  'attachments',
];
const chatReportReasonCodes = new Set<ChatReportReasonCode>([
  'safety',
  'spam',
  'harassment',
  'other',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidOptionalString(value: unknown, maxLength: number): boolean {
  return (
    value === undefined ||
    (typeof value === 'string' && value.length > 0 && value.length <= maxLength)
  );
}

function hasUnsupportedClientFields(input: Record<string, unknown>): boolean {
  return [...unsupportedClientAuthorityFields, ...unsupportedClientPayloadFields].some(
    (field) => Object.hasOwn(input, field),
  );
}

export function createChatNotReadyResponse(): ChatNotReadyResponse {
  return {
    ok: false,
    code: 'CHAT_SCHEMA_NOT_READY',
    message: 'Chat is not ready yet.',
  };
}

export function sendChatNotReady(reply: FastifyReply): FastifyReply {
  return reply.status(503).send(createChatNotReadyResponse());
}

export function validateChatSendMessageRequest(
  input: unknown,
): ChatValidationResult {
  if (!isPlainObject(input)) {
    return {
      ok: false,
      code: 'CHAT_MESSAGE_BODY_INVALID',
    };
  }

  if (hasUnsupportedClientFields(input)) {
    return {
      ok: false,
      code: 'CHAT_UNSUPPORTED_FIELD',
    };
  }

  if (
    typeof input.body !== 'string' ||
    input.body.trim().length === 0 ||
    input.body.length > chatMessageBodyMaxLength
  ) {
    return {
      ok: false,
      code: 'CHAT_MESSAGE_BODY_INVALID',
    };
  }

  if (!isValidOptionalString(input.clientMessageId, chatClientMessageIdMaxLength)) {
    return {
      ok: false,
      code: 'CHAT_CLIENT_MESSAGE_ID_INVALID',
    };
  }

  return {
    ok: true,
  };
}

export function validateChatReportRequest(input: unknown): ChatValidationResult {
  if (!isPlainObject(input)) {
    return {
      ok: false,
      code: 'CHAT_REPORT_REASON_INVALID',
    };
  }

  if (hasUnsupportedClientFields(input)) {
    return {
      ok: false,
      code: 'CHAT_UNSUPPORTED_FIELD',
    };
  }

  if (
    typeof input.reasonCode !== 'string' ||
    !chatReportReasonCodes.has(input.reasonCode as ChatReportReasonCode)
  ) {
    return {
      ok: false,
      code: 'CHAT_REPORT_REASON_INVALID',
    };
  }

  if (!isValidOptionalString(input.note, chatReportNoteMaxLength)) {
    return {
      ok: false,
      code: 'CHAT_REPORT_NOTE_INVALID',
    };
  }

  if (!isValidOptionalString(input.messageId, chatPublicIdMaxLength)) {
    return {
      ok: false,
      code: 'CHAT_REPORT_MESSAGE_ID_INVALID',
    };
  }

  return {
    ok: true,
  };
}
