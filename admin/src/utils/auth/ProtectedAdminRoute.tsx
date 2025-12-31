import { Navigate } from "react-router-dom";
import useAuth from "./AuthHook";

const ProtectedAdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (!["admin", "dealer"].includes(user?.role)) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
