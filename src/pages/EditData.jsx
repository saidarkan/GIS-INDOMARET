import React, { useState, useEffect } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { supabase } from "../supabaseClient";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Save, Store, Clock, ChevronLeft, Loader2, Upload, MapPin 
} from "lucide-react";

export default function EditData() {
  const { id } = useParams(); // Mengambil ID dari URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    nama_toko: "",
    kecamatan: "",
    latitude: "",
    longitude: "",
    fasilitas: "",
    jam_operasional: "",
    gambar_url: ""
  });

  // 1. Ambil data lama saat halaman dibuka
  useEffect(() => {
    fetchStoreData();
  }, [id]);

  const fetchStoreData = async () => {
    try {
      const { data, error } = await supabase
        .from("peta")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          nama_toko: data.nama_toko,
          kecamatan: data.kecamatan,
          latitude: data.latitude.toString(),
          longitude: data.longitude.toString(),
          fasilitas: data.fasilitas,
          jam_operasional: data.jam_operasional,
          gambar_url: data.gambar_url
        });
        setImagePreview(data.gambar_url);
      }
    } catch (error) {
      alert("Error mengambil data: " + error.message);
      navigate("/TabelPeta");
    } finally {
      setLoading(false);
    }
  };

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

  // 2. Fungsi Upload Gambar (Hanya jika ada file baru)
  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('foto_toko')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('foto_toko')
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    } catch (error) {
      console.error('Error upload:', error.message);
      return null;
    }
  };

  // 3. Fungsi Update Gabungan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      let finalImageUrl = formData.gambar_url;

      // Jika ada file baru dipilih, upload dulu
      if (imageFile) {
        const newUrl = await uploadImage(imageFile);
        if (newUrl) finalImageUrl = newUrl;
      }

      const { error } = await supabase
        .from("peta")
        .update({
          nama_toko: formData.nama_toko,
          kecamatan: formData.kecamatan,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          fasilitas: formData.fasilitas,
          jam_operasional: formData.jam_operasional,
          gambar_url: finalImageUrl
        })
        .eq("id", id);

      if (error) throw error;

      alert("Data berhasil diperbarui!");
      navigate("/TabelPeta");
    } catch (error) {
      alert("Gagal update: " + error.message);
    } finally {
      setUpdating(false);
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

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <NavLink to="/TabelPeta" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50">
          <ChevronLeft size={24} />
        </NavLink>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Edit Store.</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">ID: {id}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Toko</label>
              <input name="nama_toko" value={formData.nama_toko} required className="w-full px-6 py-3.5 mt-1 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm" onChange={handleInputChange} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kecamatan</label>
              <input name="kecamatan" value={formData.kecamatan} required className="w-full px-6 py-3.5 mt-1 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm" onChange={handleInputChange} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Foto Toko (Kosongkan jika tidak diganti)</label>
              <div className="mt-2 relative group min-h-[160px] border-2 border-dashed border-gray-200 rounded-[2rem] overflow-hidden bg-gray-50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-40"><Upload size={32} className="text-gray-300" /></div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Latitude</label>
                <input value={formData.latitude} readOnly className="w-full px-4 py-3 mt-1 bg-blue-50 border-none rounded-xl font-mono text-xs font-bold text-blue-600" />
              </div>
              <div>
                <label className="text-[10px] font-black text-green-400 uppercase tracking-widest ml-1">Longitude</label>
                <input value={formData.longitude} readOnly className="w-full px-4 py-3 mt-1 bg-green-50 border-none rounded-xl font-mono text-xs font-bold text-green-600" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fasilitas</label>
              <input name="fasilitas" value={formData.fasilitas} className="w-full px-6 py-3.5 mt-1 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm" onChange={handleInputChange} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jam Operasional</label>
              <input name="jam_operasional" value={formData.jam_operasional} className="w-full px-6 py-3.5 mt-1 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm" onChange={handleInputChange} />
            </div>
          </div>

          <button type="submit" disabled={updating} className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-600 transition-all shadow-xl flex items-center justify-center gap-2">
            {updating ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Perbarui Data Toko</>}
          </button>
        </div>

        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 bg-gray-50 border-b flex items-center gap-2">
            <MapPin size={16} className="text-red-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Klik peta untuk ubah lokasi</span>
          </div>
          <div className="flex-1">
            <MapContainer center={[parseFloat(formData.latitude) || 0.53, parseFloat(formData.longitude) || 101.44]} zoom={15} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker />
            </MapContainer>
          </div>
        </div>
      </form>
    </div>
  );
}