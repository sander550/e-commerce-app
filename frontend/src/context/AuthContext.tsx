import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

/* ---------------------------------------------------------
 * GLOBAL 401 MONITOR
 *
 * The access/refresh tokens live in HttpOnly cookies, so the
 * frontend can never inspect them directly. The only
 * trustworthy signal that the session is gone is the backend
 * answering 401 to any /api request.
 *
 * A single fetch wrapper turns that signal into an immediate
 * invalidation of the cached `user`. This is what keeps stale
 * React state from pretending we are logged in, and what stops
 * the /login <-> protected-page redirect ping-pong: by the time
 * a page navigates to /login, the cached user is already null,
 * so the login page never bounces straight back.
 *
 * The cookies themselves are never moved into localStorage or
 * sessionStorage.
 * --------------------------------------------------------- */

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

const originalFetch = window.fetch.bind(window);

window.fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const response = await originalFetch(input, init);

  if (response.status === 401 && unauthorizedHandler !== null) {
    const url = getRequestUrl(input);

    if (url.startsWith("/api/")) {
      // Idempotent: N simultaneous 401s just clear a state
      // that is already cleared. It never triggers requests.
      unauthorizedHandler();
    }
  }

  return response;
};

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Deduplicates concurrent profile checks: AuthProvider's
   * initial check and ProtectedRoute's revalidation share one
   * single request instead of firing duplicates.
   */
  const inFlightRef = useRef<Promise<void> | null>(null);

  /*
   * Incremented on logout so an in-flight profile request that
   * started before the logout cannot re-populate the user.
   */
  const epochRef = useRef(0);

  const clearAuthState = useCallback(() => {
    setUser(null);
  }, []);

  /* Register the global 401 handler while mounted. */
  useEffect(() => {
    unauthorizedHandler = clearAuthState;

    return () => {
      if (unauthorizedHandler === clearAuthState) {
        unauthorizedHandler = null;
      }
    };
  }, [clearAuthState]);

  const refreshUser = useCallback(async (): Promise<void> => {
    // One shared request at a time.
    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    const epoch = epochRef.current;

    const request = (async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        // Superseded (e.g. logout happened meanwhile).
        if (epoch !== epochRef.current) return;

        if (!response.ok) {
          // Missing/invalid tokens or failed refresh → the
          // backend answered 401 → treat as logged out now.
          clearAuthState();
          return;
        }

        const data = await response.json();

        if (epoch !== epochRef.current) return;

        setUser(data);
      } catch (error) {
        if (epoch !== epochRef.current) return;

        console.error(
          "[Auth] Profile request error:",
          error
        );

        clearAuthState();
      }
    })().finally(() => {
      if (inFlightRef.current === request) {
        inFlightRef.current = null;
      }
    });

    inFlightRef.current = request;

    return request;
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
    // Invalidate any in-flight profile check first, so it can
    // never restore the user after we clear it.
    epochRef.current += 1;
    inFlightRef.current = null;

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
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
