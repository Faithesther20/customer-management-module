// src/components/Navbar.jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaBars } from 'react-icons/fa';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex justify-between items-center bg-white px-6 py-4 shadow-md sticky top-0 z-10">
      {/* Hamburger for mobile */}
      <button className="md:hidden text-slate-800" onClick={toggleSidebar}>
        <FaBars size={20} />
      </button>

      {/* User Info */}
      <div className="flex items-center gap-4">
        <div className="text-slate-800 font-medium">
          {user?.name} <span className="text-blue-500">({user?.role})</span>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md transition-colors"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
