import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconLanguage,
  IconSparkles,
  IconX,
  IconBookmark,
  IconCheck,
  IconCopy,
  IconRefresh,
  IconAlertCircle,
  IconMessageCircle,
} from "@tabler/icons-react";
import { aiApi, notesApi } from "@/lib/api";
import { AiMark } from "@/components/shared/AiMark";
import { formatPosition, type PositionKind } from "@/lib/notePosition";
import { openChatConversation } from "@/lib/aiChatBus";

type AiReaderAction = "ask" | "translate";

const ACTION_LABELS: Record<AiReaderAction, string> = {
  ask: "Спросить AI",
  translate: "Перевести",
};

const ACTION_ICONS: Record<AiReaderAction, React.ReactNode> = {
  ask: <IconSparkles size={15} stroke={2} />,
  translate: <IconLanguage size={15} stroke={2} />,
};

export interface ReaderSelection {
  text: string;
  rect: { top: number; left: number; width: number; height: number };
  context?: string;
  // Precise locator used to jump back to this selection from the notes list.
  // `label` is what's shown in the UI ("стр. 42", "45%").
  locator?: { kind: PositionKind; value: string; label: string };
}

interface Props {
  bookId: string;
  progress: number;
  selection: ReaderSelection | null;
  onDismiss: () => void;
}

const POPOVER_WIDTH = 332;
const POPOVER_HEIGHT = 44;
const VIEWPORT_PAD = 10;

export const AiSelectionLayer = ({
  bookId,
  progress,
  selection,
  onDismiss,
}: Props) => {
  const [activeAction, setActiveAction] = useState<AiReaderAction | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedState, setSavedState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [copied, setCopied] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const activeSelectionRef = useRef<ReaderSelection | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const runAction = useCallback(
    async (action: AiReaderAction, sourceSelection?: ReaderSelection) => {
      const sel = sourceSelection ?? selection;
      if (!sel) return;
      activeSelectionRef.current = sel;
      setActiveAction(action);
      setResultOpen(true);
      setStreaming(true);
      setStreamText("");
      setError(null);
      setSavedState("idle");
      setCopied(false);
      onDismiss();

      try {
        const abort = new AbortController();
        abortRef.current = abort;

        await aiApi.explainSelection(
          bookId,
          action,
          sel.text,
          (chunk) => {
            if (chunk.type === "chunk" && chunk.content) {
              setStreamText((prev) => prev + chunk.content);
            } else if (chunk.type === "error") {
              setError(chunk.content || "Не удалось получить ответ");
            }
          },
          abort.signal,
          sel.context,
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Не удалось получить ответ. Попробуйте позже.");
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [selection, bookId, onDismiss],
  );

  const retry = useCallback(() => {
    if (!activeAction || !activeSelectionRef.current) return;
    runAction(activeAction, activeSelectionRef.current);
  }, [activeAction, runAction]);

  const closeResult = useCallback(() => {
    abortRef.current?.abort();
    setResultOpen(false);
    setActiveAction(null);
    setStreamText("");
    setError(null);
    setSavedState("idle");
    setCopied(false);
    setContinuing(false);
    activeSelectionRef.current = null;
  }, []);

  const continueInChat = useCallback(async () => {
    const sel = activeSelectionRef.current;
    if (!sel || !streamText || !activeAction || streaming || continuing) return;
    setContinuing(true);
    try {
      const { id } = await aiApi.seedConversationFromSelection(bookId, {
        action: activeAction,
        selection: sel.text,
        answer: streamText,
      });
      openChatConversation(id);
      closeResult();
    } catch {
      setContinuing(false);
    }
  }, [streamText, activeAction, streaming, continuing, bookId, closeResult]);

  // Esc to close result modal
  useEffect(() => {
    if (!resultOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeResult();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resultOpen, closeResult]);

  // Autofocus close button when modal opens (a11y)
  useEffect(() => {
    if (resultOpen) {
      const id = requestAnimationFrame(() => closeButtonRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [resultOpen]);

  const saveAsNote = useCallback(async () => {
    const sel = activeSelectionRef.current;
    if (!sel || !streamText || savedState !== "idle") return;
    setSavedState("saving");
    try {
      const label = activeAction ? ACTION_LABELS[activeAction] : "ИИ";
      const content = [
        `📌 «${sel.text}»`,
        ``,
        `🤖 ${label}:`,
        streamText,
      ].join("\n");
      const position = sel.locator
        ? formatPosition(sel.locator.kind, sel.locator.value, sel.locator.label)
        : `${progress}%`;
      await notesApi.create({
        book_id: bookId,
        position,
        content,
      });
      setSavedState("saved");
    } catch {
      setSavedState("idle");
    }
  }, [streamText, savedState, activeAction, bookId, progress]);

  const copyResponse = useCallback(async () => {
    if (!streamText) return;
    try {
      await navigator.clipboard.writeText(streamText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore — clipboard may be blocked in insecure contexts
    }
  }, [streamText]);

  // ── Popover position (clamped to viewport) ───────────────────────────────
  const popoverStyle: React.CSSProperties | null = selection
    ? (() => {
        const centerX = selection.rect.left + selection.rect.width / 2;
        let left = centerX - POPOVER_WIDTH / 2;
        left = Math.max(
          VIEWPORT_PAD,
          Math.min(window.innerWidth - POPOVER_WIDTH - VIEWPORT_PAD, left),
        );
        let top = selection.rect.top - POPOVER_HEIGHT - 12;
        let placedBelow = false;
        if (top < VIEWPORT_PAD) {
          top = selection.rect.top + selection.rect.height + 12;
          placedBelow = true;
        }
        return {
          position: "fixed",
          top,
          left,
          width: POPOVER_WIDTH,
          ["--arrow-side" as string]: placedBelow ? "top" : "bottom",
        };
      })()
    : null;

  return (
    <>
      {/* Floating action popover */}
      <AnimatePresence>
        {selection && popoverStyle && !resultOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={popoverStyle}
            onMouseDown={(e) => e.preventDefault()}
            className="z-[120] flex items-center gap-0.5 rounded-2xl border border-border/60 bg-white/95 p-1 shadow-[0_10px_32px_-8px_rgba(0,0,0,0.22),0_2px_0_0_rgba(255,255,255,0.8)_inset] backdrop-blur-md"
            role="toolbar"
            aria-label="Действия ИИ над выделением"
          >
            {(["ask", "translate"] as AiReaderAction[]).map((action) => (
              <PopoverButton
                key={action}
                icon={ACTION_ICONS[action]}
                label={action === "translate" ? "Перевод" : ACTION_LABELS[action]}
                onClick={() => runAction(action)}
              />
            ))}
            <div className="mx-0.5 h-5 w-px bg-border/60" />
            <button
              onClick={onDismiss}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground active:scale-90"
              aria-label="Закрыть"
            >
              <IconX size={14} stroke={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result modal */}
      <AnimatePresence>
        {resultOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-[130] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
            onClick={closeResult}
            role="dialog"
            aria-modal="true"
            aria-label={activeAction ? ACTION_LABELS[activeAction] : "AI"}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 24 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.25)] sm:rounded-2xl sm:shadow-[0_24px_80px_-16px_rgba(0,0,0,0.3)]"
            >
              {/* Mobile grab handle */}
              <div className="flex justify-center pt-2 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-border/70" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light/20 to-primary/15 shadow-[0_1px_0_0_rgba(255,255,255,0.8)_inset]">
                    <AiMark size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-tight text-foreground">
                      {activeAction ? ACTION_LABELS[activeAction] : "AI"}
                    </span>
                    <span className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
                      Ассистент
                    </span>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={closeResult}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Закрыть (Esc)"
                >
                  <IconX size={16} stroke={1.8} />
                </button>
              </div>

              {/* Quoted selection */}
              {activeSelectionRef.current && (
                <div className="border-b border-border/40 bg-gradient-to-b from-muted/40 to-muted/20 px-5 py-3">
                  <p className="line-clamp-3 border-l-2 border-primary/40 pl-3 text-[12.5px] italic leading-relaxed text-muted-foreground">
                    {activeSelectionRef.current.text}
                  </p>
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {error ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                      <IconAlertCircle size={20} stroke={1.8} />
                    </div>
                    <p className="text-sm text-destructive">{error}</p>
                    <button
                      onClick={retry}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
                    >
                      <IconRefresh size={13} stroke={1.8} /> Повторить
                    </button>
                  </div>
                ) : streaming && !streamText ? (
                  <ThinkingIndicator />
                ) : (
                  <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-foreground/90">
                    {streamText}
                    {streaming && (
                      <motion.span
                        aria-hidden
                        className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-primary/80 align-middle"
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity }}
                      />
                    )}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 border-t border-border/40 bg-muted/20 px-5 py-3">
                <span className="text-[11px] text-muted-foreground">
                  Позиция: {progress}%
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={continueInChat}
                    disabled={!streamText || streaming || continuing}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                    aria-label="Продолжить в чате"
                    title="Продолжить в чате"
                  >
                    {continuing ? (
                      <motion.span
                        className="h-3 w-3 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <IconMessageCircle size={13} stroke={1.8} />
                    )}
                    В чат
                  </button>
                  <button
                    onClick={copyResponse}
                    disabled={!streamText || streaming}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                    aria-label="Копировать"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copied ? (
                        <motion.span
                          key="copied"
                          initial={{ opacity: 0, y: 2 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -2 }}
                          transition={{ duration: 0.14 }}
                          className="inline-flex items-center gap-1.5 text-primary"
                        >
                          <IconCheck size={13} stroke={2} /> Скопировано
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, y: 2 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -2 }}
                          transition={{ duration: 0.14 }}
                          className="inline-flex items-center gap-1.5"
                        >
                          <IconCopy size={13} stroke={1.8} /> Скопировать
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <button
                    onClick={saveAsNote}
                    disabled={
                      !streamText || streaming || savedState !== "idle"
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-primary-light to-primary px-3 py-1.5 text-xs font-semibold text-white shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset] transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2),0_1px_0_0_rgba(255,255,255,0.2)_inset] active:translate-y-0 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {savedState === "saved" ? (
                        <motion.span
                          key="saved"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.16 }}
                          className="inline-flex items-center gap-1.5"
                        >
                          <IconCheck size={13} stroke={2.2} /> Сохранено
                        </motion.span>
                      ) : savedState === "saving" ? (
                        <motion.span
                          key="saving"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-1.5"
                        >
                          <motion.span
                            className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          Сохраняю…
                        </motion.span>
                      ) : (
                        <motion.span
                          key="save"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-1.5"
                        >
                          <IconBookmark size={13} stroke={1.8} /> В заметки
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ThinkingIndicator = () => (
  <div className="flex items-center gap-2.5 py-2 text-sm text-muted-foreground">
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary/60"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
    <motion.span
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    >
      Думаю над ответом…
    </motion.span>
  </div>
);

const PopoverButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 text-[11.5px] font-medium text-foreground/80 transition-all hover:bg-gradient-to-b hover:from-primary/12 hover:to-primary/8 hover:text-primary active:scale-95"
  >
    <span className="text-foreground/60 transition-colors group-hover:text-primary">
      {icon}
    </span>
    {label}
  </button>
);
