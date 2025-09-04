import React, { useEffect, useState, useContext, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
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
  const dropdownRef = useRef(null);
  // Cerrar el dropdown al hacer click fuera
  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);
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

  const { darkMode } = useContext(ThemeContext);
  return (
    <div
      className={
        "min-h-screen flex flex-col transition-colors duration-300 font-sans " +
        (darkMode
          ? "bg-gradient-to-br from-[#181818] via-[#121212] to-[#232323] text-white"
          : "bg-gradient-to-br from-[#f5f5f5] via-white to-[#e9f9ee] text-[#191414]")
      }
    >
      {/* NAVBAR FIJO */}
      <header
        className={
          "fixed top-0 left-0 w-full flex items-center justify-between px-8 py-3 z-50 transition-colors duration-300 backdrop-blur-md bg-opacity-80 border-b " +
          (darkMode
            ? "bg-[#181818]/80 border-[#232323] shadow-2xl"
            : "bg-white/80 border-[#e0e0e0] shadow-xl")
        }
        style={{boxShadow: darkMode ? '0 4px 24px 0 #0006' : '0 4px 24px 0 #1db95422'}}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => {
          if (token) {
            navigate("/songs");
          } else {
            navigate("/login");
          }
        }}>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1DB954] shadow-md">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#191414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 15s1.5-2 4-2 4 2 4 2" /></svg>
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1DB954] drop-shadow-sm">MySpotify</h1>
        </div>

        {/* Menú Desktop (solo con perfil y fuera de /profiles) */}
        {showAppNav && (
          <nav className="hidden md:flex gap-8 text-base font-semibold">
            <Link
              to="/songs"
              className={`px-2 py-1 rounded-lg transition-colors duration-200 ${location.pathname === "/songs" ? "text-[#1DB954] bg-[#1db954]/10" : "hover:text-[#1DB954] hover:bg-[#1db954]/10"}`}
            >
              Catálogo
            </Link>
            <Link
              to="/playlist"
              className={`px-2 py-1 rounded-lg transition-colors duration-200 ${location.pathname === "/playlist" ? "text-[#1DB954] bg-[#1db954]/10" : "hover:text-[#1DB954] hover:bg-[#1db954]/10"}`}
            >
              Mi Playlist
            </Link>
            <Link to="/profile" className="px-2 py-1 rounded-lg transition-colors duration-200 hover:text-[#1DB954] hover:bg-[#1db954]/10">
              Ver Perfil
            </Link>
          </nav>
        )}

        {/* Lado derecho */}
  <div className="flex items-center gap-5">
          {/* Perfil (dropdown) - solo con perfil y fuera de /profiles */}
          {showAppNav && (
            <div className="relative">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowDropdown((v) => !v)}>
                {profile?.avatar && profile.avatar.startsWith("<svg") ? (
                  <span
                    className="w-8 h-8 rounded-full border-2 border-[#1DB954] bg-white flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: profile.avatar }}
                    aria-label={profile?.name}
                  />
                ) : (
                  <img
                    src={profile?.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
                    alt={profile?.name}
                    className="w-8 h-8 rounded-full border-2 border-[#1DB954] object-cover"
                  />
                )}
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {showDropdown && profiles.length > 0 && (
                <>
                  {/* Overlay para cerrar al hacer click fuera */}
                  <div className="fixed inset-0 z-40" style={{background: "transparent"}} />
                  <div
                    ref={dropdownRef}
                    className={
                      "absolute right-0 mt-3 border rounded-xl shadow-2xl z-50 w-64 transition-colors duration-300 p-2 " +
                      (darkMode ? "bg-[#232323] border-[#1DB954]/60" : "bg-white border-gray-200")
                    }
                  >
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#1DB954]/10">
                      {profiles.map((p) => (
                        <button
                          key={p._id}
                          className={`flex items-center w-full gap-2 px-4 py-2 text-left text-sm rounded-lg transition font-medium ${
                            darkMode
                              ? "hover:bg-[#1DB954]/20 text-white"
                              : "hover:bg-[#1DB954]/10 text-[#191414]"
                          } ${profile && p._id === profile._id ? "bg-[#1DB954]/30 font-bold" : ""}`}
                          onClick={() => {
                            setProfile(p);
                            setShowDropdown(false);
                            navigate("/songs");
                          }}
                        >
                          {p.avatar && p.avatar.startsWith("<svg") ? (
                            <span
                              className="w-7 h-7 rounded-full border border-[#1DB954] bg-white flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: p.avatar }}
                              aria-label={p.name}
                            />
                          ) : (
                            <img
                              src={p.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
                              alt={p.name}
                              className="w-7 h-7 rounded-full border border-[#1DB954] object-cover"
                            />
                          )}
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 mt-2 border-t border-[#1DB954]/20">
                      <button
                        className={`w-full px-4 py-2 text-left rounded-lg transition font-semibold ${
                          darkMode
                            ? "text-[#1DB954] hover:bg-[#1DB954]/10"
                            : "text-[#191414] hover:bg-[#1DB954]/10"
                        }`}
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/profiles");
                        }}
                      >
                        Gestionar perfiles
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Usuario (informativo) */}
          {user && (
            <div className="hidden md:flex flex-col text-xs text-right leading-tight">
              <span className="text-gray-400 font-medium">Cuenta</span>
              <span className="font-bold text-sm text-[#1DB954]">{user.name || user.email}</span>
            </div>
          )}

          {/* Botón logout */}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="hidden md:block px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-xs rounded-lg text-white font-semibold shadow transition"
            >
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
              <span className="w-6 h-[2px] bg-[#1DB954]"></span>
              <span className="w-6 h-[2px] bg-[#1DB954]"></span>
              <span className="w-6 h-[2px] bg-[#1DB954]"></span>
            </button>
          )}
        </div>
      </header>

      {/* Menú Mobile (solo cuando hay perfil y fuera de /profiles) */}
      {mobileMenu && showAppNav && (
        <div
          className={
            "md:hidden absolute top-[60px] left-0 w-full flex flex-col gap-3 p-5 z-40 text-base font-semibold rounded-b-2xl shadow-2xl transition-colors duration-300 " +
            (darkMode ? "bg-[#181818]/95 text-white border-t border-[#1DB954]/20" : "bg-white/95 text-[#191414] border-t border-[#1DB954]/10")
          }
        >
          <Link to="/songs" className="px-3 py-2 rounded-lg hover:bg-[#1DB954]/10 transition" onClick={() => setMobileMenu(false)}>
            Catálogo
          </Link>
          <Link to="/playlist" className="px-3 py-2 rounded-lg hover:bg-[#1DB954]/10 transition" onClick={() => setMobileMenu(false)}>
            Mi Playlist
          </Link>
          <Link to="/spotify" className="px-3 py-2 rounded-lg hover:bg-[#1DB954]/10 transition" onClick={() => setMobileMenu(false)}>
            Spotify
          </Link>
          <Link to="/profile" className="px-3 py-2 rounded-lg hover:bg-[#1DB954]/10 transition" onClick={() => setMobileMenu(false)}>
            Ver Perfil
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setMobileMenu(false);
            }}
            className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-xs rounded-lg mt-2 text-white font-semibold shadow"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 pt-24 max-w-6xl mx-auto py-10 px-6 w-full transition-all duration-300 mt-4">
        <div className={
          (darkMode
            ? "text-white"
            : "text-[#191414]")
        }>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
