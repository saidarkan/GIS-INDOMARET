import { FaFacebookF, FaInstagram, FaYoutube, FaPinterestP } from "react-icons/fa";

export default function Footer() {
  return (
    /* Container luar tetap memberikan sedikit ruang untuk "bingkai" di pinggir layar */
    <div className="w-full bg-[#f8fafc] px-4 pb-4  font-sans">
      
      {/* MODIFIKASI: 
         - max-w-[98%] agar hampir menyentuh pinggir layar tapi tetap ada celah bingkai.
         - px-12 sampai px-20 untuk memberikan kesan luas di dalam.
      */}
      <footer className="max-w-[999%] mx-auto bg-red-600 text-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
        
        <div className="pt-20 pb-12 px-8 md:px-16 lg:px-24">
          <div className="grid md:grid-cols-4 gap-16">
            
            {/* Logo & Deskripsi - Dibuat lebih lebar kolomnya */}
            <div className="md:col-span-1 space-y-8">
              <div className="flex items-center gap-2 bg-white w-fit px-6 py-3 rounded-2xl shadow-sm">
                 <span className="text-red-600 font-black italic tracking-tighter text-2xl">MAPS</span>
              </div>
              <p className="text-red-50 text-base leading-relaxed max-w-sm">
                Solusi digital terlengkap untuk menemukan titik lokasi gerai minimarket Indomaret dan Alfamart di seluruh wilayah Pekanbaru.
              </p>
              <div className="flex gap-5 text-xl">
                {/* Icon Button lebih besar */}
                {[FaFacebookF, FaInstagram, FaPinterestP, FaYoutube].map((Icon, index) => (
                  <div key={index} className="p-3 bg-red-500 rounded-xl hover:bg-white hover:text-red-600 transition-all cursor-pointer shadow-md">
                    <Icon size={20} />
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Links - Jarak antar kolom lebih lebar */}
            <div className="flex flex-col gap-6">
              <h4 className="font-black text-xs uppercase tracking-[0.3em] opacity-60">Eksplorasi</h4>
              <ul className="space-y-4 text-base font-semibold">
                <li className="hover:translate-x-2 transition-transform cursor-pointer w-fit">Beranda Utama</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer w-fit">Peta Interaktif</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer w-fit">Daftar Wilayah</li>
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="font-black text-xs uppercase tracking-[0.3em] opacity-60">Bantuan</h4>
              <ul className="space-y-4 text-base font-semibold">
                <li className="hover:translate-x-2 transition-transform cursor-pointer w-fit">Panduan Pengguna</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer w-fit">Laporkan Lokasi</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer w-fit">Hubungi Admin</li>
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="font-black text-xs uppercase tracking-[0.3em] opacity-60">Legalitas</h4>
              <ul className="space-y-4 text-base font-semibold">
                <li className="hover:translate-x-2 transition-transform cursor-pointer w-fit">Kebijakan Privasi</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer w-fit">Ketentuan Layanan</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer w-fit">Informasi Korporat</li>
              </ul>
            </div>
          </div>

          {/* Garis Bawah & Copyright - Dibuat lebih lega */}
          <div className="mt-24 pt-10 border-t border-red-500/50 flex flex-col lg:flex-row justify-between items-center gap-8 text-sm font-bold opacity-70">
            <div className="flex flex-wrap justify-center gap-10 uppercase tracking-[0.15em]">
              <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
              <span className="hover:text-white cursor-pointer transition-colors">Security</span>
              <span className="hover:text-white cursor-pointer transition-colors">System Status</span>
            </div>
            
            <div className="tracking-[0.2em] uppercase text-center lg:text-right">
              &copy; {new Date().getFullYear()} Digital Maps Pekanbaru. Built with Precision.
            </div>
          </div>
        </div>

        {/* Aksesori Visual Bawah */}
        <div className="bg-black/10 py-5 px-10 flex justify-center items-center">
           <div className="h-1 w-20 bg-white/20 rounded-full"></div>
        </div>
      </footer>
    </div>
  );
}