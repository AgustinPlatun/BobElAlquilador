import React from "react";
import { Navigate } from "react-router-dom";

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rol = sessionStorage.getItem("usuarioRol");
  const email = sessionStorage.getItem("usuarioEmail");

  if (!email) {
    // No logueado
    return <Navigate to="/login" replace />;
  }
  if (rol !== "administrador") {
    // Logueado pero no admin
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default RequireAdmin;