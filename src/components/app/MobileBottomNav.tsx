import { NavLink } from "react-router-dom";
import {
  IconHome,
  IconSearch,
  IconBookmarks,
  IconUser,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export const MobileBottomNav = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const items = [
    { label: t("nav.home"), to: "/catalog", icon: IconHome },
    { label: t("nav.search"), to: "/books", icon: IconSearch },
    { label: t("nav.shelf"), to: "/wishlist", icon: IconBookmarks },
    { label: t("nav.profileShort"), to: "/profile", icon: IconUser },
  ];

  if (!user) return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-border/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative flex items-center justify-center w-10 h-6 rounded-full transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                  <Icon size={20} stroke={isActive ? 2 : 1.6} />
                </div>
                <span className={`text-[10px] font-medium leading-none transition-colors ${isActive ? "text-primary" : "text-muted-foreground/50"}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
