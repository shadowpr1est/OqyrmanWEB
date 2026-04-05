import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SearchBar } from "./SearchBar";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: "Каталог", to: "/catalog" },
  { label: "Библиотеки", to: "/libraries" },
  { label: "Мероприятия", to: "/events" },
];

export const AppNavbar = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/catalog"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <img
                src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png"
                alt="Oqyrman"
                className="h-8 w-8"
              />
              <span className="text-lg font-bold text-primary">Oqyrman</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
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

          {/* Center: Search (desktop) */}
          <div className="hidden md:block">
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {user ? (
              <>
                <NotificationBell />
                <UserMenu />
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
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

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <IconX size={22} className="text-foreground" />
              ) : (
                <IconMenu2 size={22} className="text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/60 bg-white overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-muted/50"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}

              {!user && (
                <div className="flex gap-2 pt-2 border-t border-border/60">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-foreground/70"
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-b from-emerald-500 to-emerald-700"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
