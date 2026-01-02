import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { supabase } from "../supabaseClient";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Save, MapPin, Navigation, Store, 
  Image as ImageIcon, Clock, ChevronLeft, Loader2, Upload 
} from "lucide-react";

// Fix icon default leaflet agar marker muncul
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function TambahToko() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const centerPekanbaru = [0.5333, 101.4475];

  const [formData, setFormData] = useState({
    nama_toko: "",
    kecamatan: "",
    latitude: "",
    longitude: "",
    fasilitas: "",
    jam_operasional: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fungsi Upload Gambar yang lebih stabil
  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      // Upload ke bucket FOTO_TOKO
      let { error: uploadError } = await supabase.storage
        .from('foto_toko')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ambil URL Publik
      const { data } = supabase.storage
        .from('foto_toko')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error upload:', error.message);
      alert("Gagal upload gambar: " + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
        return alert("Silakan klik lokasi pada peta terlebih dahulu!");
    }
    
    setLoading(true);
    let finalImageUrl = "";

    try {
      // 1. Upload gambar jika ada
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      // 2. Insert ke database
      const { error } = await supabase.from("peta").insert([
        { 
          nama_toko: formData.nama_toko,
          kecamatan: formData.kecamatan,
          latitude: parseFloat(formData.latitude), // Pastikan format angka
          longitude: parseFloat(formData.longitude), // Pastikan format angka
          fasilitas: formData.fasilitas,
          jam_operasional: formData.jam_operasional,
          gambar_url: finalImageUrl // Link dari storage masuk ke sini
        }
      ]);

      if (error) throw error;

      alert("Toko berhasil didaftarkan!");
      navigate("/TabelPeta"); // Navigasi ke path admin yang benar

    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  function LocationPicker() {
    useMapEvents({
      click(e) {
        setFormData({
          ...formData,
          latitude: e.latlng.lat.toFixed(6),
          longitude: e.latlng.lng.toFixed(6)
        });
      },
    });
    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]} />
    ) : null;
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <NavLink to="/TabelPeta" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </NavLink>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Register Store.</h1>
        </div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest ml-12">Entry data & geolokasi presisi</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
        
        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Toko</label>
              <div className="relative group mt-1">
                <Store className="absolute left-4 top-3.5 text-gray-300 group-focus-within:text-red-500 transition-colors" size={18} />
                <input name="nama_toko" required placeholder="Indomaret / Alfamart..." className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm" onChange={handleInputChange} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kecamatan</label>
              <input name="kecamatan" required placeholder="Contoh: Tampan" className="w-full px-6 py-3.5 mt-1 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm" onChange={handleInputChange} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dokumentasi Foto</label>
              <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem] p-4 bg-gray-50 hover:bg-gray-100 transition-all relative overflow-hidden group min-h-[160px]">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-2xl mb-2" />
                ) : (
                  <div className="text-center">
                    <Upload className="text-gray-300 mx-auto mb-2 group-hover:text-red-500 transition-colors" size={32} />
                    <p className="text-[9px] font-black text-gray-400 uppercase">Pilih Foto Gerai</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Latitude</label>
                <input value={formData.latitude} readOnly placeholder="Klik Peta" className="w-full px-4 py-3 mt-1 bg-blue-50/50 border-none rounded-xl font-mono text-xs font-bold text-blue-600 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-green-400 uppercase tracking-widest ml-1">Longitude</label>
                <input value={formData.longitude} readOnly placeholder="Klik Peta" className="w-full px-4 py-3 mt-1 bg-green-50/50 border-none rounded-xl font-mono text-xs font-bold text-green-600 outline-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fasilitas</label>
              <input name="fasilitas" placeholder="ATM, Cafe, Parkir Luas" className="w-full px-6 py-3.5 mt-1 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm" onChange={handleInputChange} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jam Operasional</label>
              <div className="relative group mt-1">
                <Clock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input name="jam_operasional" placeholder="Contoh: 24 Jam atau 08.00 - 22.00" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm" onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || uploading} 
            className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading || uploading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Save size={18} /> 
                Simpan Ke Database
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Navigation size={16} className="text-red-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Interactive Location Picker</span>
             </div>
             {formData.latitude && <span className="text-[8px] bg-green-600 text-white px-3 py-1 rounded-full font-black animate-pulse uppercase tracking-widest">Lokasi Terkunci</span>}
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