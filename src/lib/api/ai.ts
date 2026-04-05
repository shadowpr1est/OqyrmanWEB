import { apiFetch } from "./client";
import type { Book, AiConversation, AiMessage } from "./types";

export const aiApi = {
  recommend: (preferences?: string) =>
    apiFetch<Book[]>("/ai/recommend", {
      method: "POST",
      body: JSON.stringify({ preferences }),
    }),

  createConversation: () =>
    apiFetch<AiConversation>("/ai/conversations", { method: "POST" }),

  listConversations: () =>
    apiFetch<AiConversation[]>("/ai/conversations"),

  getConversation: (id: number) =>
    apiFetch<AiConversation & { messages: AiMessage[] }>(
      `/ai/conversations/${id}`,
    ),

  sendMessage: (conversationId: number, content: string) =>
    apiFetch<AiMessage>(`/ai/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  deleteConversation: (id: number) =>
    apiFetch<void>(`/ai/conversations/${id}`, { method: "DELETE" }),
};
