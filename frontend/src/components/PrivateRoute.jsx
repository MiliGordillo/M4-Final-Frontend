import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

// Ruta protegida para usuarios autenticados y con perfil seleccionado
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { profile } = useProfile();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!profile || !profile._id) return <Navigate to="/profiles" />;
  return children;
};

export default PrivateRoute;
