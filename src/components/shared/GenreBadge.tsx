import { Link } from "react-router-dom";

interface GenreBadgeProps {
  name: string;
  id?: string;
  interactive?: boolean;
}

export const GenreBadge = ({ name, id, interactive = true }: GenreBadgeProps) => {
  const classes =
    "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/8 text-primary border border-primary/10 transition-colors";

  if (interactive && id) {
    return (
      <Link to={`/books?genre=${id}`} className={`${classes} hover:bg-primary/15`}>
        {name}
      </Link>
    );
  }

  return <span className={classes}>{name}</span>;
};
