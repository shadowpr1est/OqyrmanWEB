import { IconStar, IconStarFilled, IconStarHalfFilled } from "@tabler/icons-react";

interface RatingProps {
  value: number;
  max?: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}

export const Rating = ({ value, max = 5, size = 16, showValue = false, count }: RatingProps) => {
  const stars = Array.from({ length: max }, (_, i) => {
    const diff = value - i;
    if (diff >= 0.75) return "full";
    if (diff >= 0.25) return "half";
    return "empty";
  });

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((type, i) => {
          const Icon =
            type === "full" ? IconStarFilled : type === "half" ? IconStarHalfFilled : IconStar;
          return (
            <Icon
              key={i}
              size={size}
              className={type === "empty" ? "text-muted-foreground/30" : "text-amber-400"}
              stroke={1.5}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground/70 ml-0.5">
          {value.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-muted-foreground ml-0.5">({count})</span>
      )}
    </div>
  );
};
