import { api } from '../../services/api';

export const messagingApi = {
  getConversations: async () => {
    return api.getConversations();
  },

  getMessages: async (conversationId: number) => {
    return api.getMessages(conversationId);
  },

  sendMessage: async (conversationId: number, content: string) => {
    return api.sendMessage(conversationId, content);
  },

  createConversation: async (userId: number) => {
    return api.createConversation(userId);
  },
}; 