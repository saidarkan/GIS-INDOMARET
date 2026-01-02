import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 font-sans flex gap-4">
      {/* Sidebar tetap di kiri */}
      <Sidebar />
      
      {/* Kontainer Utama Dashboard */}
      <main className="flex-1 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}