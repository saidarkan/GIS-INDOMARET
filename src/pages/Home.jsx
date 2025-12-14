import React from "react";
import { NavLink } from "react-router-dom";
import { ShoppingCart, Map, User } from "lucide-react";
import backgroundImage from "../assets/bgAlfaIndo.jpg";

/* ======================
   FEATURE CARD
====================== */
const FeatureCard = ({ to, icon, bgColor, title, description }) => (
  <NavLink
    to={to}
    className="
      flex items-center gap-4
      p-5
      rounded-xl
      text-white
      shadow-md
      transition-all duration-300
      hover:-translate-y-1 hover:shadow-lg
    "
    style={{ backgroundColor: bgColor }}
  >
    {/* Icon */}
    <div className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-lg">
      {icon}
    </div>

    {/* Text */}
    <div>
      <h3 className="text-base font-semibold leading-tight">
        {title}
      </h3>
      <p className="text-sm opacity-90">
        {description}
      </p>
    </div>
  </NavLink>
);

/* ======================
   HOME PAGE
====================== */
export default function Home() {
  return (
    <div className="w-full flex flex-col items-center">

      {/* ======================
          HERO SECTION
      ====================== */}
      <section
        className="relative w-full min-h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 w-full max-w-6xl px-6 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Temukan Indomaret dan Alfamart di Pekanbaru
          </h1>

          <p className="text-sm md:text-base mb-10">
            Cari toko berdasarkan lokasi, fasilitas, dan jam operasional
          </p>

          {/* SEARCH BOX */}
          <div className="bg-white text-gray-800 p-6 md:p-8 rounded-xl shadow-xl max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">
              Mau cari toko apa?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* LEFT */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kecamatan
                  </label>
                  <select className="w-full p-2 border rounded focus:ring-red-500 focus:border-red-500">
                    <option>Pilih kecamatan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fasilitas
                  </label>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1">
                      <input type="radio" name="fasilitas" defaultChecked />
                      ATM
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" name="fasilitas" />
                      Cafe
                    </label>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Jenis toko
                  </label>
                  <select className="w-full p-2 border rounded focus:ring-red-500 focus:border-red-500">
                    <option>Pilih jenis toko</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Jam operasional
                  </label>
                  <select className="w-full p-2 border rounded focus:ring-red-500 focus:border-red-500">
                    <option>Pilih jam operasional</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button className="bg-red-600 text-white px-10 py-2 rounded hover:bg-red-700 transition">
                Cari Toko
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================
          FEATURE SECTION
      ====================== */}
      <section className="w-full max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <FeatureCard
            to="/cari-toko"
            icon={<ShoppingCart className="w-8 h-8 text-white" />}
            bgColor="#EF4444"
            title="Temukan toko di sekitar"
            description="Temukan Indomaret dan Alfamart di sekitar tempat tinggalmu"
          />

          <FeatureCard
            to="/peta"
            icon={<Map className="w-8 h-8 text-white" />}
            bgColor="#4F46E5"
            title="Peta persebaran toko"
            description="Lihat persebaran toko melalui peta secara langsung"
          />

          <FeatureCard
            to="/kontak"
            icon={<User className="w-8 h-8 text-white" />}
            bgColor="#F59E0B"
            title="Informasi kontak"
            description="Hubungi kami jika terjadi kendala atau hal lainnya"
          />

        </div>
      </section>
    </div>
  );
}
