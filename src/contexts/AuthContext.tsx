import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { authApi, tokenStorage, userApi, onSessionExpired, AuthUser } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setAuthData: (user: AuthUser, accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setAuthData: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setLoading(false);
      return;
    }

    userApi
      .getMe()
      .then((me) => setUser(me))
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /* Listen for forced session expiry (refresh token failed) */
  useEffect(() => {
    return onSessionExpired(() => {
      setUser(null);
    });
  }, []);

  const setAuthData = useCallback(
    (newUser: AuthUser, accessToken: string, refreshToken: string) => {
      tokenStorage.set(accessToken, refreshToken);
      setUser(newUser);
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort logout
    }
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};
