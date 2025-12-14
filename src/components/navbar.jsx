import { useState, useRef } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);

  const showDropdown = () => {
    clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const hideDropdown = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  return (
    <header className="bg-red-600 text-white fixed top-0 w-full z-50 shadow-md">
      {/* Main Navbar */}
      <div className="flex justify-between items-center px-4 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/img/indomaret.png" alt="Logo" className="w-15 h-7" />
        
        </div>

        {/* Menu Desktop */}
        <ul className="hidden md:flex gap-6 items-center text-sm font-medium">
          <li>
            <NavLink
              to="/login"
              className="ml-2 bg-white hover:bg-gray-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold transition"
            >
              Login
            </NavLink>
          </li>
        </ul>

     
      </div>
    </header>
  );
}
