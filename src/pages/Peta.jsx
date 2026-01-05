import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, ZoomControl, Circle, GeoJSON, useMap } from "react-leaflet";
import { supabase } from "../supabaseClient"; 
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Search, Loader2, Coffee, CreditCard, Store, 
  MapPin, Clock, Moon, Sun, LayoutGrid, 
  Filter as FilterIcon, ChevronRight, RotateCcw, ExternalLink, Navigation, LocateFixed, Map as MapIcon, CheckCircle2
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

// --- KOMPONEN AUTO ZOOM KE WILAYAH ---
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
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
        <div style="transform: rotate(45deg); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>`,
    iconSize: [30, 30], iconAnchor: [15, 30],
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
  
  // Filter States (Multi-select menggunakan Array)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterJenis, setFilterJenis] = useState([]); // Array untuk multi merek
  const [filterFasilitas, setFilterFasilitas] = useState([]); // Array untuk multi fasilitas
  const [filterJam, setFilterJam] = useState(""); // 24 Jam atau Semua
  const [radius, setRadius] = useState(0); 
  const [isLocating, setIsLocating] = useState(false);

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
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // 2. GeoJSON Styling
  const geoJsonStyle = (feature) => {
    const isActive = feature.properties.nm_kecamatan === filterKecamatan;
    return {
      fillColor: isActive ? "#ef4444" : "transparent",
      weight: isActive ? 2 : 0.5,
      opacity: isActive ? 1 : 0.3,
      color: "#ef4444",
      fillOpacity: isActive ? 0.2 : 0,
    };
  };

  // 3. Handlers
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
    if (state.includes(value)) {
      setState(state.filter(i => i !== value));
    } else {
      setState([...state, value]);
    }
  };

  const handleGetUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
          setRadius(2); setIsLocating(false);
        },
        () => { alert("Gagal akses GPS."); setIsLocating(false); }
      );
    }
  };

  const filteredData = stores.filter((t) => {
    const lat = typeof t.latitude === "string" ? parseFloat(t.latitude.replace(',', '.')) : t.latitude;
    const lng = typeof t.longitude === "string" ? parseFloat(t.longitude.replace(',', '.')) : t.longitude;
    
    if (radius > 0 && userPos && getDistance(userPos[0], userPos[1], lat, lng) > radius) return false;

    const nama = (t.nama_toko || "").toLowerCase();
    const fas = (t.fasilitas || "").toLowerCase();
    const jamOp = (t.jam_operasional || "").toLowerCase();
    
    // Filter Search & Kecamatan
    if (!nama.includes(searchQuery.toLowerCase())) return false;
    if (filterKecamatan !== "" && t.kecamatan !== filterKecamatan) return false;

    // Filter Jam Operasional
    if (filterJam === "24" && !jamOp.includes("24")) return false;

    // Filter Jenis (Multi-select logic)
    if (filterJenis.length > 0) {
      const matchBrand = filterJenis.some(jenis => {
        if (jenis === "Indomaret Fresh") return nama.includes("indomaret") && nama.includes("fresh");
        if (jenis === "Indomaret") return nama.includes("indomaret") && !nama.includes("fresh");
        if (jenis === "Alfamart") return nama.includes("alfamart");
        return false;
      });
      if (!matchBrand) return false;
    }

    // Filter Fasilitas (Multi-select logic: Harus punya SEMUA yang dipilih)
    if (filterFasilitas.length > 0) {
      const hasAllFasilitas = filterFasilitas.every(f => fas.includes(f.toLowerCase()));
      if (!hasAllFasilitas) return false;
    }

    return true;
  });

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={48} /></div>;

  return (
    <div className="relative w-full h-screen bg-white p-4 overflow-hidden font-sans">
      <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-gray-100">
        
        <MapContainer center={centerPekanbaru} zoom={13} zoomControl={false} className="w-full h-full z-0">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ZoomControl position="bottomleft" />
          <MapController bounds={mapBounds} />
          
          {geoJsonData && (
            <GeoJSON 
              data={geoJsonData} 
              style={geoJsonStyle}
              onEachFeature={(f, l) => l.bindTooltip(f.properties.nm_kecamatan, { sticky: true })}
            />
          )}

          {userPos && (
            <>
              <Marker position={userPos} icon={L.divIcon({ html: `<div style="background: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white;"></div>`, className: "user-pos" })} />
              {radius > 0 && <Circle center={userPos} radius={radius * 1000} pathOptions={{ color: '#10b981', fillOpacity: 0.1, weight: 1 }} />}
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

        {/* SIDEBAR */}
        <div className="absolute top-24 right-6 bottom-6 w-80 z-[1005] pointer-events-auto">
          <div className="w-full h-full bg-white/95 backdrop-blur-md shadow-2xl rounded-[3rem] flex flex-col border border-white p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-gray-800 uppercase text-sm flex items-center gap-2"><FilterIcon size={18} className="text-red-600" /> Filter</h2>
              <button onClick={() => {setSearchQuery(""); setFilterKecamatan(""); setFilterJenis([]); setFilterFasilitas([]); setFilterJam(""); setRadius(0); setUserPos(null); setMapBounds(null);}} className="p-2 hover:bg-red-50 text-gray-400 rounded-xl"><RotateCcw size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1 pb-10">
              {/* KECAMATAN */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kecamatan</label>
                <div className="relative mt-1">
                  <select value={filterKecamatan} onChange={handleKecamatanChange} className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl p-4 text-xs font-bold outline-none appearance-none cursor-pointer">
                    <option value="">Semua Wilayah</option>
                    {geoJsonData?.features.map((f, i) => <option key={i} value={f.properties.nm_kecamatan}>{f.properties.nm_kecamatan}</option>)}
                  </select>
                  <MapIcon className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* RADIUS */}
              <div className="bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100 space-y-4">
                <div className="flex justify-between items-center"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Radius Terdekat</label><Navigation size={14} className={userPos ? "text-green-500 animate-pulse" : "text-gray-300"} /></div>
                {!userPos ? (
                  <button onClick={handleGetUserLocation} className="w-full py-4 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black text-gray-600 flex items-center justify-center gap-2 hover:border-green-500 transition-all shadow-sm">AKTIFKAN GPS</button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between font-black text-green-600 text-2xl">{radius} <small className="text-[10px] uppercase text-gray-400">KM</small></div>
                    <input type="range" min="0.5" max="10" step="0.5" value={radius} onChange={(e) => setRadius(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500" />
                  </div>
                )}
              </div>

              {/* MEREK (MULTI SELECT) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Merek (Bisa pilih banyak)</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {id: 'Alfamart', label: 'ALFAMART', color: 'border-red-500 text-red-600', active: 'bg-red-600 text-white'},
                    {id: 'Indomaret', label: 'INDOMARET', color: 'border-blue-500 text-blue-600', active: 'bg-blue-600 text-white'},
                    {id: 'Indomaret Fresh', label: 'INDOMARET FRESH', color: 'border-orange-500 text-orange-600', active: 'bg-orange-500 text-white'}
                  ].map((m) => (
                    <button 
                      key={m.id} 
                      onClick={() => toggleMultiFilter(m.id, filterJenis, setFilterJenis)} 
                      className={`py-3 px-4 rounded-2xl text-[10px] font-black border-2 transition-all flex items-center justify-between ${filterJenis.includes(m.id) ? m.active : `bg-white border-gray-100 text-gray-400 hover:border-gray-200`}`}
                    >
                      {m.label}
                      {filterJenis.includes(m.id) && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* FASILITAS (MULTI SELECT) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fasilitas</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: 'ATM', icon: <CreditCard size={18} /> }, 
                    { v: 'Cafe', icon: <Coffee size={18} /> }
                  ].map((f) => (
                    <button 
                      key={f.v} 
                      onClick={() => toggleMultiFilter(f.v, filterFasilitas, setFilterFasilitas)} 
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${filterFasilitas.includes(f.v) ? "bg-purple-600 border-transparent text-white shadow-lg" : "bg-white border-gray-100 text-gray-400"}`}
                    >
                      {f.icon} <span className="text-[9px] font-black uppercase">{f.v}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* JAM OPERASIONAL */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Waktu</label>
                <button 
                  onClick={() => setFilterJam(filterJam === "24" ? "" : "24")} 
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${filterJam === "24" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-gray-100 text-gray-400"}`}
                >
                  <div className="flex items-center gap-3">
                    {filterJam === "24" ? <Moon size={18} /> : <Sun size={18} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Buka 24 Jam</span>
                  </div>
                  <ChevronRight size={14} className={filterJam === "24" ? "rotate-90 transition-all" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedToko && (
        <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedToko(null)}>
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-52">
              <img src={selectedToko.gambar_url || "https://via.placeholder.com/400x200?text=No+Photo"} className="w-full h-full object-cover" alt="store" />
              <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase shadow-lg ${selectedToko.nama_toko.toLowerCase().includes('alfamart') ? 'bg-red-600' : selectedToko.nama_toko.toLowerCase().includes('fresh') ? 'bg-orange-500' : 'bg-blue-600'}`}>
                {selectedToko.nama_toko.toLowerCase().includes('alfamart') ? 'Alfamart' : selectedToko.nama_toko.toLowerCase().includes('fresh') ? 'Indomaret Fresh' : 'Indomaret'}
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-800 mb-6 leading-tight">{selectedToko.nama_toko}</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 text-gray-600">
                  <div className="bg-red-50 p-2.5 rounded-xl text-red-500"><MapPin size={20} /></div>
                  <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lokasi</p><p className="text-sm font-semibold">{selectedToko.kecamatan}</p></div>
                </div>
                <div className="flex items-start gap-4 text-gray-600">
                  <div className="bg-green-50 p-2.5 rounded-xl text-green-500"><Clock size={20} /></div>
                  <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Operasional</p><p className="text-sm font-black text-green-700">{selectedToko.jam_operasional}</p></div>
                </div>
              </div>
              <button onClick={() => setSelectedToko(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}