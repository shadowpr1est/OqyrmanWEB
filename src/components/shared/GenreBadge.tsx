import { Link } from "react-router-dom";

interface GenreBadgeProps {
  name: string;
  slug?: string;
  interactive?: boolean;
}

export const GenreBadge = ({ name, slug, interactive = true }: GenreBadgeProps) => {
  const classes =
    "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/8 text-primary border border-primary/10 transition-colors";

  if (interactive && slug) {
    return (
      <Link to={`/genres/${slug}`} className={`${classes} hover:bg-primary/15`}>
        {name}
      </Link>
    );
  }

  return <span className={classes}>{name}</span>;
};
