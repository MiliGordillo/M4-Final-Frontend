import React, { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import axios from "axios";

const Layout = ({ children }) => {
  const { isAuthenticated, logout, user, token } = useAuth();
  const { profile, setProfile } = useProfile();
  const [profiles, setProfiles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isOnProfiles = location.pathname.startsWith("/profiles");
  const hasActiveProfile = Boolean(profile && profile._id);
  const showAppNav = isAuthenticated && hasActiveProfile && !isOnProfiles;

  // Cargar perfiles cada vez que cambia la ruta y el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/profiles`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setProfiles(res.data))
      .catch(() => setProfiles([]));
  }, [isAuthenticated, token, location.pathname]);

  // Si estoy en /profiles, limpio el perfil activo para obligar selección
  useEffect(() => {
    if (isAuthenticated && isOnProfiles && hasActiveProfile) {
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOnProfiles]);

  const handleLogout = () => {
    setProfile(null); // limpiar perfil guardado
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex flex-col">
      {/* NAVBAR FIJO */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-3 bg-black bg-opacity-80 shadow-lg z-50">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <h1 className="text-2xl font-extrabold tracking-tight text-green-400">🎵 MySpotify</h1>
        </div>

        {/* Menú Desktop (solo con perfil y fuera de /profiles) */}
        {showAppNav && (
          <nav className="hidden md:flex gap-6 text-sm font-semibold">
            <Link
              to="/songs"
              className={`hover:text-green-400 transition ${location.pathname === "/songs" ? "text-green-400" : ""}`}
            >
              Catálogo
            </Link>
            <Link
              to="/playlist"
              className={`hover:text-green-400 transition ${location.pathname === "/playlist" ? "text-green-400" : ""}`}
            >
              Mi Playlist
            </Link>
            <Link to="/profile" className="btn btn-profile">
              Ver Perfil
            </Link>
          </nav>
        )}

        {/* Lado derecho */}
        <div className="flex items-center gap-4">
          {/* Perfil (dropdown) - solo con perfil y fuera de /profiles */}
          {showAppNav && (
            <div className="relative">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowDropdown((v) => !v)}>
                {profile?.avatar && profile.avatar.startsWith('<svg') ? (
                  <span
                    className="w-8 h-8 rounded-full border-2 border-green-400 bg-white flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: profile.avatar }}
                    aria-label={profile?.name}
                  />
                ) : (
                  <img
                    src={profile?.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
                    alt={profile?.name}
                    className="w-8 h-8 rounded-full border-2 border-green-400 object-cover"
                  />
                )}
                <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {showDropdown && profiles.length > 0 && (
                <div className="absolute right-0 mt-3 bg-gray-900 border border-green-500 rounded-lg shadow-lg z-50 w-56">
                  {profiles.map((p) => (
                    <button
                      key={p._id}
                      className={`flex items-center w-full px-4 py-2 text-left text-sm hover:bg-green-900 transition ${
                        profile && p._id === profile._id ? "bg-green-800 font-bold" : ""
                      }`}
                      onClick={() => {
                        setProfile(p);
                        setShowDropdown(false);
                        navigate("/songs");
                      }}
                    >
                      {p.avatar && p.avatar.startsWith('<svg') ? (
                        <span
                          className="w-6 h-6 rounded-full mr-2 border border-green-400 bg-white flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: p.avatar }}
                          aria-label={p.name}
                        />
                      ) : (
                        <img
                          src={p.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
                          alt={p.name}
                          className="w-6 h-6 rounded-full mr-2 border border-green-400 object-cover"
                        />
                      )}
                      <span>{p.name}</span>
                    </button>
                  ))}
                  <hr className="border-green-400 my-1" />
                  <button
                    className="w-full px-4 py-2 text-left text-green-300 hover:bg-green-900 transition rounded-b"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/profiles");
                    }}
                  >
                    Gestionar perfiles
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Usuario (informativo) */}
          {user && (
            <div className="hidden md:flex flex-col text-xs text-right">
              <span className="text-green-300">Cuenta</span>
              <span className="font-bold">{user.name || user.email}</span>
            </div>
          )}

          {/* Botón logout */}
          {isAuthenticated && (
            <button onClick={handleLogout} className="hidden md:block px-3 py-1 bg-red-600 hover:bg-red-700 text-xs rounded">
              Cerrar sesión
            </button>
          )}

          <ThemeToggle />

          {/* Botón hamburguesa (mobile) */}
          {isAuthenticated && !isOnProfiles && (
            <button
              className="md:hidden flex flex-col gap-[3px] focus:outline-none"
              onClick={() => setMobileMenu((prev) => !prev)}
              aria-label="Abrir menú"
            >
              <span className="w-6 h-[2px] bg-green-400"></span>
              <span className="w-6 h-[2px] bg-green-400"></span>
              <span className="w-6 h-[2px] bg-green-400"></span>
            </button>
          )}
        </div>
      </header>

      {/* Menú Mobile (solo cuando hay perfil y fuera de /profiles) */}
      {mobileMenu && showAppNav && (
        <div className="md:hidden absolute top-[60px] left-0 w-full bg-black bg-opacity-90 flex flex-col gap-3 p-4 z-40 text-sm">
          <Link to="/songs" className="hover:text-green-400" onClick={() => setMobileMenu(false)}>
            Catálogo
          </Link>
          <Link to="/playlist" className="hover:text-green-400" onClick={() => setMobileMenu(false)}>
            Mi Playlist
          </Link>
          <Link to="/spotify" className="hover:text-green-400" onClick={() => setMobileMenu(false)}>
            Spotify
          </Link>
          <Link to="/profile" className="btn btn-profile" onClick={() => setMobileMenu(false)}>
            Ver Perfil
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setMobileMenu(false);
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-xs rounded mt-2"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 pt-20 max-w-6xl mx-auto py-6 px-4 w-full">{children}</main>
    </div>
  );
};

export default Layout;
