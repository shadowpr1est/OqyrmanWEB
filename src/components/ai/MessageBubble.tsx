import { motion } from "framer-motion";
import { AiMark } from "@/components/shared/AiMark";
import { cn } from "@/lib/utils";
import type { AiMessage } from "@/lib/api/types";

export function MessageBubble({
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
          <AiMark size={13} animated={false} />
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
