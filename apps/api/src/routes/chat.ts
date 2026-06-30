import type { FastifyInstance } from 'fastify';

import { sendChatNotReady } from '../lib/chatApiBoundary';

export async function registerChatRoutes(server: FastifyInstance): Promise<void> {
  server.get('/chat/conversations', async function listConversationsHandler(_, reply) {
    return sendChatNotReady(reply);
  });

  server.post('/chat/conversations', async function createConversationHandler(_, reply) {
    return sendChatNotReady(reply);
  });

  server.get(
    '/chat/conversations/:conversationId/messages',
    async function listMessagesHandler(_, reply) {
      return sendChatNotReady(reply);
    },
  );

  server.post(
    '/chat/conversations/:conversationId/messages',
    async function sendMessageHandler(_, reply) {
      return sendChatNotReady(reply);
    },
  );

  server.post(
    '/chat/conversations/:conversationId/report',
    async function reportConversationHandler(_, reply) {
      return sendChatNotReady(reply);
    },
  );

  server.post(
    '/chat/messages/:messageId/report',
    async function reportMessageHandler(_, reply) {
      return sendChatNotReady(reply);
    },
  );

  server.post(
    '/chat/conversations/:conversationId/block',
    async function blockConversationHandler(_, reply) {
      return sendChatNotReady(reply);
    },
  );
}
