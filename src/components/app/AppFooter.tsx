import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const AppFooter = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/60 bg-white">
      <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link to="/catalog" className="flex items-center gap-2">
          <img
            src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png"
            alt="Oqyrman"
            className="h-6 w-6"
          />
          <span className="text-sm font-semibold text-primary">Oqyrman</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          {t("footer.appRights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
};
