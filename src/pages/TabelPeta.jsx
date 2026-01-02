import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { 
  Plus, Edit, Trash2, Search, Loader2, MapPin, X,
  Image as ImageIcon, ChevronLeft, ChevronRight, 
  ChevronUp, ChevronDown, CreditCard, Car, Wifi, Coffee 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function TabelPeta() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // --- STATE UNTUK MODAL GAMBAR ---
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("Semua");
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("peta").select("*");
    if (error) console.error("Error:", error);
    else setStores(data || []);
    setLoading(false);
  };

  const handleDelete = async (id, nama) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus toko "${nama}"?`);
    if (confirmDelete) {
      try {
        const { error } = await supabase.from("peta").delete().eq("id", id);
        if (error) throw error;
        setStores(stores.filter((store) => store.id !== id));
        alert("Data berhasil dihapus!");
      } catch (error) {
        alert("Gagal menghapus data: " + error.message);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/EditData/${id}`);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    return stores
      .filter((item) => {
        const matchSearch = (item.nama_toko || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.kecamatan || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchBrand = filterBrand === "Semua" || 
                         (item.nama_toko || "").toLowerCase().includes(filterBrand.toLowerCase());
        return matchSearch && matchBrand;
      })
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [stores, searchTerm, filterBrand, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 relative">
      {/* MODAL GAMBAR (Hanya muncul jika selectedImage tidak null) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
          
          <img 
            src={selectedImage} 
            alt="Preview Besar" 
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10 object-contain animate-in zoom-in-95 duration-300"
          />
        </div>
      )}

      {/* HEADER & FILTER SECTION */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <header>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Store Data.</h1>
            <p className="text-sm text-gray-400 font-medium tracking-wide">Kelola lokasi, koordinat, dan dokumentasi toko.</p>
          </header>
          <Link 
            to="/TambahData" 
            className="bg-red-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-red-100"
          >
            <Plus size={16} /> Tambah Data
          </Link>
        </div>

        {/* TOOLBAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Cari toko atau kecamatan..."
              className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
            {['Semua', 'Indomaret', 'Alfamart'].map((brand) => (
              <button
                key={brand}
                onClick={() => { setFilterBrand(brand); setCurrentPage(1); }}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${filterBrand === brand ? "bg-white text-red-600 shadow-sm" : "text-gray-400"}`}
              >
                {brand}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 px-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tampil:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-gray-100 border-none rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} Baris</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Gambar</th>
                <SortHeader label="Nama Toko" sortKey="nama_toko" currentSort={sortConfig} onSort={requestSort} />
                <SortHeader label="Kecamatan" sortKey="kecamatan" currentSort={sortConfig} onSort={requestSort} />
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Koordinat</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center text-red-600"><Loader2 className="animate-spin inline" size={32} /></td></tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div 
                        className="w-28 h-20 rounded-[1.5rem] bg-gray-100 overflow-hidden border-2 border-gray-100 shadow-sm relative group/img cursor-zoom-in"
                        onClick={() => s.gambar_url && setSelectedImage(s.gambar_url)} // LOGIKA KLIK GAMBAR
                      >
                        {s.gambar_url ? (
                          <img src={s.gambar_url} alt={s.nama_toko} className="w-full h-full object-cover transform transition-transform duration-700 group-hover/img:scale-125" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-300"><ImageIcon size={20} /></div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-6 rounded-full ${s.nama_toko?.toLowerCase().includes('alfa') ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{s.nama_toko}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {s.fasilitas?.toLowerCase().includes("atm") && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold italic uppercase"><CreditCard size={10}/> ATM</span>
                            )}
                            {s.fasilitas?.toLowerCase().includes("parkir") && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[9px] font-bold italic uppercase"><Car size={10}/> Parkir</span>
                            )}
                            {s.fasilitas?.toLowerCase().includes("wifi") && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-bold italic uppercase"><Wifi size={10}/> Wifi</span>
                            )}
                            {s.fasilitas?.toLowerCase().includes("cafe") && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[9px] font-bold italic uppercase"><Coffee size={10}/> Cafe</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-500 font-bold uppercase tracking-tight">{s.kecamatan}</td>
                    
                    <td className="px-6 py-4 font-mono text-[15px]">
                        <span className="text-blue-600">{s.latitude}</span>, <br/>
                        <span className="text-green-600">{s.longitude}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(s.id)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-lg hover:bg-blue-50"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(s.id, s.nama_toko)} className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-lg hover:bg-red-50"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Data tidak ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} Data
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-xl hover:bg-white disabled:opacity-20 shadow-sm"><ChevronLeft size={18} /></button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => paginate(i + 1)} className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? "bg-red-600 text-white shadow-lg shadow-red-100" : "bg-white text-gray-400 hover:text-gray-800 shadow-sm"}`}>{i + 1}</button>
              ))}
            </div>
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-xl hover:bg-white disabled:opacity-20 shadow-sm"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortHeader({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort.key === sortKey;
  return (
    <th className="px-6 py-5 cursor-pointer group select-none" onClick={() => onSort(sortKey)}>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? "text-red-600" : "text-gray-400 group-hover:text-gray-600"}`}>{label}</span>
        <div className="flex flex-col opacity-30 group-hover:opacity-100">
          <ChevronUp size={10} className={isActive && currentSort.direction === 'asc' ? "text-red-600" : ""} />
          <ChevronDown size={10} className={isActive && currentSort.direction === 'desc' ? "text-red-600" : ""} />
        </div>
      </div>
    </th>
  );
}