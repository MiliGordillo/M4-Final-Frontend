// SongSearchBar.jsx
import React, { useState } from "react";

const randomTerms = [
  "a",
  "e",
  "i",
  "o",
  "u",
  "love",
  "the",
  "la",
  "el",
  "mi",
  "yo",
  "you",
  "summer",
  "night",
  "sun",
];
function getRandomTerm() {
  return randomTerms[Math.floor(Math.random() * randomTerms.length)];
}

export default function SongSearchBar({ onResults, onTypeChange }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("track");

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query) return;
    const res = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/spotify/search?q=${encodeURIComponent(query)}&type=${type}`
    );
    const data = await res.json();
    onResults(data);
    onTypeChange(type);
  };

  // Tabs para tipos de búsqueda
  const tabs = [
    { value: "track", label: "Canciones" },
    { value: "artist", label: "Artistas" },
    { value: "album", label: "Álbumes" },
  ];

  // Al hacer click en un tab, buscar aleatorio de ese tipo
  const handleTabClick = async (tabType) => {
    setType(tabType);
    setQuery("");
    onTypeChange(tabType);
    const term = getRandomTerm();
    const res = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/spotify/search?q=${encodeURIComponent(term)}&type=${tabType}`
    );
    const data = await res.json();
    onResults(data);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col md:flex-row items-center gap-3 mb-8 justify-center"
    >
      {/* Barra de búsqueda */}
      <div className="relative w-full max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300">
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          placeholder="Buscar en el catálogo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {/* Tabs de tipo de búsqueda */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`px-4 py-2 rounded-full font-semibold transition text-sm ${
              type === tab.value
                ? "bg-green-500 text-white shadow"
                : "bg-transparent text-green-700 dark:text-green-300"
            }`}
            onClick={() => handleTabClick(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Botón buscar */}
      <button
        type="submit"
        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-500 text-white font-bold rounded-full shadow transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 21l-4.35-4.35" />
          <circle cx="11" cy="11" r="8" />
        </svg>
        Buscar
      </button>
    </form>
  );
}

