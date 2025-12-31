import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const logIn = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logOut = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
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
