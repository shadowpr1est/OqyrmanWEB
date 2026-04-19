import { useState, useRef, useEffect, useCallback } from "react";
import {
  IconX,
  IconSend,
  IconTrash,
  IconPlus,
  IconArrowLeft,
  IconSparkles,
  IconMessage,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { aiApi } from "@/lib/api/ai";
import { useAuth } from "@/contexts/AuthContext";
import type { AiConversation, AiMessage } from "@/lib/api/types";

// ── Widget Root ─────────────────────────────────────────────────────────────

export function AiChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-primary-light to-primary text-white shadow-[0_4px_20px_rgba(0,0,0,0.15),0_2px_0_0_rgba(255,255,255,0.15)_inset] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.2),0_2px_0_0_rgba(255,255,255,0.15)_inset] active:translate-y-0 active:scale-95"
            aria-label="AI ассистент"
          >
            <IconSparkles size={24} stroke={1.8} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && <ChatPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
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
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="fixed bottom-6 right-6 z-50 flex h-[min(520px,calc(100dvh-3rem))] w-[min(380px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-[0_16px_70px_-12px_rgba(0,0,0,0.25)]"
    >
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3.5 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent">
        <div className="flex items-center gap-2.5">
          <AnimatePresence mode="popLayout">
            {view === "chat" && (
              <motion.button
                key="back"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                onClick={goBack}
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconArrowLeft size={18} stroke={1.8} />
              </motion.button>
            )}
          </AnimatePresence>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <IconSparkles size={16} className="text-primary" stroke={2} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            AI Ассистент
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <IconX size={16} stroke={2} />
        </button>
      </div>

      {/* Content — animated transition between views */}
      <AnimatePresence mode="wait" initial={false}>
        {view === "conversations" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <ConversationList onSelect={openConversation} />
          </motion.div>
        ) : (
          activeConv && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <ChatView conversationId={activeConv} />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </motion.div>
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
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createNew = async () => {
    setCreating(true);
    try {
      const conv = await aiApi.createConversation();
      onSelect(conv.id);
    } catch {
      /* silent */
    } finally {
      setCreating(false);
    }
  };

  const createWithPrompt = async (prompt: string) => {
    setCreating(true);
    try {
      const conv = await aiApi.createConversation();
      onSelect(conv.id + ":" + prompt);
    } catch {
      /* silent */
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
      /* silent */
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Suggested prompts */}
      {prompts.length > 0 && !loading && (
        <div className="px-4 pt-3 pb-1">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Быстрые вопросы
          </p>
          <div className="flex flex-wrap gap-1.5">
            {prompts.slice(0, 4).map((p, i) => (
              <motion.button
                key={p}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                onClick={() => createWithPrompt(p)}
                disabled={creating}
                className="rounded-full border border-border/80 bg-white px-3 py-1.5 text-xs text-foreground/70 shadow-sm transition-all duration-150 hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.97] disabled:opacity-50"
              >
                {p}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* New chat button */}
      <div className="px-4 pt-3 pb-2">
        <Button
          onClick={createNew}
          disabled={creating}
          size="sm"
          variant="outline"
          className="w-full gap-2 border-dashed border-border/80 text-foreground/70 shadow-none transition-all duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          {creating ? (
            <TypingDots />
          ) : (
            <IconPlus size={15} stroke={2} />
          )}
          Новый чат
        </Button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <TypingDots />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <IconMessage size={18} className="text-muted-foreground" stroke={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">Нет бесед</p>
            <p className="mt-0.5 text-xs text-muted-foreground/60">
              Начните новый чат с ассистентом
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                onClick={() => onSelect(c.id)}
                className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-150 hover:bg-primary/[0.04]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground/85 transition-colors group-hover:text-foreground">
                    {c.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                    {new Date(c.updated_at || c.created_at).toLocaleDateString(
                      "ru-RU",
                      { day: "numeric", month: "short" },
                    )}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteConv(e, c.id)}
                  className="ml-2 shrink-0 rounded-md p-1 opacity-0 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <IconTrash size={13} stroke={1.8} />
                </button>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chat View ───────────────────────────────────────────────────────────────

function ChatView({ conversationId: rawId }: { conversationId: string }) {
  const colonIdx = rawId.indexOf(":");
  const [convId, initialPrompt] =
    colonIdx > 0 ? [rawId.slice(0, colonIdx), rawId.slice(colonIdx + 1)] : [rawId, ""];

  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialSent = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamText, scrollToBottom]);

  // Load conversation
  useEffect(() => {
    (async () => {
      try {
        const data = await aiApi.getConversation(convId);
        setMessages(data.messages || []);
      } catch {
        /* new conversation */
      } finally {
        setLoading(false);
      }
    })();
  }, [convId]);

  // Send initial prompt
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
                content: chunk.content || "Произошла ошибка.",
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

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  }, [input]);

  const canSend = input.trim().length > 0 && !streaming;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth px-4 py-4"
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <TypingDots />
          </div>
        ) : messages.length === 0 && !streaming ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5">
              <IconSparkles
                size={22}
                className="text-primary"
                stroke={1.8}
              />
            </div>
            <p className="text-sm font-medium text-foreground/80">
              Чем могу помочь?
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Спросите про книги, рекомендации или события
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id} message={msg} index={i} />
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
                index={messages.length}
                isStreaming
              />
            )}
            {streaming && !streamText && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl rounded-bl-md bg-muted/60 px-4 py-3">
                  <TypingDots />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="relative px-3 pb-3 pt-1 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border/80 before:to-transparent">
        <div className="flex items-end gap-2 rounded-xl border border-border/80 bg-white p-1.5 shadow-sm transition-shadow duration-200 focus-within:border-primary/30 focus-within:shadow-[0_0_0_3px_hsl(155_50%_23%/0.06)]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
            disabled={streaming}
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-snug text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-40"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!canSend}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
              canSend
                ? "bg-primary text-white shadow-sm hover:bg-primary-dark active:scale-95"
                : "text-muted-foreground/30",
            )}
          >
            {streaming ? (
              <TypingDots small />
            ) : (
              <IconSend size={15} stroke={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({
  message,
  index,
  isStreaming,
}: {
  message: AiMessage;
  index: number;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.1) }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <IconSparkles size={12} className="text-primary" stroke={2.5} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
          isUser
            ? "rounded-br-md bg-gradient-to-b from-primary to-primary-dark text-white"
            : "rounded-bl-md bg-muted/50 text-foreground/85",
          isStreaming && "transition-all",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </motion.div>
  );
}

// ── Typing Dots ─────────────────────────────────────────────────────────────

function TypingDots({ small }: { small?: boolean }) {
  const size = small ? "h-1 w-1" : "h-1.5 w-1.5";
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn(size, "rounded-full bg-primary/50")}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}