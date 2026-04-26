import { useTranslation } from "react-i18next";
import { IconStar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface ReviewFormProps {
  rating: number;
  body: string;
  onRatingChange: (v: number) => void;
  onBodyChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
  minHeight?: string;
}

export const ReviewForm = ({
  rating,
  body,
  onRatingChange,
  onBodyChange,
  onSubmit,
  onCancel,
  isPending,
  minHeight = "min-h-[100px]",
}: ReviewFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground mr-2">{t("book.reviewRating")}</span>
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onRatingChange(v)}
            className="p-0.5 hover:scale-110 transition-transform"
            aria-label={t("book.reviewStars", { count: v })}
          >
            <IconStar
              size={22}
              fill={v <= rating ? "currentColor" : "none"}
              className={v <= rating ? "text-amber-400" : "text-muted-foreground/30"}
              stroke={1.5}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        placeholder={t("book.reviewPlaceholder")}
        className={`w-full rounded-lg border border-border bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 ${minHeight}`}
      />

      <div className="flex gap-2">
        <Button size="sm" disabled={rating === 0 || isPending} onClick={onSubmit}>
          {isPending ? t("book.reviewSending") : t("book.reviewSubmit")}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
};
