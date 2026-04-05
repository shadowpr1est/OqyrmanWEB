import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  IconUser,
  IconHeart,
  IconBookmark,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { icon: IconUser, label: "Профиль", to: "/profile" },
  { icon: IconHeart, label: "Избранное", to: "/wishlist" },
  { icon: IconBookmark, label: "Мои брони", to: "/reservations" },
];

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const initials = `${user.name[0]}${user.surname[0]}`.toUpperCase();

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-foreground hidden md:block max-w-[100px] truncate">
          {user.name}
        </span>
        <IconChevronDown
          size={14}
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-white shadow-xl shadow-black/[0.08] overflow-hidden z-50"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-border/60">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name} {user.surname}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>

            {/* Links */}
            <div className="py-1.5">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <item.icon size={18} stroke={1.5} className="text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="border-t border-border/60 py-1.5">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <IconLogout size={18} stroke={1.5} />
                Выйти
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
