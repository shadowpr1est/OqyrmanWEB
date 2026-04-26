import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface GenreBadgeProps {
  name: string;
  slug?: string;
  id?: string;
  interactive?: boolean;
}

export const GenreBadge = ({ name, slug, id, interactive = true }: GenreBadgeProps) => {
  const { t } = useTranslation();
  const label = slug ? t(`genres.${slug}`, { defaultValue: name }) : name;

  const classes =
    "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/8 text-primary border border-primary/10 transition-colors";

  if (interactive && id) {
    return (
      <Link to={`/books?genre=${id}`} className={`${classes} hover:bg-primary/15`}>
        {label}
      </Link>
    );
  }

  return <span className={classes}>{label}</span>;
};
