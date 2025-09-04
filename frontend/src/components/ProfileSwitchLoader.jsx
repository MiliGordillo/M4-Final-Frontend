import React from "react";

const ProfileSwitchLoader = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-500">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-16 h-16 text-[#1DB954]" viewBox="0 0 50 50">
          <circle
            className="opacity-25"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#1DB954"
            strokeWidth="6"
          />
          <path
            className="opacity-75"
            fill="#1DB954"
            d="M25 5a20 20 0 0 1 20 20h-6a14 14 0 0 0-14-14V5z"
          />
        </svg>
        <span className="text-xl font-bold text-[#1DB954] drop-shadow-lg">{message || "Cambiando de perfil..."}</span>
      </div>
    </div>
  );
};

export default ProfileSwitchLoader;
