import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { IconSend } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { AiMark } from "@/components/shared/AiMark";
import { cn } from "@/lib/utils";
import { aiApi } from "@/lib/api/ai";
import type { AiMessage } from "@/lib/api/types";
import { TypingDots } from "./TypingDots";
import { MessageBubble } from "./MessageBubble";

export function ChatView({ conversationId: convId }: { conversationId: string }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [loading, setLoading] = useState(true);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamText, scrollToBottom]);

  useEffect(() => {
    (async () => {
      try {
        const data = await aiApi.getConversation(convId);
        setMessages(data.messages || []);
      } catch {
        /* new conversation — expected for fresh chats */
      } finally {
        setLoading(false);
      }
    })();

    aiApi
      .suggestedPrompts()
      .then((res) => {
        if (res?.prompts?.length) setSuggestedPrompts(res.prompts);
      })
      .catch(() => {});
  }, [convId]);

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
                content: chunk.content || t("chat.errorOccurred"),
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
            content: t("chat.errorTryLater"),
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <TypingDots />
          </div>
        ) : messages.length === 0 && !streaming ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5">
              <AiMark size={26} />
            </div>
            <p className="text-sm font-medium text-foreground/80">{t("chat.howCanIHelp")}</p>
            {suggestedPrompts.length > 0 ? (
              <div className="mt-4 flex flex-col gap-2 w-full px-1">
                {suggestedPrompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="w-full rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-left text-xs text-foreground/70 transition-all duration-150 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground/60">
                {t("chat.askHint")}
              </p>
            )}
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

      <div className="relative px-3 pb-3 pt-1 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border/80 before:to-transparent">
        <div className="flex items-end gap-2 rounded-xl border border-border/80 bg-white p-1.5 shadow-sm transition-shadow duration-200 focus-within:border-primary/30 focus-within:shadow-[0_0_0_3px_hsl(155_50%_23%/0.06)]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.inputPlaceholder")}
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
            {streaming ? <TypingDots small /> : <IconSend size={15} stroke={2} />}
          </button>
        </div>
      </div>
    </div>
  );
}
