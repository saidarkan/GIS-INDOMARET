import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, ZoomControl, Circle, GeoJSON, useMap } from "react-leaflet";
import { supabase } from "../supabaseClient"; 
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Loader2, Coffee, CreditCard, Store, 
  MapPin, Clock, Moon, Sun, 
  Filter as FilterIcon, ChevronRight, RotateCcw, 
  Navigation, CheckCircle2, Map as MapIcon, Utensils, 
  ArrowRight, ExternalLink
} from "lucide-react";

// --- HELPER: HITUNG JARAK (HAVERSINE) ---
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- KOMPONEN AUTO ZOOM ---
function MapController({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], duration: 1.5 });
    }
  }, [bounds, map]);
  return null;
}

// --- CUSTOM MARKER GENERATOR ---
const createCustomIcon = (tokoNama) => {
  const namaLower = tokoNama.toLowerCase();
  const isAlfamart = namaLower.includes('alfamart');
  const isFresh = namaLower.includes('fresh');
  const color = isAlfamart ? '#ef4444' : isFresh ? '#f97316' : '#2563eb';

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
        <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
      </div>`,
    iconSize: [32, 32], iconAnchor: [16, 32],
  });
};

export default function PetaLengkap() {
  const centerPekanbaru = [0.5333, 101.4475];
  const [stores, setStores] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedToko, setSelectedToko] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  
  // States Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterJenis, setFilterJenis] = useState([]); 
  const [filterFasilitas, setFilterFasilitas] = useState([]); 
  const [filterJam, setFilterJam] = useState(""); 
  const [radius, setRadius] = useState(0); 

  // 1. Fetch Data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("peta").select("*");
        setStores(data || []);
        const response = await fetch("/14.71_kecamatan.geojson"); 
        const geoData = await response.json();
        setGeoJsonData(geoData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // 2. Handlers
  const handleKecamatanChange = (e) => {
    const name = e.target.value;
    setFilterKecamatan(name);
    if (name && geoJsonData) {
      const feature = geoJsonData.features.find(f => f.properties.nm_kecamatan === name);
      if (feature) setMapBounds(L.geoJSON(feature).getBounds());
    } else {
      setMapBounds(null);
    }
  };

  const toggleMultiFilter = (value, state, setState) => {
    state.includes(value) ? setState(state.filter(i => i !== value)) : setState([...state, value]);
  };

  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
          setRadius(2); 
        },
        () => alert("Gagal mendapatkan lokasi.")
      );
    }
  };

  // 3. Logic Filtering
  const filteredData = stores.filter((t) => {
    const lat = typeof t.latitude === "string" ? parseFloat(t.latitude.replace(',', '.')) : t.latitude;
    const lng = typeof t.longitude === "string" ? parseFloat(t.longitude.replace(',', '.')) : t.longitude;
    
    if (radius > 0 && userPos && getDistance(userPos[0], userPos[1], lat, lng) > radius) return false;

    const nama = (t.nama_toko || "").toLowerCase();
    const fas = (t.fasilitas || "").toLowerCase();
    const jamOp = (t.jam_operasional || "").toLowerCase();
    
    if (!nama.includes(searchQuery.toLowerCase())) return false;
    if (filterKecamatan !== "" && t.kecamatan !== filterKecamatan) return false;
    if (filterJam === "24" && !jamOp.includes("24")) return false;

    if (filterJenis.length > 0) {
      const matchBrand = filterJenis.some(jenis => {
        if (jenis === "Indomaret Fresh") return nama.includes("indomaret") && nama.includes("fresh");
        if (jenis === "Indomaret") return nama.includes("indomaret") && !nama.includes("fresh");
        if (jenis === "Alfamart") return nama.includes("alfamart");
        return false;
      });
      if (!matchBrand) return false;
    }

    if (filterFasilitas.length > 0) {
      const hasAllFasilitas = filterFasilitas.every(f => fas.includes(f.toLowerCase()));
      if (!hasAllFasilitas) return false;
    }
    return true;
  });

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-red-600" size={48} /></div>;

  return (
    <div className="relative w-full h-screen bg-white p-4 overflow-hidden font-sans">
      <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-gray-100 bg-gray-100">
        
        {/* MAP CONTAINER */}
        <MapContainer center={centerPekanbaru} zoom={13} zoomControl={false} className="w-full h-full z-0">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ZoomControl position="bottomleft" />
          <MapController bounds={mapBounds} />
          
          {geoJsonData && (
            <GeoJSON 
              data={geoJsonData} 
              style={(feature) => ({
                fillColor: feature.properties.nm_kecamatan === filterKecamatan ? "#ef4444" : "transparent",
                weight: 1,
                opacity: 0.5,
                color: "#ef4444",
                fillOpacity: feature.properties.nm_kecamatan === filterKecamatan ? 0.15 : 0,
              })}
            />
          )}

          {userPos && (
            <>
              <Marker position={userPos} icon={L.divIcon({ html: `<div style="background: #10b981; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(16,185,129,0.5);"></div>`, className: "user-pos" })} />
              {radius > 0 && <Circle center={userPos} radius={radius * 1000} pathOptions={{ color: '#10b981', fillOpacity: 0.05, weight: 1, dashArray: '5, 5' }} />}
            </>
          )}

          {filteredData.map((t) => (
            <Marker 
              key={t.id} 
              icon={createCustomIcon(t.nama_toko)} 
              position={[parseFloat(t.latitude.toString().replace(',','.')), parseFloat(t.longitude.toString().replace(',','.'))]} 
              eventHandlers={{ click: () => setSelectedToko(t) }} 
            />
          ))}
        </MapContainer>

        {/* SIDEBAR FILTER */}
        <div className="absolute top-10 right-8 bottom-10 w-85 z-[1005]">
          <div className="w-full h-full bg-white/90 backdrop-blur-xl shadow-2xl rounded-[3rem] flex flex-col border border-white/50 p-7 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-black text-gray-800 text-lg tracking-tight">E-RETAIL MAP</h2>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Pekanbaru Digital City</p>
              </div>
              <button onClick={() => {setFilterKecamatan(""); setFilterJenis([]); setFilterFasilitas([]); setFilterJam(""); setRadius(0); setUserPos(null);}} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"><RotateCcw size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-7 pr-1 custom-scrollbar pb-10">
              {/* KECAMATAN */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Wilayah Kecamatan</label>
                <div className="relative">
                  <select value={filterKecamatan} onChange={handleKecamatanChange} className="w-full bg-gray-50/50 border-2 border-transparent focus:border-red-500 rounded-2xl p-4 text-xs font-bold outline-none appearance-none cursor-pointer transition-all">
                    <option value="">Seluruh Pekanbaru</option>
                    {geoJsonData?.features.map((f, i) => <option key={i} value={f.properties.nm_kecamatan}>{f.properties.nm_kecamatan}</option>)}
                  </select>
                  <MapIcon className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* MEREK (DENGAN IKON BARU) */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Merek Ritel</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {id: 'Alfamart', label: 'ALFAMART', icon: <Store size={16} />, color: 'text-red-500', active: 'bg-red-500 text-white' },
                    {id: 'Indomaret', label: 'INDOMARET', icon: <Store size={16} />, color: 'text-blue-500', active: 'bg-blue-500 text-white' },
                    {id: 'Indomaret Fresh', label: 'INDOMARET FRESH', icon: <Utensils size={16} />, color: 'text-orange-500', active: 'bg-orange-500 text-white' }
                  ].map((m) => (
                    <button 
                      key={m.id} 
                      onClick={() => toggleMultiFilter(m.id, filterJenis, setFilterJenis)} 
                      className={`py-4 px-5 rounded-2xl text-[10px] font-black border-2 transition-all flex items-center gap-4 ${filterJenis.includes(m.id) ? m.active + " border-transparent shadow-lg" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"}`}
                    >
                      <div className={filterJenis.includes(m.id) ? "text-white" : m.color}>{m.icon}</div>
                      <span className="flex-1 text-left">{m.label}</span>
                      {filterJenis.includes(m.id) && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* RADIUS GPS */}
              <div className="bg-gray-50/80 p-6 rounded-[2.5rem] border border-gray-100 space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Radius Terdekat</label>
                {!userPos ? (
                  <button onClick={handleGetUserLocation} className="w-full py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-500 flex items-center justify-center gap-2 hover:border-green-500 hover:text-green-600 transition-all">
                    <Navigation size={14} /> AKTIFKAN LOKASI
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end"><span className="text-3xl font-black text-green-600">{radius}</span><span className="text-[10px] font-black text-gray-400 mb-1 tracking-widest">KILOMETER</span></div>
                    <input type="range" min="0.5" max="10" step="0.5" value={radius} onChange={(e) => setRadius(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500" />
                  </div>
                )}
              </div>

              {/* FASILITAS & JAM */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fasilitas & Waktu</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'ATM', icon: <CreditCard size={18} />, active: 'bg-purple-600 border-purple-600 text-white shadow-purple-100' },
                    { v: 'Cafe', icon: <Coffee size={18} />, active: 'bg-amber-600 border-amber-600 text-white shadow-amber-100' }
                  ].map((f) => (
                    <button key={f.v} onClick={() => toggleMultiFilter(f.v, filterFasilitas, setFilterFasilitas)} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${filterFasilitas.includes(f.v) ? f.active + " shadow-lg" : "bg-white border-gray-100 text-gray-400"}`}>
                      {f.icon} <span className="text-[9px] font-black uppercase">{f.v}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setFilterJam(filterJam === "24" ? "" : "24")} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${filterJam === "24" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border-gray-100 text-gray-400"}`}>
                  <div className="flex items-center gap-3">{filterJam === "24" ? <Moon size={18} /> : <Sun size={18} />} <span className="text-[10px] font-black uppercase tracking-widest">Buka 24 Jam</span></div>
                  <ChevronRight size={14} className={filterJam === "24" ? "rotate-90 transition-all" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL (DENGAN TAMPILAN FASILITAS) */}
      {selectedToko && (
        <div className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedToko(null)}>
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56">
              <img src={selectedToko.gambar_url || "https://via.placeholder.com/500x300?text=Retail+Pekanbaru"} className="w-full h-full object-cover" alt="store" />
              <div className="absolute top-6 left-6">
                <span className={`px-4 py-2 rounded-full text-[9px] font-black text-white uppercase shadow-lg ${selectedToko.nama_toko.toLowerCase().includes('alfamart') ? 'bg-red-600' : selectedToko.nama_toko.toLowerCase().includes('fresh') ? 'bg-orange-500' : 'bg-blue-600'}`}>
                  {selectedToko.nama_toko.toLowerCase().includes('alfamart') ? 'Alfamart' : selectedToko.nama_toko.toLowerCase().includes('fresh') ? 'Indomaret Fresh' : 'Indomaret'}
                </span>
              </div>
            </div>

            <div className="p-9">
              <h2 className="text-2xl font-black text-gray-800 mb-6 leading-tight tracking-tight">{selectedToko.nama_toko}</h2>
              
              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-3 rounded-2xl text-gray-400"><MapPin size={20} /></div>
                  <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Lokasi</p><p className="text-sm font-bold text-gray-600">{selectedToko.kecamatan}, Pekanbaru</p></div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 p-3 rounded-2xl text-green-500"><Clock size={20} /></div>
                  <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Operasional</p><p className="text-sm font-black text-green-700">{selectedToko.jam_operasional}</p></div>
                </div>

                {/* INFO FASILITAS DI MODAL */}
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Fasilitas Tersedia</p>
                  <div className="flex gap-2">
                    {selectedToko.fasilitas?.toLowerCase().includes('atm') ? (
                      <div className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-xl border border-purple-100">
                        <CreditCard size={14} /> <span className="text-[10px] font-black">ATM</span>
                      </div>
                    ) : null}
                    {selectedToko.fasilitas?.toLowerCase().includes('cafe') ? (
                      <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100">
                        <Coffee size={14} /> <span className="text-[10px] font-black">CAFE</span>
                      </div>
                    ) : null}
                    {(!selectedToko.fasilitas || selectedToko.fasilitas === "-") && (
                      <p className="text-xs italic text-gray-400">Standar Retail</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedToko.latitude},${selectedToko.longitude}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-200"
                >
                  Navigasi <ExternalLink size={14} />
                </a>
                <button onClick={() => setSelectedToko(null)} className="px-6 bg-gray-50 text-gray-400 p-4 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-100 transition-all">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}