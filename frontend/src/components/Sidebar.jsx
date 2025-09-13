// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers } from 'react-icons/fa';

export default function Sidebar({ isOpen }) {
  const menu = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Customers', path: '/customers', icon: <FaUsers /> },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white p-3 pt-6 transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      <h1 className="text-2xl font-bold text-center  text-blue-500">
        Customer Manager
      </h1>
      <h1 className="text-xs text-center mb-5 text-white">
       Designed by Esther J. Iyege
      </h1>
      <nav className="space-y-3">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-blue-600 transition-colors
              ${isActive ? 'bg-blue-600 font-semibold' : ''}`
            }
          >
            {item.icon} <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
