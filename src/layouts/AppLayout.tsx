import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AppNavbar } from "@/components/app/AppNavbar";
import { AppFooter } from "@/components/app/AppFooter";
import { MobileBottomNav } from "@/components/app/MobileBottomNav";

const AiChatWidget = lazy(() =>
  import("@/components/app/AiChatWidget").then((m) => ({ default: m.AiChatWidget })),
);

export const AppLayout = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <AppNavbar />
    <main className="flex-1 pb-16 lg:pb-0">
      <Outlet />
    </main>
    <AppFooter />
    <MobileBottomNav />
    <Suspense fallback={null}>
      <AiChatWidget />
    </Suspense>
  </div>
);
