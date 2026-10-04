import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type User = {
  id?: number;
  username?: string;
  email?: string;
  is_admin?: boolean;
  is_active?: boolean;
  created_at?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    console.log("[Auth] Clearing authentication state");

    setUser(null);

    localStorage.removeItem("logged_in");
    localStorage.removeItem("email");
  }, []);

  const refreshUser = useCallback(async () => {
    console.log("[Auth] Checking /api/auth/profile...");

    try {
      const response = await fetch(
        "/api/auth/profile",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      console.log(
        "[Auth] Profile status:",
        response.status
      );

      if (!response.ok) {
        console.log(
          "[Auth] Not authenticated:",
          response.status
        );

        clearAuthState();

        return;
      }

      const data = await response.json();

      console.log(
        "[Auth] Authenticated user:",
        data
      );

      setUser(data);

      localStorage.setItem(
        "logged_in",
        "true"
      );

      if (typeof data.email === "string") {
        localStorage.setItem(
          "email",
          data.email
        );
      }
    } catch (error) {
      console.error(
        "[Auth] Profile request error:",
        error
      );

      clearAuthState();
    }
  }, [clearAuthState]);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!mounted) return;

      setLoading(true);

      await refreshUser();

      if (mounted) {
        setLoading(false);
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "[Auth] Logout request failed:",
        error
      );
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}