import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Navbar as ResizableNavbar,
  NavBody,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <ResizableNavbar>
      {/* Desktop */}
      <NavBody>
        <a href="/" className="relative z-20 flex items-center gap-2 px-2 py-1">
          <img
            src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png"
            alt="Oqyrman"
            className="h-8 w-8"
          />
          <span className="text-lg font-bold text-primary">Oqyrman</span>
        </a>

        <div className="relative z-20 flex items-center gap-2">
          {user ? (
            <NavbarButton variant="gradient" as={Link} to="/catalog">
              Каталог →
            </NavbarButton>
          ) : (
            <>
              <NavbarButton variant="secondary" as={Link} to="/login">
                Войти
              </NavbarButton>
              <NavbarButton variant="gradient" as={Link} to="/register">
                Регистрация
              </NavbarButton>
            </>
          )}
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav>
        <MobileNavHeader>
          <a href="/" className="flex items-center gap-2">
            <img
              src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png"
              alt="Oqyrman"
              className="h-8 w-8"
            />
            <span className="text-lg font-bold text-primary">Oqyrman</span>
          </a>
          <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
        </MobileNavHeader>

        <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
          <div className="flex w-full gap-3 pt-2">
            {user ? (
              <NavbarButton variant="gradient" as={Link} to="/catalog" className="flex-1">
                Каталог →
              </NavbarButton>
            ) : (
              <>
                <NavbarButton variant="secondary" as={Link} to="/login" className="flex-1 text-center border border-border text-neutral-700">
                  Войти
                </NavbarButton>
                <NavbarButton variant="gradient" as={Link} to="/register" className="flex-1">
                  Регистрация
                </NavbarButton>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
};
