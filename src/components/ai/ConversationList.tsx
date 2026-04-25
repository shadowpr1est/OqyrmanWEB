import { useState, useCallback, useEffect } from "react";
import { IconPlus, IconMessage, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { aiApi } from "@/lib/api/ai";
import type { AiConversation } from "@/lib/api/types";
import { TypingDots } from "./TypingDots";

export function ConversationList({ onSelect }: { onSelect: (id: string) => void }) {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const convs = await aiApi.listConversations();
      setConversations(convs || []);
    } catch {
      toast.error("Не удалось загрузить чаты. Попробуйте позже.");
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
      toast.error("Не удалось создать чат. Попробуйте позже.");
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
      toast.error("Не удалось удалить чат.");
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 pb-2">
        <Button
          onClick={createNew}
          disabled={creating}
          size="sm"
          variant="outline"
          className="w-full gap-2 border-dashed border-border/80 text-foreground/70 shadow-none transition-all duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          {creating ? <TypingDots /> : <IconPlus size={15} stroke={2} />}
          Новый чат
        </Button>
      </div>

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
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                onClick={() => onSelect(c.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(c.id)}
                className="group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-150 hover:bg-primary/[0.04]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground/85 transition-colors group-hover:text-foreground">
                    {c.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                    {new Date(c.updated_at || c.created_at).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteConv(e, c.id)}
                  className="ml-2 shrink-0 rounded-md p-1 opacity-0 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <IconTrash size={13} stroke={1.8} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
