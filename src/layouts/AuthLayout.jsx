import React from "react";
import { Outlet } from "react-router-dom";

/**
 * AuthLayout berfungsi untuk memberikan bingkai (frame) luar
 * yang serasi dengan MainLayout, namun lebih fokus pada konten tengah.
 */
export default function AuthLayout() {
  return (
    // Bingkai Luar: Memberikan padding dan warna background abu-abu muda lembut
    <div className="min-h-screen bg-[#f1f5f9] p-4 font-sans flex items-center justify-center">
      
   
        
        {/* Konten halaman (Login.jsx akan dirender di sini) */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>

      </div>
    
  );
}