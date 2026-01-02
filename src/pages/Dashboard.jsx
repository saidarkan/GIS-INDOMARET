import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { 
  Store, CreditCard, TrendingUp, MapPin, 
  Layers, Navigation, PieChart, Activity 
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    total: 0, indo: 0, alfa: 0, atm: 0, 
    topKecamatan: [], 
    percentAtm: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data } = await supabase.from("peta").select("*");
    if (data) {
      // Hitung Frekuensi Kecamatan
      const kecCount = data.reduce((acc, curr) => {
        acc[curr.kecamatan] = (acc[curr.kecamatan] || 0) + 1;
        return acc;
      }, {});

      // Urutkan Kecamatan Terpadat
      const sortedKec = Object.entries(kecCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const totalStore = data.length;
      const atmCount = data.filter(s => s.fasilitas?.toLowerCase().includes("atm")).length;

      setStats({
        total: totalStore,
        indo: data.filter(s => s.nama_toko.toLowerCase().includes("indomaret")).length,
        alfa: data.filter(s => s.nama_toko.toLowerCase().includes("alfamart")).length,
        atm: atmCount,
        topKecamatan: sortedKec,
        percentAtm: totalStore > 0 ? ((atmCount / totalStore) * 100).toFixed(1) : 0
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Overview.</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Geospasial Analysis Pekanbaru</p>
        </div>
      
      </header>

      {/* STAT CARDS MAIN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Gerai" val={stats.total} icon={<Store/>} col="text-gray-900" bg="bg-gray-100" />
        <StatCard label="Indomaret" val={stats.indo} icon={<Layers/>} col="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Alfamart" val={stats.alfa} icon={<Navigation/>} col="text-red-600" bg="bg-red-50" />
        <StatCard label="ATM Center" val={stats.atm} icon={<CreditCard/>} col="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* SECONDARY INFO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KECAMATAN TERPADAT */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-900 rounded-xl text-white"><MapPin size={18}/></div>
            <h3 className="font-black uppercase italic tracking-tighter">Wilayah Terpadat</h3>
          </div>
          <div className="space-y-4">
            {stats.topKecamatan.map(([name, count], i) => (
              <div key={name} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-gray-300">0{i+1}</span>
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">{name}</span>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-[60%] mx-4">
                  <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-900 rounded-full transition-all duration-1000" 
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        

        {/* FASILITAS ANALYTICS */}
        <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
          <PieChart size={120} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
          <div>
            <h3 className="text-lg font-black uppercase italic tracking-tighter mb-1">Fasilitas ATM</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Coverage Ratio</p>
          </div>
          <div className="mt-8">
            <h2 className="text-6xl font-black tracking-tighter">{stats.percentAtm}%</h2>
            <p className="text-white/50 text-xs mt-2 font-medium">Gerai di Pekanbaru memiliki fasilitas transaksi mandiri.</p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
        
          </div>
        </div>

      </div>

 
    </div>
  );
}

function StatCard({ label, val, icon, col, bg }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-red-600 transition-all duration-300">
      <div className={`${bg} ${col} w-fit p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>{icon}</div>
      <h4 className={`text-4xl font-black ${col} tracking-tighter`}>{val}</h4>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">{label}</p>
    </div>
  );
}