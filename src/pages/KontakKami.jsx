import React from "react";
import { 
  Mail, Phone, MapPin, Instagram, 
  Globe, MessageCircle, Send, Clock 
} from "lucide-react";

export default function KontakKami() {
  const handleContactAction = (type) => {
    const actions = {
      email: "mailto:support@pekanbaru-stores.com",
      wa: "https://wa.me/6281234567890",
      ig: "https://instagram.com/pekanbaru.stores"
    };
    window.open(actions[type], "_blank");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-25 px-10">
      {/* HEADER SECTION */}
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
          Contact Support.
        </h1>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">
          Bantuan teknis & pelaporan data geospasial
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: FORMULIR PESAN */}
        <div className="lg:col-span-7 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-100">
              <Send size={20} />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Kirim Tiket Bantuan</h3>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input type="text" placeholder="Admin Name" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Karyawan</label>
                <input type="text" placeholder="ADM-001" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subjek Laporan</label>
              <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm transition-all appearance-none">
                <option>Masalah Sinkronisasi Peta</option>
                <option>Kesalahan Data Gerai</option>
                <option>Bug Sistem Dashboard</option>
                <option>Lainnya</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Detail Pesan</label>
              <textarea rows="4" placeholder="Jelaskan kendala Anda..." className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm transition-all resize-none"></textarea>
            </div>

            <button className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
              Kirim Laporan Sekarang
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: INFO KONTAK & SOSMED */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CARD INFO CEPAT */}
          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
            
            <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6 relative z-10">Hubungi Kami Langsung</h3>
            
            <div className="space-y-6 relative z-10">
              <ContactLink icon={<Mail size={18}/>} label="Email Support" val="support@pkustores.id" onClick={() => handleContactAction('email')} />
              <ContactLink icon={<MessageCircle size={18}/>} label="WhatsApp Business" val="+62 812-3456-7890" onClick={() => handleContactAction('wa')} />
              <ContactLink icon={<Instagram size={18}/>} label="Instagram" val="@pekanbaru.stores" onClick={() => handleContactAction('ig')} />
            </div>
          </div>

          {/* CARD LOKASI KANTOR */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="text-red-600" size={20} />
              <h3 className="font-black uppercase italic tracking-tighter">Kantor Pusat</h3>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Jl. Jenderal Sudirman No. 123,<br />
              Kec. Pekanbaru Kota, Kota Pekanbaru,<br />
              Riau 28123, Indonesia.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center gap-3">
              <Clock size={16} className="text-gray-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jam Kerja: 08:00 - 17:00 WIB</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ContactLink({ icon, label, val, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 cursor-pointer group/link hover:translate-x-2 transition-transform"
    >
      <div className="p-3 bg-white/10 rounded-2xl group-hover/link:bg-red-600 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</p>
        <p className="font-bold text-sm">{val}</p>
      </div>
    </div>
  );
}