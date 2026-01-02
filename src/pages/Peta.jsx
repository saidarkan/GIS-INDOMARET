import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // TAMBAHKAN INI
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import { supabase } from "../supabaseClient"; 
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Search, Loader2, Coffee, CreditCard, Store, 
  MapPin, Clock, Moon, Sun, LayoutGrid, 
  Filter, ChevronRight, RotateCcw, ExternalLink 
} from "lucide-react";

// --- CUSTOM MARKER GENERATOR ---
const createCustomIcon = (tokoNama) => {
  const isAlfamart = tokoNama.toLowerCase().includes('alfamart');
  const color = isAlfamart ? '#ef4444' : '#2563eb';
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
        <div style="transform: rotate(45deg); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

export default function Peta() {
  const location = useLocation(); // Inisialisasi useLocation
  const centerPekanbaru = [0.5333, 101.4475];
  
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedToko, setSelectedToko] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterFasilitas, setFilterFasilitas] = useState("");
  const [filterJam, setFilterJam] = useState("");

  // 1. EFFECT UNTUK MENERIMA FILTER DARI HOME
  useEffect(() => {
    if (location.state && location.state.filters) {
      const f = location.state.filters;
      if (f.kecamatan) setFilterKecamatan(f.kecamatan);
      if (f.jenis) setFilterJenis(f.jenis);
      if (f.fasilitas) setFilterFasilitas(f.fasilitas);
      if (f.jam) setFilterJam(f.jam === "24" ? "24" : "");
      
      // Opsional: Jika ada pencarian teks
      if (f.searchQuery) setSearchQuery(f.searchQuery);
    }
  }, [location.state]);

  // 2. EFFECT UNTUK FETCH DATA SUPABASE
  useEffect(() => {
    const fetchPeta = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("peta").select("*");
      if (error) console.error("Error fetching data:", error);
      else setStores(data || []);
      setLoading(false);
    };
    fetchPeta();
  }, []);

  const handleResetFilter = () => {
    setSearchQuery("");
    setFilterKecamatan("");
    setFilterJenis("");
    setFilterFasilitas("");
    setFilterJam("");
    // Bersihkan state location agar saat refresh tidak kembali ke filter lama
    window.history.replaceState({}, document.title);
  };

  const filteredData = stores.filter((t) => {
    const lat = typeof t.latitude === "string" ? parseFloat(t.latitude.replace(',', '.')) : t.latitude;
    const lng = typeof t.longitude === "string" ? parseFloat(t.longitude.replace(',', '.')) : t.longitude;
    const isValidCoords = !isNaN(lat) && !isNaN(lng);
    
    const nama = (t.nama_toko || "").toLowerCase();
    const fas = (t.fasilitas || "").toLowerCase();
    const jam = (t.jam_operasional || "").toLowerCase();

    const matchSearch = nama.includes(searchQuery.toLowerCase());
    const matchKecamatan = filterKecamatan === "" || t.kecamatan === filterKecamatan;
    const matchJenis = filterJenis === "" || nama.includes(filterJenis.toLowerCase());
    const matchJam = filterJam === "" || jam.includes("24");

    let matchFasilitas = true;
    if (filterFasilitas === "Keduanya") {
      matchFasilitas = fas.includes("atm") && fas.includes("cafe");
    } else if (filterFasilitas === "ATM") {
      matchFasilitas = fas.includes("atm");
    } else if (filterFasilitas === "Cafe") {
      matchFasilitas = fas.includes("cafe");
    }

    return isValidCoords && matchSearch && matchKecamatan && matchJenis && matchFasilitas && matchJam;
  });

  return (
    <div className="relative w-full h-screen bg-[#ffffff] p-4 overflow-hidden font-sans">
      
      <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white bg-white">
        
        <MapContainer center={centerPekanbaru} zoom={13} zoomControl={false} className="w-full h-full z-0">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ZoomControl position="bottomleft" />
          
          {loading && (
            <div className="absolute inset-0 z-[1001] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
               <Loader2 className="animate-spin text-red-600 mb-2" size={40} />
               <p className="font-bold text-gray-700 uppercase tracking-widest text-xs">Singkronisasi...</p>
            </div>
          )}
          
          {filteredData.map((toko) => (
            <Marker 
              key={toko.id} 
              icon={createCustomIcon(toko.nama_toko)} 
              position={[
                typeof toko.latitude === "string" ? parseFloat(toko.latitude.replace(',', '.')) : toko.latitude,
                typeof toko.longitude === "string" ? parseFloat(toko.longitude.replace(',', '.')) : toko.longitude
              ]} 
              eventHandlers={{ click: () => setSelectedToko(toko) }} 
            />
          ))}
        </MapContainer>

        {/* SIDEBAR FILTER */}
        <div className="absolute top-28 right-6 bottom-6 w-80 z-[1005] pointer-events-none">
          <div className="w-full h-full bg-white/90 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex flex-col border border-white/50 pointer-events-auto overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 bg-white/50 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Filter size={18} className="text-red-600" />
                  <h2 className="font-black text-gray-800 uppercase tracking-tight text-sm">Eksplorasi</h2>
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  {filteredData.length} Toko Ditemukan
                </p>
              </div>
              <button 
                onClick={handleResetFilter}
                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors"
                title="Reset Filter"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar">
              {/* Search */}
              <div>
                <label className="block text-[10px] font-black mb-2 text-gray-400 uppercase tracking-widest px-1">Cari Nama</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Contoh: Indomaret..." 
                    className="w-full bg-white border-2 border-gray-50 rounded-2xl p-3 pr-10 text-sm outline-none focus:border-red-500 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute right-3 top-3 text-gray-300 group-focus-within:text-red-500 transition-colors" size={18} />
                </div>
              </div>

              {/* Kecamatan */}
              <div>
                <label className="block text-[10px] font-black mb-2 text-gray-400 uppercase tracking-widest px-1">Wilayah</label>
                <select 
                  className="w-full bg-white border-2 border-gray-50 rounded-2xl p-3 text-sm outline-none focus:border-red-500 transition-all cursor-pointer shadow-sm appearance-none"
                  value={filterKecamatan} 
                  onChange={(e) => setFilterKecamatan(e.target.value)}
                >
                  <option value="">Semua Wilayah</option>
                  {[...new Set(stores.map(item => item.kecamatan))].filter(Boolean).sort().map(kec => (
                    <option key={kec} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              {/* Merek */}
              <div>
                <label className="block text-[10px] font-black mb-2 text-gray-400 uppercase tracking-widest px-1">Merek</label>
                <div className="grid grid-cols-2 gap-2">
                  {['', 'Alfamart', 'Indomaret'].map((m) => (
                    <button 
                      key={m}
                      onClick={() => setFilterJenis(m)}
                      className={`py-3 rounded-2xl text-[10px] font-black border-2 transition-all ${filterJenis === m ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-100" : "bg-white border-gray-50 text-gray-400 hover:border-gray-200"}`}
                    >
                      {m === '' ? 'SEMUA' : m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fasilitas */}
              <div>
                <label className="block text-[10px] font-black mb-3 text-gray-400 uppercase tracking-widest px-1">Fasilitas</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: '', icon: <LayoutGrid size={20} />, label: 'Semua', color: 'bg-gray-800' },
                    { v: 'ATM', icon: <CreditCard size={20} />, label: 'ATM', color: 'bg-blue-600' },
                    { v: 'Cafe', icon: <Coffee size={20} />, label: 'Cafe', color: 'bg-orange-500' },
                    { v: 'Keduanya', icon: <div className="flex gap-0.5"><CreditCard size={14}/><Coffee size={14}/></div>, label: 'Lengkap', color: 'bg-purple-600' }
                  ].map((f) => (
                    <button 
                      key={f.v} 
                      onClick={() => setFilterFasilitas(f.v)} 
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${filterFasilitas === f.v ? `${f.color} border-transparent text-white shadow-lg scale-105` : "bg-white border-gray-50 text-gray-400 hover:bg-gray-100"}`}
                    >
                      {f.icon}
                      <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Jam Operasional */}
              <div>
                <button 
                  onClick={() => setFilterJam(filterJam === "24" ? "" : "24")}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${filterJam === "24" ? "bg-indigo-600 border-indigo-600 text-white shadow-xl" : "bg-white border-gray-50 text-gray-400"}`}
                >
                  <div className="flex items-center gap-3">
                    {filterJam === "24" ? <Moon size={18} /> : <Sun size={18} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Buka 24 Jam</span>
                  </div>
                  <ChevronRight size={14} className={filterJam === "24" ? "rotate-90 transition-all" : ""} />
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50/30 border-t border-gray-100 text-center">
              <p className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.2em]">Pekanbaru Store Maps v2</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL POPUP DETAIL (Tetap Sama) */}
      {selectedToko && (
        <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedToko(null)}>
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-48">
              <img src={selectedToko.gambar_url || "https://via.placeholder.com/400x200?text=No+Photo"} className="w-full h-full object-cover" alt="store" />
              <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase shadow-lg ${selectedToko.nama_toko.toLowerCase().includes('alfamart') ? 'bg-red-600' : 'bg-blue-600'}`}>
                {selectedToko.nama_toko.toLowerCase().includes('alfamart') ? 'Alfamart' : 'Indomaret'}
              </div>
            </div>
            
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-800 mb-6 leading-tight">{selectedToko.nama_toko}</h2>
              
              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-4 text-gray-600">
                  <div className="bg-red-50 p-2.5 rounded-xl text-red-500"><MapPin size={20} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat</p>
                    <p className="text-sm font-semibold">{selectedToko.kecamatan}, {selectedToko.kota}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 text-gray-600">
                  <div className="bg-green-50 p-2.5 rounded-xl text-green-500"><Clock size={20} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu</p>
                    <p className="text-sm font-black text-green-700">{selectedToko.jam_operasional || "Cek Lokasi"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100 mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest text-center">Fasilitas Toko</p>
                <div className="flex justify-center gap-6">
                  <div className={`flex flex-col items-center gap-2 ${selectedToko.fasilitas?.toLowerCase().includes('atm') ? "text-blue-600 scale-110" : "text-gray-300 opacity-50"}`}>
                    <div className="p-3 rounded-2xl bg-white border border-gray-100"><CreditCard size={24} /></div>
                    <span className="text-[9px] font-black uppercase">ATM</span>
                  </div>
                  <div className={`flex flex-col items-center gap-2 ${selectedToko.fasilitas?.toLowerCase().includes('cafe') ? "text-orange-500 scale-110" : "text-gray-300 opacity-50"}`}>
                    <div className="p-3 rounded-2xl bg-white border border-gray-100"><Coffee size={24} /></div>
                    <span className="text-[9px] font-black uppercase">Cafe</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedToko.latitude},${selectedToko.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-widest"
                >
                  <ExternalLink size={16} /> Petunjuk Jalan
                </a>
                <button 
                  onClick={() => setSelectedToko(null)} 
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all uppercase tracking-widest"
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}