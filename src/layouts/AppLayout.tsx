import { Outlet } from "react-router-dom";
import { AppNavbar } from "@/components/app/AppNavbar";
import { AppFooter } from "@/components/app/AppFooter";

export const AppLayout = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <AppNavbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <AppFooter />
  </div>
);
