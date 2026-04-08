"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldAlert, Fingerprint, TerminalSquare, AlertTriangle } from "lucide-react";
import { loginAction } from "../actions";
import { useRouter, useParams } from "next/navigation";

export default function ThreatLogin() {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || "en";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Server action form simulation
    const formData = new FormData();
    formData.append("accessCode", code);
    
    try {
      const res = await loginAction(formData);
      if (res.success) {
        router.push(`/${lang}/threat`);
      } else {
        setLoading(false);
        setError(res.error);
        setCode("");
      }
    } catch (err) {
      setLoading(false);
      setError("SYSTEM FAILURE");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black p-4 font-mono overflow-hidden">
      {/* Background Matrix-like glow effect */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10">
        <motion.div
           animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="w-[800px] h-[800px] rounded-full border-[1px] border-green-500/30 border-dashed"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="z-10 relative flex w-full max-w-lg flex-col border border-green-500/40 bg-black/60 p-8 shadow-[0_0_60px_-15px_rgba(0,255,0,0.3)] backdrop-blur-md rounded-xl"
      >
        <div className="absolute -top-[1.2rem] left-1/2 -translate-x-1/2 bg-black px-4 text-xs font-bold tracking-widest text-green-500 shadow-[0_0_20px_rgba(0,255,0,0.5)] border border-green-500/50 rounded flex items-center gap-2 py-1">
          <TerminalSquare className="w-3 h-3" />
          SYSTEM_ACCESS
        </div>

        <div className="mb-10 text-center">
          <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/50 shadow-[0_0_30px_rgba(0,255,0,0.4)]"
          >
            <ShieldAlert className="h-10 w-10 text-green-400" />
          </motion.div>
          <h2 className="text-3xl font-black tracking-widest text-white shadow-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
            SECURE.GRID
          </h2>
          <p className="mt-2 text-sm text-green-500/70 tracking-widest">
            AUTHENTICATION PROTOCOL v9.0
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <div className="flex justify-between items-center text-xs mb-2 text-green-400 font-semibold tracking-[0.2em] px-1 uppercase">
              <span>Access Code</span>
              <span className="text-green-500/50">ENCRYPTED_ENTRY</span>
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500/70" />
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-md border border-green-500/30 bg-green-950/10 py-4 pl-12 pr-4 text-green-400 shadow-[inset_0_0_15px_rgba(0,255,0,0.05)] outline-none transition-all focus:border-green-400 focus:shadow-[0_0_25px_rgba(0,255,0,0.2)] focus:outline-none placeholder-green-800"
                placeholder="••••••••••••"
                required
                disabled={loading}
              />
              <div className="absolute top-0 right-4 h-full w-[2px] bg-green-500/30 animate-pulse mix-blend-screen opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
               <motion.div
               initial={{ opacity: 0, height: 0, y: -10 }}
               animate={{ opacity: 1, height: "auto", y: 0 }}
               exit={{ opacity: 0, height: 0, y: -10 }}
               className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-950/20 border border-red-500/40 p-3 rounded shadow-[0_0_15px_rgba(255,0,0,0.3)] animate-pulse"
             >
               <AlertTriangle className="w-5 h-5" />
               <span className="tracking-widest">{error}</span>
             </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="group relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-md border border-green-500 bg-green-500/10 py-4 font-bold tracking-[0.3em] text-green-400 shadow-[0_0_15px_rgba(0,255,0,0.2)] transition-all hover:bg-green-500 hover:text-black hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Fingerprint className="h-5 w-5" />
                </motion.div>
                DECRYPTING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                 INITIATE <Lock className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:block transition-all"/>
              </span>
            )}
          </button>

          <p className="mt-6 text-center text-[10px] text-green-600/50 uppercase tracking-[0.2em]">
             Unauthorized access attempts are monitored & recorded. <br/>
             Hint: use <span className="underline decoration-dashed decoration-red-500">neo123</span> for access.
          </p>
        </form>
      </motion.div>
    </div>
  );
}