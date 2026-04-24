import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { SearchBar } from "./SearchBar";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import {
  IconMenu2,
  IconX,
  IconHome,
  IconBuildingArch,
  IconCalendarEvent,
  IconBookmarks,
} from "@tabler/icons-react";
import { backdropFade, slideDown } from "@/lib/motion";

// Desktop nav — all sections
const desktopLinks = [
  { label: "Главная", to: "/catalog" },
  { label: "Библиотеки", to: "/libraries" },
  { label: "События", to: "/events" },
  { label: "Полка", to: "/wishlist" },
];

// Mobile hamburger — only items not covered by the bottom nav
const mobileExtraLinks = [
  { label: "Библиотеки", to: "/libraries", icon: IconBuildingArch },
  { label: "События", to: "/events", icon: IconCalendarEvent },
];

// Mobile bottom nav covers these — shown in hamburger only for guests
const mobileGuestLinks = [
  { label: "Главная", to: "/catalog", icon: IconHome },
  { label: "Полка", to: "/wishlist", icon: IconBookmarks },
];

export const AppNavbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const mobileLinks = user ? mobileExtraLinks : [...mobileGuestLinks, ...mobileExtraLinks];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + desktop nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png"
                alt="Oqyrman"
                className="h-8 w-8"
              />
              <span className="text-lg font-bold text-primary">Oqyrman</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {desktopLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Desktop search */}
          <div className="hidden lg:block">
            <SearchBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {user ? (
              <>
                <NotificationBell />
                <UserMenu />
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] hover:-translate-y-0.5 transition-transform"
                >
                  Регистрация
                </Link>
              </div>
            )}

            {/* Mobile hamburger — Библиотеки + События */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <IconX size={22} className="text-foreground" aria-hidden="true" />
              ) : (
                <IconMenu2 size={22} className="text-foreground" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <motion.div
            {...backdropFade}
            className="lg:hidden fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            {...slideDown}
            className="lg:hidden absolute inset-x-0 top-16 z-50 border-t border-border/60 bg-white/95 backdrop-blur-xl shadow-xl"
          >
            <div className="container mx-auto px-5 sm:px-6 py-3">
              <nav className="space-y-1">
                {mobileLinks.map((l) => {
                  const Icon = l.icon;
                  return (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/70 active:bg-muted/60"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={20}
                            stroke={1.6}
                            className={isActive ? "text-primary" : "text-foreground/40"}
                          />
                          {l.label}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {!user && (
                <div className="flex gap-2.5 mt-3 pt-3 border-t border-border/60">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground/70 transition-colors"
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-b from-primary-light to-primary shadow-[0px_2px_0px_0px_rgba(255,255,255,0.15)_inset]"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </header>
  );
};
