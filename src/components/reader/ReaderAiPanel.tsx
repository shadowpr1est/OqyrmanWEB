import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowLeft, IconChevronRight } from "@tabler/icons-react";
import { AiMark } from "@/components/shared/AiMark";
import { ConversationList } from "@/components/ai/ConversationList";
import { ChatView } from "@/components/ai/ChatView";
import { onOpenChatConversation } from "@/lib/aiChatBus";

type View = "conversations" | "chat";

interface ReaderAiPanelProps {
  // Optional: pass true when toolbar has a dark background so the icon uses mono/white
  darkToolbar?: boolean;
}

export function ReaderAiPanel({ darkToolbar = false }: ReaderAiPanelProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("conversations");
  const [activeConv, setActiveConv] = useState<string | null>(null);

  useEffect(() => {
    return onOpenChatConversation(({ conversationId }) => {
      setActiveConv(conversationId);
      setView("chat");
      setOpen(true);
    });
  }, []);

  const openConversation = (id: string) => {
    setActiveConv(id);
    setView("chat");
  };

  const goBack = () => {
    setActiveConv(null);
    setView("conversations");
  };

  const toggle = () => setOpen((v) => !v);

  return (
    <>
      <button
        onClick={toggle}
        className={`relative p-2 rounded-lg transition-colors ${
          darkToolbar
            ? open
              ? "bg-white/25"
              : "hover:bg-white/15"
            : open
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted/60"
        }`}
        title="AI Ассистент"
      >
        <AiMark size={18} animated={false} mono={darkToolbar} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-0 h-full w-full sm:w-80 max-w-[320px] bg-white border-l border-border/60 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <AnimatePresence mode="popLayout">
                  {view === "chat" && (
                    <motion.button
                      key="back"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.12 }}
                      onClick={goBack}
                      className="p-0.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <IconArrowLeft size={16} stroke={1.8} />
                    </motion.button>
                  )}
                </AnimatePresence>
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                  <AiMark size={14} animated={false} />
                </div>
                <span className="text-sm font-semibold text-foreground">AI Ассистент</span>
              </div>
              <button
                onClick={toggle}
                className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground"
                title="Закрыть"
              >
                <IconChevronRight size={16} stroke={1.5} />
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait" initial={false}>
              {view === "conversations" ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="flex flex-1 flex-col overflow-hidden"
                >
                  <ConversationList onSelect={openConversation} />
                </motion.div>
              ) : (
                activeConv && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="flex flex-1 flex-col overflow-hidden"
                  >
                    <ChatView conversationId={activeConv} />
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
