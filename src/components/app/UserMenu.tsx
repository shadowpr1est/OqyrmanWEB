import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  IconUser,
  IconBookmark,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { icon: IconUser, label: "Профиль", to: "/profile" },
  { icon: IconBookmark, label: "Мои брони", to: "/reservations" },
];

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = `${user.name[0]}${user.surname[0]}`.toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/60 transition-colors outline-none">
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
            className="text-muted-foreground transition-transform duration-200"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-xl">
        <DropdownMenuLabel className="px-4 py-3 font-normal">
          <p className="text-sm font-medium text-foreground truncate">
            {user.name} {user.surname}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {menuItems.map((item) => (
          <DropdownMenuItem key={item.to} asChild className="focus:bg-primary/10 focus:text-foreground">
            <Link
              to={item.to}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 cursor-pointer"
            >
              <item.icon size={18} stroke={1.5} className="text-muted-foreground" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <IconLogout size={18} stroke={1.5} />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
