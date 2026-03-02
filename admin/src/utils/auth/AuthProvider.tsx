import { useState, useEffect, useRef, useCallback } from "react";
import AuthContext from "./AuthContext";

/** Decode JWT payload and check if the token is expired */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds; Date.now() is in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // malformed token → treat as expired
  }
}

const AuthProvider = ({ children }: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const originalFetch = useRef<typeof window.fetch | null>(null);

  const clearSession = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  const forceLogout = useCallback(() => {
    clearSession();
    // Only redirect if not already on the sign-in page
    if (!window.location.pathname.includes("/auth/")) {
      window.location.href = "/auth/sign-in";
    }
  }, [clearSession]);

  // On mount: check token expiry + monkey-patch fetch to catch 401/403
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedUser && token && !isTokenExpired(token)) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else if (storedUser || token) {
      // Has stored data but token is missing/expired → clear and force login
      clearSession();
    }
    setIsLoading(false);

    // Intercept all window.fetch calls to detect 401 Unauthorized
    originalFetch.current = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const response = await originalFetch.current!(...args);
      if (response.status === 401 || response.status === 403) {
        const currentToken = localStorage.getItem("token");
        // Only force logout if there was a token (real expiry), not anonymous requests
        if (currentToken) {
          forceLogout();
        }
      }
      return response;
    };

    return () => {
      // Restore original fetch on unmount
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
    };
  }, [clearSession, forceLogout]);

  // Periodically check token expiry every 60 seconds while the tab is open
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (isAuthenticated && (!token || isTokenExpired(token))) {
        forceLogout();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, forceLogout]);

  const logIn = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logOut = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, logIn, logOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
