import React from "react";

// Ejemplo de perfiles
const mockProfiles = [
  { id: 1, name: "Mili", type: "adulto" },
  { id: 2, name: "Peque", type: "niño" },
];

const ProfileAdmin = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-green-400">Administrar Perfiles de Usuario</h2>
      <table className="w-full bg-black bg-opacity-60 rounded-xl shadow-lg mb-8">
        <thead>
          <tr className="text-green-300">
            <th className="py-2 px-4">Nombre</th>
            <th className="py-2 px-4">Tipo</th>
            <th className="py-2 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {mockProfiles.map(profile => (
            <tr key={profile.id} className="text-white border-b border-gray-700">
              <td className="py-2 px-4">{profile.name}</td>
              <td className="py-2 px-4">{profile.type}</td>
              <td className="py-2 px-4">
                <button className="px-3 py-1 bg-yellow-400 text-black rounded mr-2">Editar</button>
                <button className="px-3 py-1 bg-red-500 text-white rounded">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form className="bg-black bg-opacity-60 rounded-xl shadow-lg p-6 flex flex-col gap-4 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-green-300 mb-2">Agregar nuevo perfil</h3>
        <input type="text" placeholder="Nombre" className="p-2 rounded bg-gray-800 text-white" />
        <select className="p-2 rounded bg-gray-800 text-white">
          <option value="adulto">Adulto</option>
          <option value="niño">Niño</option>
        </select>
        <button className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition">Agregar</button>
      </form>
    </div>
  );
};

export default ProfileAdmin;
