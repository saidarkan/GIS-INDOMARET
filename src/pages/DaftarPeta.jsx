import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { 
  Search, MapPin, Navigation, Loader2, ImageIcon, 
  ChevronLeft, ChevronRight, Coffee, CreditCard, 
  Sparkles, Store, LayoutGrid, Clock, Map as MapIcon
} from "lucide-react";

export default function DaftarPeta() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE FILTER ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Semua");
  const [selectedFasilitas, setSelectedFasilitas] = useState("Semua");
  const [selectedWilayah, setSelectedWilayah] = useState("Semua");
  const [selectedJam, setSelectedJam] = useState("Semua");

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    const { data } = await supabase.from("peta").select("*").order("nama_toko", { ascending: true });
    if (data) setStores(data);
    setLoading(false);
  };

  // 1. Ambil List Wilayah Unik
  const listWilayah = useMemo(() => {
    const unik = [...new Set(stores.map(s => s.kecamatan))];
    return ["Semua", ...unik.sort()];
  }, [stores]);

  // 2. Logika Filtering Super Lengkap
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const nama = s.nama_toko.toLowerCase();
      const fas = s.fasilitas?.toLowerCase() || "";
      const jam = s.jam_operasional?.toLowerCase() || "";
      
      const matchSearch = nama.includes(searchTerm.toLowerCase());
      
      const matchBrand = selectedBrand === "Semua" || 
                         (selectedBrand === "Indomaret Fresh" ? nama.includes("fresh") :
                          selectedBrand === "Indomaret" ? (nama.includes("indomaret") && !nama.includes("fresh")) :
                          nama.includes("alfamart"));
      
      const matchFasilitas = selectedFasilitas === "Semua" || fas.includes(selectedFasilitas.toLowerCase());
      
      const matchWilayah = selectedWilayah === "Semua" || s.kecamatan === selectedWilayah;
      
      const matchJam = selectedJam === "Semua" || 
                       (selectedJam === "24 Jam" ? jam.includes("24") : !jam.includes("24"));
      
      return matchSearch && matchBrand && matchFasilitas && matchWilayah && matchJam;
    });
  }, [stores, searchTerm, selectedBrand, selectedFasilitas, selectedWilayah, selectedJam]);

  // 3. Logika Pagination
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const currentItems = filteredStores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedBrand, selectedFasilitas, selectedWilayah, selectedJam]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pt-25 px-10 pb-20 bg-[#F8F9FA]">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Catalog.</h1>
          <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] ml-1">Geospatial Store Management</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
          <input 
            type="text" placeholder="Cari nama toko..." 
            className="w-full pl-16 pr-6 py-5 bg-white shadow-sm border-none rounded-[2.5rem] outline-none font-bold text-sm focus:ring-4 focus:ring-red-600/5 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* MULTI-FILTER PANEL */}
      <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          
          {/* Baris 1: Brand & Dropdowns */}
          <div className="flex flex-wrap gap-8">
             <div className="flex flex-col gap-3">
               <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Jenis Toko</span>
               <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
                 {["Semua", "Indomaret", "Alfamart"].map((b) => (
                   <button key={b} onClick={() => setSelectedBrand(b)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${selectedBrand === b ? "bg-white text-red-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>{b}</button>
                 ))}
               </div>
             </div>

             <div className="flex flex-col gap-3">
               <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Wilayah</span>
               <select value={selectedWilayah} onChange={(e) => setSelectedWilayah(e.target.value)} className="bg-gray-50 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-red-600/20">
                 {listWilayah.map(w => <option key={w} value={w}>{w}</option>)}
               </select>
             </div>

             <div className="flex flex-col gap-3">
               <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Jam Operasional</span>
               <select value={selectedJam} onChange={(e) => setSelectedJam(e.target.value)} className="bg-gray-50 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-red-600/20">
                 <option value="Semua">Semua Jam</option>
                 <option value="24 Jam">Buka 24 Jam</option>
                 <option value="Reguler">Jam Reguler</option>
               </select>
             </div>
          </div>

          {/* Baris 2: Fasilitas Icons */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Filter Fasilitas</span>
            <div className="flex flex-wrap gap-3">
              <IconButton active={selectedFasilitas === "Semua"} onClick={() => setSelectedFasilitas("Semua")} icon={<LayoutGrid size={18}/>} label="Standar" color="bg-gray-900" />
              <IconButton active={selectedFasilitas === "ATM"} onClick={() => setSelectedFasilitas("ATM")} icon={<CreditCard size={18}/>} label="ATM" color="bg-blue-600" />
              <IconButton active={selectedFasilitas === "Cafe"} onClick={() => setSelectedFasilitas("Cafe")} icon={<Coffee size={18}/>} label="Cafe" color="bg-orange-500" />
              <IconButton active={selectedBrand === "Indomaret Fresh"} onClick={() => setSelectedBrand(selectedBrand === "Indomaret Fresh" ? "Semua" : "Indomaret Fresh")} icon={<Sparkles size={18}/>} label="Fresh Store" color="bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* GRID DAFTAR TOKO */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-red-600" size={48} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {currentItems.map((item) => {
              const isFresh = item.nama_toko.toLowerCase().includes("fresh");
              const isIndo = item.nama_toko.toLowerCase().includes("indomaret");
              const is24H = item.jam_operasional?.includes("24");
              
              return (
                <div key={item.id} className="group bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col">
                  <div className="h-64 relative overflow-hidden bg-gray-100">
                    <img src={item.gambar_url || 'https://via.placeholder.com/400x300'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                       <span className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 ${
                         isFresh ? 'bg-orange-500 text-white' : isIndo ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                       }`}>
                         {isFresh ? <Sparkles size={12}/> : <Store size={12}/>} {isFresh ? 'Indomaret Fresh' : isIndo ? 'Indomaret' : 'Alfamart'}
                       </span>
                       {is24H && <span className="w-fit px-4 py-2 bg-black/50 backdrop-blur-md text-white rounded-full text-[9px] font-black uppercase tracking-widest">Non-Stop 24H</span>}
                    </div>
                  </div>

                  <div className="p-10 flex-1 flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight mb-2">{item.nama_toko}</h3>
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                          <MapPin size={14} className="text-red-600" /> {item.kecamatan}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] mb-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Fasilitas</span>
                            <div className="flex gap-2 text-gray-600">
                                {item.fasilitas?.toLowerCase().includes("atm") && <CreditCard size={16}/>}
                                {item.fasilitas?.toLowerCase().includes("cafe") && <Coffee size={16}/>}
                                <Store size={16}/>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-gray-200"></div>
                        <div className="flex flex-col gap-1 text-right">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Operasional</span>
                            <span className="text-[10px] font-black text-gray-800 uppercase italic">{item.jam_operasional || '07:00 - 22:00'}</span>
                        </div>
                    </div>

                    <button 
                      onClick={() => window.open(`http://google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`, '_blank')}
                      className="w-full py-5 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                    >
                      Mulai Navigasi <Navigation size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-5 bg-white rounded-3xl shadow-sm hover:bg-gray-900 hover:text-white disabled:opacity-20 transition-all"><ChevronLeft size={24} /></button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => paginate(i + 1)} className={`w-14 h-14 rounded-3xl font-black text-xs transition-all ${currentPage === i + 1 ? "bg-red-600 text-white shadow-lg" : "bg-white text-gray-400 hover:bg-gray-50"}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-5 bg-white rounded-3xl shadow-sm hover:bg-gray-900 hover:text-white disabled:opacity-20 transition-all"><ChevronRight size={24} /></button>
            </div>
          )}
        </>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredStores.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
          <MapIcon size={64} className="mx-auto text-gray-100 mb-6" />
          <h3 className="text-2xl font-black uppercase italic text-gray-300 tracking-tighter">No Locations Found</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Coba sesuaikan filter wilayah atau fasilitas Anda</p>
        </div>
      )}
    </div>
  );
}

function IconButton({ active, onClick, icon, label, color }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] transition-all duration-300 ${active ? `${color} text-white shadow-xl scale-105` : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
      {icon} <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}