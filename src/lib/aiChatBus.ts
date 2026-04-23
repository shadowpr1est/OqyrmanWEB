// Lightweight pub-sub for opening the global AiChatWidget on a specific
// conversation. The widget owns its own state, so we wire it externally
// via a custom DOM event instead of lifting state into a context.

const EVENT = "oqyrman:openChat";

export interface OpenChatDetail {
  conversationId: string;
}

export function openChatConversation(conversationId: string): void {
  window.dispatchEvent(
    new CustomEvent<OpenChatDetail>(EVENT, { detail: { conversationId } }),
  );
}

export function onOpenChatConversation(
  handler: (detail: OpenChatDetail) => void,
): () => void {
  const listener = (e: Event) => {
    const ce = e as CustomEvent<OpenChatDetail>;
    if (ce.detail?.conversationId) handler(ce.detail);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
