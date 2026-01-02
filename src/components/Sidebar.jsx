import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { LayoutDashboard, Map, LogOut, ShieldCheck } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-gray-900 rounded-[3rem] p-6 flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center gap-3 px-4 mb-12">
          <div className="bg-red-600 p-2 rounded-xl text-white">
            <ShieldCheck size={20} />
          </div>
          <span className="font-black text-white uppercase tracking-tighter text-xl italic">Admin.</span>
        </div>

        <nav className="space-y-2">
          <MenuLink to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <MenuLink to="/TabelPeta" icon={<Map size={20}/>} label="Data Toko" />
        </nav>
      </div>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 px-6 py-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}

function MenuLink({ to, icon, label }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${
          isActive ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-gray-400 hover:text-white hover:bg-white/5"
        }`
      }
    >
      {icon} {label}
    </NavLink>
  );
}