// Hook to check if current user is dealer and filter menu items
import { useMemo } from "react";
import useAuth from "utils/auth/AuthHook";

export const useRoleBasedRoutes = (routes: any[]) => {
  const { user } = useAuth();

  const filteredRoutes = useMemo(() => {
    if (!user) return routes;

    // If user is dealer, hide certain admin-only routes
    if (user.role === "dealer") {
      return routes.filter((route) => {
        // Dealers can't access: Dealers, Customers, Referrals pages
        const hiddenPaths = ["dealers", "customers", "referrals"];
        return !hiddenPaths.includes(route.path);
      });
    }

    // Admin sees everything
    return routes;
  }, [routes, user]);

  return filteredRoutes;
};
