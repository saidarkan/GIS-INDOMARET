import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import { supabase } from "../supabaseClient";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Search, MapPin, Navigation, Loader2, Coffee, 
  CreditCard, Sparkles, Store, Clock, Trash2, 
  Edit3, X, ExternalLink, Map as MapIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- CUSTOM MARKER STYLE (MIRIP GAMBAR) ---
const createCustomIcon = (tokoNama) => {
  const namaLower = tokoNama?.toLowerCase() || "";
  let color = "#eb2f06"; // Default Alfamart (Merah)
  
  if (namaLower.includes("fresh")) color = "#f0932b"; // Indomaret Fresh (Orange)
  else if (namaLower.includes("indomaret")) color = "#2563eb"; // Indomaret (Biru)

  return L.divIcon({
    className: "custom-marker-container",
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="
          background-color: ${color}; 
          width: 32px; 
          height: 32px; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          border: 2px solid white; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px; 
            height: 8px; 
            background: white; 
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function ManajemenPeta() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Semua");
  
  const navigate = useNavigate();
  const centerPosition = [0.5333, 101.4475]; // Koordinat Pekanbaru

  useEffect(() => { fetchStores(); }, []);

  const fetchStores = async () => {
    setLoading(true);
    const { data } = await supabase.from("peta").select("*");
    if (data) setStores(data);
    setLoading(false);
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Hapus permanen toko "${nama}" dari database?`)) {
      const { error } = await supabase.from("peta").delete().eq("id", id);
      if (!error) {
        setStores(stores.filter(s => s.id !== id));
        setSelectedStore(null);
      }
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const nama = s.nama_toko.toLowerCase();
      const matchSearch = nama.includes(searchTerm.toLowerCase());
      const matchBrand = selectedBrand === "Semua" || 
                         (selectedBrand === "Indomaret Fresh" ? nama.includes("fresh") :
                          selectedBrand === "Indomaret" ? (nama.includes("indomaret") && !nama.includes("fresh")) :
                          nama.includes("alfamart"));
      return matchSearch && matchBrand;
    });
  }, [stores, searchTerm, selectedBrand]);

  return (
    <div className="relative w-full h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      
      {/* HEADER OVERLAY (STYLE KATALOG) */}
      <header className="absolute top-8 left-8 right-8 z-[1000] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pointer-events-none">
    
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto pointer-events-auto">
          {/* Brand Filter */}
          <div className="flex bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg border border-white gap-1">
            {["Semua", "Indomaret", "Alfamart", "Indomaret Fresh"].map((b) => (
              <button 
                key={b} 
                onClick={() => setSelectedBrand(b)} 
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase transition-all ${selectedBrand === b ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"}`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
            <input 
              type="text" placeholder="Cari lokasi toko..." 
              className="pl-16 pr-8 py-5 bg-white shadow-2xl border-none rounded-full outline-none font-bold text-sm focus:ring-4 focus:ring-red-600/10 transition-all w-full md:w-80"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* LEAFLET MAP */}
      <div className="w-full h-full z-0">
        <MapContainer center={centerPosition} zoom={13} zoomControl={false} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ZoomControl position="bottomright" />
          
          {filteredStores.map((store) => (
            <Marker 
              key={store.id} 
              position={[parseFloat(store.latitude), parseFloat(store.longitude)]}
              icon={createCustomIcon(store.nama_toko)}
              eventHandlers={{ click: () => setSelectedStore(store) }}
            />
          ))}
        </MapContainer>
      </div>

      {/* DRAWER DETAIL (MODIFIKASI STYLE KATALOG) */}
      {selectedStore && (
        <div className="absolute right-8 top-28 bottom-8 w-full max-w-[400px] z-[1001] animate-in slide-in-from-right duration-500">
          <div className="bg-white h-full rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            
            <div className="h-60 relative bg-gray-100 overflow-hidden">
              <img 
                src={selectedStore.gambar_url || 'https://via.placeholder.com/400x300'} 
                className="w-full h-full object-cover" 
                alt="" 
              />
              <button 
                onClick={() => setSelectedStore(null)}
                className="absolute top-6 right-6 p-4 bg-black/30 backdrop-blur-xl rounded-full text-white hover:bg-red-600 transition-all shadow-xl"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-10 flex-1 flex flex-col overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight mb-2">
                  {selectedStore.nama_toko}
                </h2>
                <span className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                  <MapPin size={14} /> {selectedStore.kecamatan}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Fasilitas</span>
                    <div className="flex gap-2">
                      {selectedStore.fasilitas?.toLowerCase().includes("atm") && <CreditCard size={16} className="text-blue-600"/>}
                      {selectedStore.fasilitas?.toLowerCase().includes("cafe") && <Coffee size={16} className="text-orange-500"/>}
                      <Store size={16} className="text-gray-400"/>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                    <span className="block text-[10px] font-black text-green-600 uppercase italic">Aktif</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => navigate(`/EditData/${selectedStore.id}`)}
                    className="flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedStore.id, selectedStore.nama_toko)}
                    className="flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>

                <button 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.latitude},${selectedStore.longitude}`, '_blank')}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                >
                  Buka Rute Navigasi <Navigation size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-[2000] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-red-600" size={64} />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] mt-4">Loading Map...</span>
        </div>
      )}
    </div>
  );
}