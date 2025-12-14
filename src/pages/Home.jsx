// src/pages/Home.jsx

import React from 'react';
import { ShoppingCart, Map, User } from 'lucide-react'; 
import backgroundImage from '../assets/bgAlfaIndo.jpg'; 

// FeatureCard
const FeatureCard = ({ icon, bgColor, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-lg transition duration-300">
    <div className={`p-4 ${bgColor} rounded-full mb-4`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default function Home() {
  return (
    <div className="w-full pt-2 space-y-16">

      {/* Hero Section */}
      <div 
        className="relative w-full py-20 md:py-32 bg-gray-600 bg-cover bg-center" 
        style={{ backgroundImage: `url(${backgroundImage})` }} 
      >
        <div className="absolute inset-0 bg-black opacity-30"></div>

        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Temukan Indomaret dan Alfamart di Pekanbaru
          </h1>
          <p className="text-sm md:text-base mb-8">
            Temukan Indomaret dan Alfamart di Pekanbaru
          </p>

          <div className="bg-white text-gray-800 p-6 md:p-8 max-w-full mx-auto rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-6">Mau cari toko apa?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 text-left">

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                <select className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500">
                  <option>Pilih kecamatan</option>
                </select>

                <label className="block text-sm font-medium text-gray-700 pt-2">Fasilitas</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-1 text-sm">
                    <input type="radio" name="fasilitas" value="atm" className="text-red-600 focus:ring-red-500" defaultChecked />
                    <span>ATM</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm">
                    <input type="radio" name="fasilitas" value="caffe" className="text-red-600 focus:ring-red-500" />
                    <span>Caffe</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4 mt-4 md:mt-0"> 
                <label className="block text-sm font-medium text-gray-700">Jenis toko</label>
                <select className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500">
                  <option>Pilih jenis toko</option>
                </select>

                <label className="block text-sm font-medium text-gray-700">Jam operasional</label>
                <select className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500">
                  <option>Pilih jam operasional</option>
                </select>
              </div>

            </div>

            <div className="flex justify-center mt-8">
              <button className="w-full sm:w-auto bg-red-600 text-white px-10 py-2 rounded shadow-md hover:bg-red-700 transition duration-300">
                Cari Toko
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Fitur / Box Section */}
      <div className="max-w-6xl mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<ShoppingCart className="w-10 h-10 text-red-600" />}
            bgColor="bg-red-100"
            title="Temukan toko di sekitar"
            description="Temukan Indomaret dan Alfamart di sekitar tempat tinggalmu di Pekanbaru."
          />
          <FeatureCard 
            icon={<Map className="w-10 h-10 text-indigo-600" />}
            bgColor="bg-indigo-100"
            title="Peta persebaran toko"
            description="Lihat persebaran toko melalui peta secara langsung seluruh toko."
          />
          <FeatureCard 
            icon={<User className="w-10 h-10 text-yellow-600" />}
            bgColor="bg-yellow-100"
            title="Informasi kontak"
            description="Hubungi tim kami jika terjadi kendala atau hal lainnya terkait sistem ini."
          />
        </div>
      </div>

    </div>
  );
}
