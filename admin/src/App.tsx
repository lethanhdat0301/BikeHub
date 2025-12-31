import { Routes, Route, Navigate } from "react-router-dom";
import RtlLayout from "layouts/rtl";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import AuthProvider from "utils/auth/AuthProvider";
import ProtectedAdminRoute from "utils/auth/ProtectedAdminRoute";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="auth/*" element={<AuthLayout />} />

        <Route
          path="admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        />

        <Route path="rtl/*" element={<RtlLayout />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
