import { useState, useRef, useEffect, useCallback } from "react";
import { IconMessageCircle, IconX, IconSend, IconLoader2, IconTrash, IconPlus, IconArrowLeft, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { aiApi } from "@/lib/api/ai";
import { useAuth } from "@/contexts/AuthContext";
import type { AiConversation, AiMessage } from "@/lib/api/types";

export function AiChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="AI ассистент"
        >
          <IconSparkles size={26} />
        </button>
      )}

      {/* Chat panel */}
      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Chat Panel ──────────────────────────────────────────────────────────────

type View = "conversations" | "chat";

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>("conversations");
  const [activeConv, setActiveConv] = useState<string | null>(null);

  const openConversation = (id: string) => {
    setActiveConv(id);
    setView("chat");
  };

  const goBack = () => {
    setActiveConv(null);
    setView("conversations");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:h-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          {view === "chat" && (
            <button onClick={goBack} className="text-muted-foreground hover:text-foreground">
              <IconArrowLeft size={18} />
            </button>
          )}
          <IconSparkles size={20} className="text-primary" />
          <span className="font-semibold text-sm">AI Ассистент</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <IconX size={18} />
        </button>
      </div>

      {view === "conversations" ? (
        <ConversationList onSelect={openConversation} />
      ) : (
        activeConv && <ChatView conversationId={activeConv} />
      )}
    </div>
  );
}

// ── Conversation List ───────────────────────────────────────────────────────

function ConversationList({ onSelect }: { onSelect: (id: string) => void }) {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [convs, suggested] = await Promise.all([
        aiApi.listConversations(),
        aiApi.suggestedPrompts().catch(() => ({ prompts: [] })),
      ]);
      setConversations(convs || []);
      setPrompts(suggested.prompts || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createNew = async () => {
    setCreating(true);
    try {
      const conv = await aiApi.createConversation();
      onSelect(conv.id);
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const deleteConv = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await aiApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silent
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Suggested prompts */}
      {prompts.length > 0 && (
        <div className="border-b px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Быстрые вопросы</p>
          <div className="flex flex-wrap gap-1.5">
            {prompts.slice(0, 4).map((p) => (
              <button
                key={p}
                onClick={async () => {
                  setCreating(true);
                  try {
                    const conv = await aiApi.createConversation();
                    // Pass the prompt to chat view by selecting the conversation
                    // The prompt will be sent as first message
                    onSelect(conv.id + ":" + p);
                  } catch {} finally { setCreating(false); }
                }}
                className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New chat button */}
      <div className="px-4 pt-3 pb-2">
        <Button onClick={createNew} disabled={creating} size="sm" className="w-full gap-2">
          {creating ? <IconLoader2 size={16} className="animate-spin" /> : <IconPlus size={16} />}
          Новый чат
        </Button>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1 px-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <IconLoader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Нет бесед. Начните новый чат!
          </p>
        ) : (
          <div className="space-y-1 pb-3">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.updated_at || c.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteConv(e, c.id)}
                  className="ml-2 hidden shrink-0 text-muted-foreground hover:text-destructive group-hover:block"
                >
                  <IconTrash size={14} />
                </button>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ── Chat View ───────────────────────────────────────────────────────────────

function ChatView({ conversationId: rawId }: { conversationId: string }) {
  // Support "id:initialPrompt" format from suggested prompts
  const [convId, initialPrompt] = rawId.includes(":")
    ? [rawId.slice(0, rawId.indexOf(":")), rawId.slice(rawId.indexOf(":") + 1)]
    : [rawId, ""];

  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialSent = useRef(false);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, streamText, scrollToBottom]);

  // Load conversation
  useEffect(() => {
    (async () => {
      try {
        const data = await aiApi.getConversation(convId);
        setMessages(data.messages || []);
      } catch {
        // new conversation, no messages yet
      } finally {
        setLoading(false);
      }
    })();
  }, [convId]);

  // Send initial prompt from suggested prompts
  useEffect(() => {
    if (!loading && initialPrompt && !initialSent.current) {
      initialSent.current = true;
      sendMessage(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const sendMessage = async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;

    // Optimistic user message
    const userMsg: AiMessage = {
      id: crypto.randomUUID(),
      conversation_id: convId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setStreamText("");

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      await aiApi.sendMessageStream(
        convId,
        content,
        (chunk) => {
          if (chunk.type === "chunk" && chunk.content) {
            setStreamText((prev) => prev + chunk.content);
          } else if (chunk.type === "done" && chunk.ai_message) {
            setMessages((prev) => {
              // Replace optimistic user message with real one
              const updated = chunk.user_message
                ? prev.map((m) => (m.id === userMsg.id ? chunk.user_message! : m))
                : prev;
              return [...updated, chunk.ai_message!];
            });
            setStreamText("");
          } else if (chunk.type === "error") {
            setStreamText("");
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                conversation_id: convId,
                role: "assistant",
                content: chunk.content || "Произошла ошибка. Попробуйте ещё раз.",
                created_at: new Date().toISOString(),
              },
            ]);
          }
        },
        abort.signal,
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            conversation_id: convId,
            role: "assistant",
            content: "Не удалось получить ответ. Попробуйте позже.",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setStreaming(false);
      setStreamText("");
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <IconLoader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 && !streaming ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <IconMessageCircle size={32} className="mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Задайте вопрос AI ассистенту</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {streaming && streamText && (
              <MessageBubble
                message={{
                  id: "streaming",
                  conversation_id: convId,
                  role: "assistant",
                  content: streamText,
                  created_at: new Date().toISOString(),
                }}
                isStreaming
              />
            )}
            {streaming && !streamText && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconLoader2 size={14} className="animate-spin" />
                <span>Думаю...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
            disabled={streaming}
            rows={1}
            className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            size="icon"
            className="shrink-0"
          >
            {streaming ? (
              <IconLoader2 size={16} className="animate-spin" />
            ) : (
              <IconSend size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isStreaming,
}: {
  message: AiMessage;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md",
          isStreaming && "animate-pulse",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}