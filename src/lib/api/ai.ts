import { apiFetch, BASE_URL, tokenStorage } from "./client";
import type {
  AiConversation,
  AiMessage,
  AiSuggestedPrompts,
  AiStreamChunk,
} from "./types";

export const aiApi = {
  recommend: (preferences?: string) =>
    apiFetch<{ recommendations: string }>("/ai/recommend", {
      method: "POST",
      body: JSON.stringify({ preferences }),
    }),

  suggestedPrompts: () =>
    apiFetch<AiSuggestedPrompts>("/ai/prompts"),

  createConversation: () =>
    apiFetch<AiConversation>("/ai/conversations", { method: "POST" }),

  listConversations: () =>
    apiFetch<AiConversation[]>("/ai/conversations"),

  getConversation: (id: string) =>
    apiFetch<AiConversation & { messages: AiMessage[] }>(
      `/ai/conversations/${id}`,
    ),

  sendMessage: (conversationId: string, message: string) =>
    apiFetch<{ user_message: AiMessage; ai_message: AiMessage }>(
      `/ai/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      },
    ),

  sendMessageStream: async (
    conversationId: string,
    message: string,
    onChunk: (chunk: AiStreamChunk) => void,
    signal?: AbortSignal,
  ) => {
    const token = tokenStorage.getAccess();
    const res = await fetch(
      `${BASE_URL}/ai/conversations/${conversationId}/messages/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
        signal,
      },
    );

    if (!res.ok) {
      throw new Error(`Stream error: ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6)) as AiStreamChunk;
          onChunk(data);
        } catch {
          // skip malformed lines
        }
      }
    }
  },

  deleteConversation: (id: string) =>
    apiFetch<void>(`/ai/conversations/${id}`, { method: "DELETE" }),

  explainSelection: async (
    bookId: string,
    action: "explain" | "translate" | "identify",
    selection: string,
    onChunk: (chunk: AiStreamChunk) => void,
    signal?: AbortSignal,
  ) => {
    const token = tokenStorage.getAccess();
    const res = await fetch(`${BASE_URL}/ai/books/${bookId}/explain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ action, selection }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Stream error: ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6)) as AiStreamChunk;
          onChunk(data);
        } catch {
          // skip malformed lines
        }
      }
    }
  },
};