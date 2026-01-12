import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { supabase } from "../supabaseClient";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Save, MapPin, Navigation, Store, 
  Image as ImageIcon, Clock, ChevronLeft, Loader2, Upload, ChevronDown, CheckCircle2
} from "lucide-react";

// --- CUSTOM MARKER LOGIC (IDENTIK DENGAN HALAMAN PETA) ---
const createCustomIcon = (namaToko) => {
  const namaLower = namaToko?.toLowerCase() || "";
  let color = "#eb2f06"; // Default Alfamart (Merah)
  
  if (namaLower.includes("fresh")) color = "#f0932b"; // Indomaret Fresh (Orange)
  else if (namaLower.includes("indomaret")) color = "#1e3799"; // Indomaret (Biru)

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
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
      </div>
    `,
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
  
  const centerPekanbaru = [0.5333, 101.4475];

  const daftarKecamatan = [
    "Bukit Raya", "Binawidya", "Lima Puluh", "Marpoyan Damai", 
    "Payung Sekaki", "Pekanbaru Kota", "Rumbai", "Rumbai Barat", 
    "Rumbai Timur", "Senapelan", "Sukajadi", "Tuah Madani", 
    "Tenayan Raya", "Kulim", "Sail"
  ].sort();

  const daftarJam = ["24 Jam", "07.00 - 22.00"];
  const opsiFasilitas = ["ATM", "Cafe"];

  const [formData, setFormData] = useState({
    nama_toko: "",
    kecamatan: "",
    latitude: "",
    longitude: "",
    fasilitas: [],
    jam_operasional: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleFasilitas = (item) => {
    const current = [...formData.fasilitas];
    const index = current.indexOf(item);
    if (index > -1) current.splice(index, 1);
    else current.push(item);
    setFormData({ ...formData, fasilitas: current });
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('foto_toko').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('foto_toko').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      alert("Gagal upload gambar: " + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) return alert("Tentukan lokasi!");
    setLoading(true);
    let finalImageUrl = "";

    try {
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const { error } = await supabase.from("peta").insert([{ 
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        fasilitas: formData.fasilitas.join(", "),
        gambar_url: finalImageUrl
      }]);

      if (error) throw error;
      alert("Toko berhasil disimpan!");
      navigate("/TabelPeta");
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- KOMPONEN PICKER PETA ---
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
      <Marker 
        position={[lat, lng]} 
        icon={createCustomIcon(formData.nama_toko)} 
      />
    ) : null;
  }

  return (
    <div className="space-y-6 font-sans p-4 bg-[#F8F9FA] min-h-screen">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <NavLink to="/TabelPeta" className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </NavLink>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Register Store.</h1>
        </div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest ml-12">Entry data & geolokasi presisi</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
          
          <div className="space-y-4">
            {/* MEREK */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Merek Gerai</label>
              <div className="relative mt-1">
                <select name="nama_toko" required className="w-full px-6 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer transition-all" onChange={handleInputChange} value={formData.nama_toko}>
                  <option value="">Pilih Merek...</option>
                  <option value="Indomaret">Indomaret</option>
                  <option value="Indomaret Fresh">Indomaret Fresh</option>
                  <option value="Alfamart">Alfamart</option>
                </select>
                <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* KECAMATAN */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kecamatan</label>
              <div className="relative mt-1">
                <select name="kecamatan" required className="w-full px-6 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer transition-all" onChange={handleInputChange} value={formData.kecamatan}>
                  <option value="">Pilih Kecamatan...</option>
                  {daftarKecamatan.map(kec => <option key={kec} value={kec}>{kec}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* JAM OPERASIONAL */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jam Operasional</label>
              <div className="relative mt-1">
                <select name="jam_operasional" required className="w-full px-6 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer transition-all" onChange={handleInputChange} value={formData.jam_operasional}>
                  <option value="">Pilih Jam...</option>
                  {daftarJam.map(jam => <option key={jam} value={jam}>{jam}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* FASILITAS */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fasilitas</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {opsiFasilitas.map((f) => {
                  const isActive = formData.fasilitas.includes(f);
                  return (
                    <button key={f} type="button" onClick={() => toggleFasilitas(f)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border-2 ${isActive ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-100" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"}`}>
                      {isActive && <CheckCircle2 size={12} />} {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FOTO */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dokumentasi Foto</label>
              <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem] p-4 bg-gray-50 hover:bg-gray-100 transition-all relative overflow-hidden group min-h-[140px]">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-2xl" />
                ) : (
                  <div className="text-center">
                    <Upload className="text-gray-300 mx-auto mb-2 group-hover:text-red-500" size={32} />
                    <p className="text-[9px] font-black text-gray-400 uppercase">Upload Foto</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* KOORDINAT (SEKARANG BISA DIINPUT MANUAL) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Latitude</label>
                <input 
                  type="number" step="any" name="latitude" 
                  placeholder="0.000000"
                  className="w-full px-5 py-3 bg-blue-50/50 border-2 border-transparent focus:border-blue-400 rounded-2xl outline-none font-mono font-bold text-xs text-blue-600 mt-1"
                  value={formData.latitude}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-green-400 uppercase tracking-widest ml-1">Longitude</label>
                <input 
                  type="number" step="any" name="longitude" 
                  placeholder="0.000000"
                  className="w-full px-5 py-3 bg-green-50/50 border-2 border-transparent focus:border-green-400 rounded-2xl outline-none font-mono font-bold text-xs text-green-600 mt-1"
                  value={formData.longitude}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading || uploading} className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-600 transition-all shadow-xl disabled:bg-gray-400 active:scale-95">
            {loading || uploading ? <Loader2 className="animate-spin mx-auto" /> : "Simpan Ke Database"}
          </button>
        </div>

        {/* MAP PICKER */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Navigation size={16} className="text-red-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Klik Peta untuk Pin Lokasi Otomatis</span>
             </div>
          </div>
          <div className="flex-1 z-0">
            <MapContainer center={centerPekanbaru} zoom={13} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker />
            </MapContainer>
          </div>
        </div>
      </form>
    </div>
  );
}