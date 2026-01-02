import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Lock, Mail, ArrowRight, Loader2, ChevronLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Header Simpel */}
        <div className="mb-10">
          <NavLink to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors mb-8 group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Kembali</span>
          </NavLink>
          
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
            Login <br /> <span className="text-red-600">Admin.</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-medium">Masuk untuk mengelola data toko.</p>
        </div>

        {/* Pesan Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 uppercase tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Input Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl px-5 py-4 outline-none transition-all font-bold text-sm"
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute right-5 top-4 text-gray-300" size={20} />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                className="w-full bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl px-5 py-4 outline-none transition-all font-bold text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute right-5 top-4 text-gray-300" size={20} />
            </div>
          </div>

          {/* Button Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8 disabled:bg-gray-200 disabled:shadow-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>Masuk Sekarang <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <footer className="mt-16 text-center border-t border-gray-100 pt-8">
          <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.5em]">
            Authorized Personnel Only
          </p>
        </footer>
      </div>
    </div>
  );
}