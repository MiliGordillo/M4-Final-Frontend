import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleDarkMode}
      className={
        "p-2 rounded-full transition shadow text-2xl flex items-center justify-center " +
        (darkMode
          ? "bg-[#191414] text-[#1DB954] hover:bg-[#1DB954] hover:text-[#191414]"
          : "bg-[#1DB954] text-[#191414] hover:bg-[#191414] hover:text-[#1DB954]")
      }
      title={darkMode ? "Modo claro" : "Modo oscuro"}
    >
      {darkMode ? (
        // Icono sol (modo claro)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle
            cx="12"
            cy="12"
            r="5"
            stroke="#1DB954"
            strokeWidth="2"
            fill="none"
          />
          <path
            stroke="#1DB954"
            strokeWidth="2"
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </svg>
      ) : (
        // Icono luna (modo oscuro)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke="#191414"
            strokeWidth="2"
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
