import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/layouts/ProtectedRoute";


// Landing & auth (eagerly loaded)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// App pages (lazy loaded)
const BooksCatalog = lazy(() => import("./pages/catalog/BooksCatalog"));
const BookDetail = lazy(() => import("./pages/books/BookDetail"));
const BooksSearch = lazy(() => import("./pages/books/BooksSearch"));
const AuthorDetail = lazy(() => import("./pages/authors/AuthorDetail"));
const Libraries = lazy(() => import("./pages/libraries/Libraries"));
const LibraryDetail = lazy(() => import("./pages/libraries/LibraryDetail"));
const Events = lazy(() => import("./pages/events/Events"));
const EventDetail = lazy(() => import("./pages/events/EventDetail"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Wishlist = lazy(() => import("./pages/wishlist/Wishlist"));
const Reservations = lazy(() => import("./pages/reservations/Reservations"));
const Notifications = lazy(() => import("./pages/notifications/Notifications"));
const Reader = lazy(() => import("./pages/reader/Reader"));


const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Landing */}
                <Route path="/" element={<Index />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Reader — fullscreen, no layout chrome */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/read/:id" element={<Reader />} />
                </Route>

                {/* App pages — all require auth */}
                <Route element={<AppLayout />}>
                  <Route element={<ProtectedRoute />}>
                    <Route path="/catalog" element={<BooksCatalog />} />
                    <Route path="/books" element={<BooksSearch />} />
                    <Route path="/books/:id" element={<BookDetail />} />
                    <Route path="/authors/:id" element={<AuthorDetail />} />
                    <Route path="/libraries" element={<Libraries />} />
                    <Route path="/libraries/:id" element={<LibraryDetail />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/reservations" element={<Reservations />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
