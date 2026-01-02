import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; 
import { 
  ShoppingCart, Map, User, Search, 
  MapPin, Clock, CreditCard, Coffee, 
  TrendingUp, Info, Store, Loader2, ChevronRight
} from "lucide-react";
import backgroundImage from "../assets/bgAlfaIndo.jpg";

// Komponen Reusable untuk Kartu Bento
const BentoCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${className}`}>
    {children}
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  
  // States
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ indomaret: 0, alfamart: 0, atm: 0, kecamatan: 0 });
  const [filters, setFilters] = useState({
    kecamatan: "",
    fasilitas: "",
    jenis: "",
    jam: ""
  });

  // Fetch Data Riil dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("peta").select("*");
      
      if (error) {
        console.error("Error fetching data:", error);
      } else if (data) {
        setStores(data);
        
        // Perhitungan Statistik Otomatis
        const indomaret = data.filter(s => s.nama_toko?.toLowerCase().includes("indomaret")).length;
        const alfamart = data.filter(s => s.nama_toko?.toLowerCase().includes("alfamart")).length;
        const atm = data.filter(s => s.fasilitas?.toLowerCase().includes("atm")).length;
        const unikKecamatan = [...new Set(data.map(s => s.kecamatan))].filter(Boolean).length;

        setStats({ indomaret, alfamart, atm, kecamatan: unikKecamatan });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // Navigasi ke halaman peta dengan membawa state filter
    navigate("/peta", { state: { filters } });
  };

  // Ambil list kecamatan unik untuk dropdown dari database
  const listKecamatan = [...new Set(stores.map(item => item.kecamatan))].filter(Boolean).sort();

  return (
    <div className="w-full bg-[#f8fafc] font-sans">
      
      {/* --- HERO SECTION (Bento Style) --- */}
      <section className="px-4 pt-4">
        <div 
          className="relative w-full min-h-[65vh] flex items-center justify-center bg-cover bg-center rounded-[3.5rem] overflow-hidden shadow-2xl"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent" />
          <div className="relative z-10 w-full max-w-5xl px-10">
            <div className="max-w-2xl">
                <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 inline-block">
                    Pekanbaru Digital Mapping
                </span>
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic text-white leading-[0.9]">
                  Cari Toko <br /> <span className="text-white underline decoration-white">Disekitarmu.</span>
                </h1>
                <p className="text-lg opacity-90 font-medium tracking-wide text-gray-200">
                  Akses data riil persebaran gerai Indomaret & Alfamart di seluruh wilayah Pekanbaru secara akurat.
                </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENTO GRID CONTENT --- */}
      <section className="max-w-7xl mx-auto px-6 -mt-24 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* 1. FILTER PANEL (The Big Bento) */}
          <BentoCard className="md:col-span-8 flex flex-col justify-between border-t-[12px] border-t-red-600">
            <div>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-red-50 p-3 rounded-2xl text-red-600 shadow-inner"><Search size={28}/></div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Mau cari toko apa?</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Wilayah Kecamatan</label>
                    <select name="kecamatan" value={filters.kecamatan} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-sm shadow-sm appearance-none">
                      <option value="">{loading ? "Sinkronisasi..." : "Semua Wilayah"}</option>
                      {listKecamatan.map(kec => (
                        <option key={kec} value={kec}>{kec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Jenis Toko</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Indomaret', 'Alfamart'].map((brand) => (
                            <button 
                                key={brand}
                                onClick={() => setFilters(prev => ({...prev, jenis: filters.jenis === brand ? "" : brand}))}
                                className={`py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all border-2 ${filters.jenis === brand ? "bg-gray-900 border-gray-900 text-white shadow-xl" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"}`}
                            >
                                {brand.toUpperCase()}
                            </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Fasilitas Utama</label>
                    <div className="flex gap-4">
                      {["ATM", "Cafe"].map((f) => (
                        <button 
                          key={f}
                          onClick={() => setFilters(prev => ({...prev, fasilitas: filters.fasilitas === f ? "" : f}))}
                          className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-[2rem] border-2 transition-all ${filters.fasilitas === f ? "bg-red-600 border-red-600 text-white shadow-xl scale-105" : "bg-white border-gray-100 text-gray-400"}`}
                        >
                          {f === "ATM" ? <CreditCard size={24}/> : <Coffee size={24}/>}
                          <span className="text-[10px] font-black uppercase tracking-widest">{f}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Waktu Buka</label>
                    <select name="jam" value={filters.jam} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-[1.5rem] outline-none font-bold text-sm shadow-sm">
                      <option value="">Semua Jam</option>
                      <option value="24">Khusus 24 Jam</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSearch} className="mt-12 w-full bg-red-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-black transition-all shadow-2xl shadow-red-200 active:scale-[0.97] flex items-center justify-center gap-3">
              <MapPin size={20}/> Tampilkan di Peta
            </button>
          </BentoCard>

          {/* 2. SECONDARY BENTO (Vertical) */}
          <div className="md:col-span-4 flex flex-col gap-8">
            <NavLink to="/peta" className="group flex-1 bg-red-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl transition-all hover:rotate-1">
               <Map className="absolute -right-6 -bottom-6 w-40 h-40 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
               <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-none">Interactive <br /> Mapping</h3>
               <p className="text-sm opacity-60 leading-relaxed font-medium max-w-[80%]">Visualisasi data persebaran gerai secara real-time di peta interaktif.</p>
               <div className="mt-8 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-red-500">
                  Go to Maps <ChevronRight size={14}/>
               </div>
            </NavLink>

            <BentoCard className="bg-yellow-400 border-none flex flex-col items-center justify-center text-center p-10">
               <TrendingUp className="text-yellow-900 mb-4" size={40} strokeWidth={3}/>
               <h4 className="font-black text-yellow-900 uppercase text-lg tracking-tighter leading-none">Akurasi <br /> Data 99%</h4>
            </BentoCard>
          </div>

          {/* 3. STATS GRID (Riil dari Supabase) */}
          <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {loading ? (
                <div className="col-span-full py-10 flex justify-center"><Loader2 className="animate-spin text-red-600" size={32}/></div>
            ) : (
                <>
                <StatCard label="Indomaret" val={stats.indomaret} sub="Unit Gerai" col="text-blue-600" />
                <StatCard label="Alfamart" val={stats.alfamart} sub="Unit Gerai" col="text-red-600" />
                <StatCard label="ATM Center" val={stats.atm} sub="Titik Tersedia" col="text-emerald-600" />
                <StatCard label="Wilayah" val={stats.kecamatan} sub="Kecamatan" col="text-orange-500" />
                </>
            )}
          </div>

          {/* 4. CALL TO ACTION BENTO */}
          <BentoCard className="md:col-span-12 bg-white border-2 border-dashed border-gray-200 flex flex-col md:flex-row items-center justify-between gap-8 py-10">
             <div className="flex items-center gap-6">
                <div className="bg-gray-100 p-5 rounded-[2rem] text-gray-900"><Info size={32}/></div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Miliki informasi lokasi yang salah?</h3>
                  <p className="text-gray-400 text-sm font-medium italic">Laporkan kepada tim admin kami untuk sinkronisasi ulang data peta.</p>
                </div>
             </div>
             <NavLink to="/kontak" className="w-full md:w-auto bg-gray-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 transition-all text-center">
                Hubungi Admin
             </NavLink>
          </BentoCard>

        </div>
      </section>


    </div>
  );
}

// Komponen Pembantu untuk Statistik
function StatCard({ label, val, sub, col }) {
  return (
    <BentoCard className="flex flex-col items-center justify-center text-center group">
      <div className={`${col} bg-current/5 p-4 rounded-3xl mb-4 group-hover:scale-110 transition-transform`}>
        <Store size={28} className={col} />
      </div>
      <h5 className={`text-4xl font-black ${col} tracking-tighter`}>{val}</h5>
      <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mt-1">{sub}</p>
      <span className="text-[12px] font-bold text-gray-800 mt-2 uppercase italic">{label}</span>
    </BentoCard>
  );
}