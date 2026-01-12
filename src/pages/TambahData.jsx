import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents, GeoJSON, useMap } from "react-leaflet";
import { supabase } from "../supabaseClient";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Save, MapPin, Navigation, Store, 
  Image as ImageIcon, Clock, ChevronLeft, Loader2, Upload, ChevronDown, CheckCircle2, Search, X
} from "lucide-react";

// --- KOMPONEN UNTUK AUTO ZOOM ---
function MapController({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], duration: 1.5 });
    }
  }, [bounds, map]);
  return null;
}

const createCustomIcon = (namaToko) => {
  const namaLower = namaToko?.toLowerCase() || "";
  let color = "#eb2f06"; 
  if (namaLower.includes("fresh")) color = "#f0932b"; 
  else if (namaLower.includes("indomaret")) color = "#1e3799"; 

  return L.divIcon({
    className: "custom-marker-container",
    html: `<div style="position: relative; width: 32px; height: 32px;">
            <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
            </div>
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

export default function TambahToko() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null); 
  const [mapBounds, setMapBounds] = useState(null); 
  
  const centerPekanbaru = [0.5333, 101.4475];
  const daftarJam = ["24 Jam", "07.00 - 22.00"];
  const daftarKecamatan = [
    "Bukit Raya", "Binawidya", "Lima Puluh", "Marpoyan Damai", 
    "Payung Sekaki", "Pekanbaru Kota", "Rumbai", "Rumbai Barat", 
    "Rumbai Timur", "Senapelan", "Sukajadi", "Tuah Madani", 
    "Tenayan Raya", "Kulim", "Sail"
  ].sort();

  const [formData, setFormData] = useState({
    nama_toko: "",
    kecamatan: "",
    latitude: "",
    longitude: "",
    fasilitas: [],
    jam_operasional: "",
  });

  useEffect(() => {
    fetch("/14.71_kecamatan.geojson") 
      .then(res => res.json())
      .then(data => setGeoJsonData(data))
      .catch(err => console.error("Gagal load GeoJSON:", err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleKecamatanChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, kecamatan: value });
    if (value && geoJsonData) {
      const feature = geoJsonData.features.find(
        f => f.properties.nm_kecamatan.toLowerCase() === value.toLowerCase()
      );
      if (feature) {
        const layer = L.geoJSON(feature);
        setMapBounds(layer.getBounds());
      }
    } else {
      setMapBounds(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleFasilitas = (item) => {
    const current = [...formData.fasilitas];
    const index = current.indexOf(item);
    if (index > -1) current.splice(index, 1);
    else current.push(item);
    setFormData({ ...formData, fasilitas: current });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) return alert("Isi koordinat atau pilih lokasi di peta!");
    
    setLoading(true);
    let finalImageUrl = "";

    try {
      if (imageFile) {
        setUploading(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: upError } = await supabase.storage.from('foto_toko').upload(fileName, imageFile);
        if (upError) throw upError;
        const { data } = supabase.storage.from('foto_toko').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      const { error } = await supabase.from("peta").insert([{ 
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        fasilitas: formData.fasilitas.join(", "),
        gambar_url: finalImageUrl
      }]);

      if (error) throw error;
      alert("Toko Berhasil Terdaftar!");
      navigate("/TabelPeta");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  function LocationPicker() {
    useMapEvents({
      click(e) {
        setFormData(prev => ({
          ...prev,
          latitude: e.latlng.lat.toFixed(6),
          longitude: e.latlng.lng.toFixed(6)
        }));
      },
    });
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    return (!isNaN(lat) && !isNaN(lng)) ? (
      <Marker position={[lat, lng]} icon={createCustomIcon(formData.nama_toko)} />
    ) : null;
  }

  return (
    <div className="space-y-6 font-sans p-4 bg-[#F8F9FA] min-h-screen">
      <header className="flex items-center gap-4">
        <NavLink to="/TabelPeta" className="p-3 bg-white shadow-sm rounded-2xl hover:bg-gray-50 transition-all">
          <ChevronLeft size={20} className="text-gray-600" />
        </NavLink>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Register Store.</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Geospasial Data Entry System</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          
          <div className="space-y-4">
            {/* PHOTO UPLOAD */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Documentation</label>
              <div className="mt-2 relative">
                {imagePreview ? (
                  <div className="relative rounded-[2rem] overflow-hidden h-44 border-2 border-gray-50 shadow-inner">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <button type="button" onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg"><X size={14}/></button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[140px] group hover:bg-gray-100 transition-all">
                    <Upload className="text-gray-300 mb-2 group-hover:text-red-500 transition-colors" size={32} />
                    <p className="text-[9px] font-black text-gray-400 uppercase">Upload Image</p>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                )}
              </div>
            </div>

            {/* MEREK & KECAMATAN */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Merek Gerai</label>
                <div className="relative">
                  <select name="nama_toko" required className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm appearance-none" onChange={handleInputChange} value={formData.nama_toko}>
                    <option value="">Pilih...</option>
                    <option value="Indomaret">Indomaret</option>
                    <option value="Indomaret Fresh">Indomaret Fresh</option>
                    <option value="Alfamart">Alfamart</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kecamatan</label>
                <div className="relative">
                  <select name="kecamatan" required className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm appearance-none" onChange={handleKecamatanChange} value={formData.kecamatan}>
                    <option value="">Pilih...</option>
                    {daftarKecamatan.map(kec => <option key={kec} value={kec}>{kec}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* JAM OPERASIONAL */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jam Operasional</label>
              <div className="relative">
                <select name="jam_operasional" required className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm appearance-none" onChange={handleInputChange} value={formData.jam_operasional}>
                  <option value="">Pilih Jam...</option>
                  {daftarJam.map(jam => <option key={jam} value={jam}>{jam}</option>)}
                </select>
                <Clock className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* FASILITAS */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fasilitas Tambahan</label>
              <div className="flex gap-2 mt-1">
                {["ATM", "Cafe"].map((f) => (
                  <button key={f} type="button" onClick={() => toggleFasilitas(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border-2 ${formData.fasilitas.includes(f) ? "bg-red-600 border-red-600 text-white" : "bg-white border-gray-100 text-gray-400"}`}>
                    {formData.fasilitas.includes(f) && <CheckCircle2 size={12}/>} {f}
                  </button>
                ))}
              </div>
            </div>

            {/* KOORDINAT (EDITABLE) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Latitude</label>
                <input 
                  type="number" 
                  step="any" 
                  name="latitude" 
                  placeholder="0.0000" 
                  className="w-full px-5 py-3 bg-blue-50/50 border-2 border-transparent focus:border-blue-400 rounded-2xl font-mono font-bold text-xs text-blue-600 outline-none transition-all" 
                  value={formData.latitude} 
                  onChange={handleInputChange} // Sekarang bisa diketik
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-green-500 uppercase tracking-widest ml-1">Longitude</label>
                <input 
                  type="number" 
                  step="any" 
                  name="longitude" 
                  placeholder="0.0000" 
                  className="w-full px-5 py-3 bg-green-50/50 border-2 border-transparent focus:border-green-400 rounded-2xl font-mono font-bold text-xs text-green-600 outline-none transition-all" 
                  value={formData.longitude} 
                  onChange={handleInputChange} // Sekarang bisa diketik
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading || uploading} className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-600 transition-all shadow-xl disabled:bg-gray-300 flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={16}/> Submit To Cloud</>}
          </button>
        </div>

        {/* MAP PANEL */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[550px]">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Search size={14} className="text-red-500" /> 
                {formData.kecamatan ? `Focus: ${formData.kecamatan}` : "Pilih Kecamatan untuk Zoom"}
              </span>
          </div>
          <div className="flex-1 z-0">
            <MapContainer center={centerPekanbaru} zoom={13} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController bounds={mapBounds} />
              {geoJsonData && (
                <GeoJSON 
                  key={formData.kecamatan}
                  data={geoJsonData}
                  style={(feature) => ({
                    fillColor: feature.properties.nm_kecamatan.toLowerCase() === formData.kecamatan.toLowerCase() ? "#ef4444" : "transparent",
                    weight: feature.properties.nm_kecamatan.toLowerCase() === formData.kecamatan.toLowerCase() ? 2 : 0,
                    opacity: 1,
                    color: "#ef4444",
                    fillOpacity: 0.1,
                  })}
                />
              )}
              <LocationPicker />
            </MapContainer>
          </div>
        </div>
      </form>
    </div>
  );
}