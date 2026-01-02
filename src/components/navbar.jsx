import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Map as MapIcon } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef(null);

  // Fungsi untuk menghitung posisi slider
  useEffect(() => {
    const activeLink = navRef.current?.querySelector(".active-link");
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      setSliderStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [location.pathname]); // Berjalan setiap kali URL berubah

  return (
    <header className="fixed top-5 w-full z-[5000] px-4 pointer-events-none">
      <div className="max-w-5xl mx-auto flex justify-center">
        
        <nav className="pointer-events-auto bg-white/70 backdrop-blur-md text-gray-800 px-3 py-2 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex items-center justify-between w-full border border-white/60">
          
          {/* Sisi Kiri: Branding (Logo) */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center px-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 blur-xl opacity-10 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white/90 backdrop-blur-sm p-2 rounded-[20px] shadow-sm border border-white/60 group-hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center bg-gray-50 px-2 py-1 rounded-lg">
                      <img src="/img/indomaret.png" alt="Indomaret" className="h-6 w-auto object-contain" />
                    </div>
                    <div className="w-[1.5px] h-5 bg-gray-200/80 rotate-12"></div>
                    <div className="flex items-center justify-center bg-gray-50 px-2 py-1 rounded-lg">
                      <img src="/img/alfamart.png" alt="Alfamart" className="h-6 w-auto object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </NavLink>
          </div>

          {/* Menu Tengah: Sliding Navigasi Utama */}
          <div className="hidden lg:flex items-center bg-gray-100/50 p-1 rounded-full border border-gray-200/50 relative" ref={navRef}>
            
            {/* Element Slider (Putih yang bergeser) */}
            <div 
              className="absolute bg-white shadow-sm rounded-full transition-all duration-300 ease-in-out h-[calc(100%-8px)]"
              style={{ 
                left: `${sliderStyle.left}px`, 
                width: `${sliderStyle.width}px`,
                top: '4px' 
              }}
            />

            <ul className="flex items-center text-[12px] font-bold uppercase tracking-wider relative z-10">
              <li>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `px-5 py-2 rounded-full transition-colors flex items-center gap-2 ${isActive ? "text-red-600 active-link" : "text-gray-500 hover:text-gray-900"}`
                  }
                >
                  <Home size={14} strokeWidth={2.5} /> Beranda
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/peta" 
                  className={({ isActive }) => 
                    `px-5 py-2 rounded-full transition-colors flex items-center gap-2 ${isActive ? "text-red-600 active-link" : "text-gray-500 hover:text-gray-900"}`
                  }
                >
                  <MapIcon size={14} strokeWidth={2.5} /> Eksplor Peta
                </NavLink>
              </li>
                <li>
                <NavLink 
                  to="/kontak" 
                  className={({ isActive }) => 
                    `px-5 py-2 rounded-full transition-colors flex items-center gap-2 ${isActive ? "text-red-600 active-link" : "text-gray-500 hover:text-gray-900"}`
                  }
                >
                  <MapIcon size={14} strokeWidth={2.5} /> Kontak Kami
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Sisi Kanan: Auth & CTA */}
          <div className="flex items-center gap-2">
            <NavLink 
              to="/login" 
              className="group relative bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-[16px] text-[11px] font-black tracking-widest uppercase transition-all shadow-md active:scale-95 flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-none"></div>
              <span>Login</span>
            </NavLink>
          </div>

        </nav>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(300%); }
        }
      `}</style>
    </header>
  );
}