import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
type Props = {
  children: JSX.Element;
};
const Protected: React.FC<Props> = ({ children }) => {
  // const { user } = useAuth();
  // const location = useLocation().pathname;

  // Temporarily disabled authentication - allow all access
  return children;

  // Original code (commented out):
  // return user ? (
  //   children
  // ) : (
  //   <Navigate to={"/login"} state={{ from: location }} replace />
  // );
};

export default Protected;
