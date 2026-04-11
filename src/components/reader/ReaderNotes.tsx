import { useEffect, useState, useRef } from "react";
import {
  IconNotes,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconChevronRight,
  IconX,
  IconNotebook,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { notesApi } from "@/lib/api";
import type { ReadingNote } from "@/lib/api/types";

interface ReaderNotesProps {
  bookId: string;
  currentPage: number;
}

export const ReaderNotes = ({ bookId, currentPage }: ReaderNotesProps) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newText, setNewText] = useState("");
  const [notes, setNotes] = useState<ReadingNote[]>([]);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  // Fetch notes on mount & when bookId changes
  useEffect(() => {
    notesApi.getByBook(bookId).then(setNotes).catch(() => {});
  }, [bookId]);

  const hasNoteOnPage = notes.some((n) => n.page === currentPage);
  const pageNotes = notes.filter((n) => n.page === currentPage);
  const otherNotes = notes.filter((n) => n.page !== currentPage);
  const sorted = [...pageNotes, ...otherNotes];

  const handleCreate = async () => {
    const text = newText.trim();
    if (!text || saving) return;
    setSaving(true);
    try {
      const note = await notesApi.create({
        book_id: bookId,
        page: currentPage,
        content: text,
      });
      setNotes((prev) => [note, ...prev]);
      setNewText("");
      setCreating(false);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await notesApi.delete(id);
    } catch {
      // Refetch on failure
      notesApi.getByBook(bookId).then(setNotes).catch(() => {});
    }
  };

  const startEdit = (note: ReadingNote) => {
    setEditingId(note.id);
    setEditText(note.content);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const handleEdit = async () => {
    if (!editingId || !editText.trim() || saving) return;
    setSaving(true);
    try {
      const updated = await notesApi.update(editingId, {
        content: editText.trim(),
      });
      setNotes((prev) =>
        prev.map((n) => (n.id === editingId ? updated : n)),
      );
      setEditingId(null);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const togglePanel = () => {
    setOpen((v) => !v);
    setCreating(false);
    setEditingId(null);
  };

  const openCreate = () => {
    setCreating(true);
    setEditingId(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const formatPosition = (page: number) => {
    return `Стр. ${page}`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ru", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Toolbar button */}
      <button
        onClick={togglePanel}
        className={`relative p-2 rounded-lg transition-colors ${
          open ? "bg-white/25" : "hover:bg-white/15"
        }`}
        title="Заметки"
      >
        <IconNotes size={18} stroke={1.5} />
        {hasNoteOnPage && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-primary" />
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-0 h-full w-80 bg-white border-l border-border/60 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <h3 className="text-sm font-semibold text-foreground">
                Заметки
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={openCreate}
                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                  title="Новая заметка"
                >
                  <IconPlus size={16} stroke={2} />
                </button>
                <button
                  onClick={togglePanel}
                  className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground"
                  title="Закрыть"
                >
                  <IconChevronRight size={16} stroke={1.5} />
                </button>
              </div>
            </div>

            {/* Create form */}
            <AnimatePresence>
              {creating && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden border-b border-border/40"
                >
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {formatPosition(currentPage)}
                      </span>
                      <span>— текущая страница</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                          handleCreate();
                      }}
                      placeholder="Ваша заметка…"
                      className="w-full resize-none rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 min-h-[72px]"
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Ctrl+Enter — сохранить
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setCreating(false);
                            setNewText("");
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/60 transition-colors"
                        >
                          Отмена
                        </button>
                        <button
                          onClick={handleCreate}
                          disabled={!newText.trim() || saving}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          Сохранить
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto">
              {sorted.length === 0 && !creating ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <IconNotebook
                    size={32}
                    stroke={1.2}
                    className="mb-2 opacity-40"
                  />
                  <p className="text-sm">Нет заметок</p>
                  <button
                    onClick={openCreate}
                    className="mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Добавить первую заметку
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {sorted.map((note) => {
                    const isCurrentPage = note.page === currentPage;
                    const isEditing = editingId === note.id;

                    return (
                      <div
                        key={note.id}
                        className={`px-4 py-3 transition-colors ${
                          isCurrentPage
                            ? "bg-emerald-50/60"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${
                                isCurrentPage
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-muted/60 text-muted-foreground"
                              }`}
                            >
                              {formatPosition(note.page)}
                            </span>
                            {isCurrentPage && (
                              <span className="text-emerald-600 font-medium">
                                •
                              </span>
                            )}
                          </div>
                          {!isEditing && (
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button
                                onClick={() => startEdit(note)}
                                className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
                                title="Редактировать"
                              >
                                <IconEdit size={13} stroke={1.5} />
                              </button>
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="p-1 rounded text-muted-foreground/60 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Удалить"
                              >
                                <IconTrash size={13} stroke={1.5} />
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              ref={editRef}
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  (e.ctrlKey || e.metaKey)
                                )
                                  handleEdit();
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="w-full resize-none rounded-lg border border-border/60 bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 min-h-[60px]"
                              rows={3}
                            />
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground"
                              >
                                <IconX size={14} stroke={1.5} />
                              </button>
                              <button
                                onClick={handleEdit}
                                disabled={!editText.trim() || saving}
                                className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors disabled:opacity-50"
                              >
                                <IconCheck size={14} stroke={2} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
                            {note.content}
                          </p>
                        )}

                        <p className="mt-1 text-[10px] text-muted-foreground/60">
                          {formatDate(note.created_at)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
