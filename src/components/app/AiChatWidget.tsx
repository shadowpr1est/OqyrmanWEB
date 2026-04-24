import { useState, useEffect } from "react";
import { IconX, IconArrowLeft } from "@tabler/icons-react";
import { AiMark } from "@/components/shared/AiMark";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { onOpenChatConversation } from "@/lib/aiChatBus";
import { ConversationList } from "@/components/ai/ConversationList";
import { ChatView } from "@/components/ai/ChatView";

// ── Widget Root ─────────────────────────────────────────────────────────────

export function AiChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [initialConv, setInitialConv] = useState<string | null>(null);
  // Bumped on every external open request to remount ChatPanel into the
  // requested conversation, even if the panel was already open.
  const [openSeq, setOpenSeq] = useState(0);

  useEffect(() => {
    return onOpenChatConversation(({ conversationId }) => {
      setInitialConv(conversationId);
      setOpen(true);
      setOpenSeq((n) => n + 1);
    });
  }, []);

  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-[4.5rem] lg:bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-primary-light to-primary text-white shadow-[0_4px_20px_rgba(0,0,0,0.15),0_2px_0_0_rgba(255,255,255,0.15)_inset] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.2),0_2px_0_0_rgba(255,255,255,0.15)_inset] active:translate-y-0 active:scale-95"
            aria-label="AI ассистент"
          >
            <AiMark size={26} mono className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel — keyed by openSeq so external opens force a fresh mount */}
      <AnimatePresence>
        {open && (
          <ChatPanel
            key={openSeq}
            initialConversationId={initialConv}
            onClose={() => {
              setOpen(false);
              setInitialConv(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Chat Panel ──────────────────────────────────────────────────────────────

type View = "conversations" | "chat";

function ChatPanel({
  onClose,
  initialConversationId,
}: {
  onClose: () => void;
  initialConversationId?: string | null;
}) {
  const [view, setView] = useState<View>(
    initialConversationId ? "chat" : "conversations",
  );
  const [activeConv, setActiveConv] = useState<string | null>(
    initialConversationId ?? null,
  );

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
      className="fixed bottom-[4.5rem] lg:bottom-6 right-6 z-50 flex h-[min(520px,calc(100dvh-5rem))] lg:h-[min(520px,calc(100dvh-3rem))] w-[min(380px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-[0_16px_70px_-12px_rgba(0,0,0,0.25)]"
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
            <AiMark size={16} animated={false} />
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
