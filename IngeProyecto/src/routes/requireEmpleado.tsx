import React from "react";
import { Navigate } from "react-router-dom";

const RequireEmpleado: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rol = sessionStorage.getItem("usuarioRol");
  const email = sessionStorage.getItem("usuarioEmail");

  if (!email) {
    // No logueado
    return <Navigate to="/login" replace />;
  }
  if (rol !== "empleado") {
    // Logueado pero no empleado
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default RequireEmpleado;