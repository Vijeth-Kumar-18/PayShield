"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, ShieldAlert, Crosshair, Cpu, Bug, Network, ShieldCheck, 
  Map, TerminalSquare, AlertTriangle, Fingerprint, DatabaseZap, LockOpen
} from "lucide-react";
import { logoutAction } from "./actions";
import { useRouter, useParams } from "next/navigation";

// Mock data generation for our ultra-dashboard
const generateMockLogs = () => Array.from({ length: 6 }).map((_, i) => ({
  id: Date.now() - i * 14201,
  ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  type: ["SQLi", "XSS", "Brute Force", "DDoS", "Command Injection", "Directory Traversal", "CSRF"][Math.floor(Math.random() * 7)],
  status: ["BLOCKED", "HONEYPOT_TRAPPED", "LOGGED", "NULLROUTED"][Math.floor(Math.random() * 4)],
  time: new Date(Date.now() - i * 14201).toLocaleTimeString(),
  severity: ["CRITICAL", "HIGH", "MEDIUM", "LOW"][Math.floor(Math.random() * 4)]
}));

const CardGlow = ({ children, delay = 0, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, type: "spring", stiffness: 80 }}
    className={`relative group bg-black border border-green-500/20 backdrop-blur-md rounded-xl p-6 overflow-hidden ${className}`}
  >
    {/* Grid background styling inside card */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />
    {/* Animated glow on hover */}
    <div className="absolute -inset-2 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 opacity-0 group-hover:opacity-100 blur-[20px] transition-all duration-500 group-hover:scale-110" />
    
    <div className="relative z-10">
      {children}
    </div>
  </motion.div>
);

export default function ThreatDashboard() {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || "en";
  const [logs, setLogs] = useState([]);
  const [honeypots, setHoneypots] = useState(24);
  const [activeThreats, setActiveThreats] = useState(8);
  const [blockedToday, setBlockedToday] = useState(1337);

  useEffect(() => {
    // Initial fetch
    setLogs(generateMockLogs());

    // Setup an interval to "simulate" live incoming threats
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLog = {
           id: Date.now(),
           ip: `10.50.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
           type: ["HoneyPot Probe", "Port Scan", "Credential Stuffing", "RCE Attempt"][Math.floor(Math.random() * 4)],
           status: ["HONEYPOT_TRAPPED", "BLOCKED"][Math.floor(Math.random() * 2)],
           time: new Date().toLocaleTimeString(),
           severity: ["CRITICAL", "HIGH", "HIGH", "MEDIUM"][Math.floor(Math.random() * 4)]
        };
        setActiveThreats(prevAct => Math.max(0, prevAct + (Math.random() > 0.5 ? 1 : -1)));
        setHoneypots(prevHp => prevHp + (Math.random() > 0.8 ? 1 : 0));
        setBlockedToday(prevBT => prevBT + 1);
        
        return [newLog, ...prev.slice(0, 5)]; // keep only standard len
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    router.push(`/${lang}/threat/login`);
  };

  const severityColor = (sev) => {
    switch(sev) {
      case "CRITICAL": return "text-red-500";
      case "HIGH": return "text-orange-500";
      case "MEDIUM": return "text-yellow-500";
      default: return "text-green-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-green-500 font-mono p-4 lg:p-8 flex flex-col gap-6 relative">
      {/* Background Matrix/Hex pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
              <polygon points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2" fill="none" stroke="currentColor" strokeWidth="1"/>
              <polygon points="49.8,7.5 62.3,14.7 62.3,29.2 49.8,36.4 37.3,29.2 37.3,14.7" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)"/>
        </svg>
      </div>

      {/* HEADER */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-green-500/20 pb-6 z-10 glass-panel"
      >
        <div className="flex items-center gap-4">
          <div className="relative group">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-12 h-12 rounded-full border-2 border-dashed border-green-500/70 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.4)]">
              <ShieldCheck className="w-8 h-8 text-green-400 animate-pulse" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]">PayShield <span className="text-sm border ml-2 border-green-500/40 text-green-400 bg-green-500/10 px-2 py-1 rounded">SOC_LEVEL_1</span></h1>
            <p className="text-xs text-green-400/80 tracking-[0.2em] mt-1">GLOBAL THREAT INTELLIGENCE DASHBOARD</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
             <span className="text-[10px] tracking-widest text-green-500/50 uppercase">Network Status</span>
             <span className="text-sm font-bold text-green-400 tracking-widest flex items-center gap-2">SECURE <Activity className="w-4 h-4 shadow-[0_0_20px_rgba(0,255,0,0.5)]"/></span>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-950/30 border border-red-500/40 text-red-500 font-bold uppercase tracking-widest text-xs rounded hover:bg-red-500 hover:text-black transition-all shadow-[0_0_15px_rgba(255,0,0,0.2)]">DISCONNECT</button>
        </div>
      </motion.header>

      {/* DASH GRID TOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10">
        <CardGlow delay={0.1}>
          <div className="flex justify-between items-start mb-4">
            <div className="text-green-500/60 uppercase tracking-widest text-xs font-bold">Total Blocked</div>
            <ShieldAlert className="w-5 h-5 text-red-500 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]" />
          </div>
          <div className="text-5xl font-black tracking-tight text-white mb-1"><AnimatePresence>{blockedToday}</AnimatePresence></div>
          <div className="flex items-center gap-2 text-xs text-green-500/70">
            <span className="text-green-400 bg-green-500/20 px-1 py-0.5 rounded font-bold">+12%</span>
            <span>last 24 hours</span>
          </div>
        </CardGlow>
        
        <CardGlow delay={0.2}>
          <div className="flex justify-between items-start mb-4">
            <div className="text-green-500/60 uppercase tracking-widest text-xs font-bold">Active Honeypots</div>
            <Crosshair className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]" />
          </div>
          <div className="text-5xl font-black tracking-tight text-white mb-1">{honeypots}</div>
          <div className="flex items-center gap-2 text-xs text-green-500/70">
             <span className="animate-pulse bg-green-500/10 border border-green-500/40 text-green-400 px-1 py-0.5 rounded">ONLINE</span>
             <span>Distributed via multi-cloud</span>
          </div>
        </CardGlow>
        
        <CardGlow delay={0.3}>
          <div className="flex justify-between items-start mb-4">
            <div className="text-green-500/60 uppercase tracking-widest text-xs font-bold">Suspicious Behaviors</div>
            <Activity className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_5px_rgba(255,200,0,0.5)]" />
          </div>
          <div className="text-5xl font-black tracking-tight text-white mb-1">{activeThreats}</div>
          <div className="flex items-center gap-2 text-xs text-green-500/70">
             <span>Live tracking by AI models</span>
          </div>
          {/* Sparkline mock */}
          <div className="absolute bottom-0 left-0 w-full h-8 opacity-40">
             <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full stroke-yellow-500 fill-none stroke-[2px]">
               <motion.path 
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 2, ease: "easeInOut" }}
                 d="M0,10 L10,15 L20,8 L30,12 L40,5 L50,18 L60,10 L70,14 L80,2 L90,16 L100,5" 
               />
             </svg>
          </div>
        </CardGlow>

        <CardGlow delay={0.4}>
          <div className="flex justify-between items-start mb-4">
            <div className="text-green-500/60 uppercase tracking-widest text-xs font-bold">System Load</div>
            <Cpu className="w-5 h-5 text-blue-400 drop-shadow-[0_0_5px_rgba(0,100,255,0.5)]" />
          </div>
          <div className="text-5xl font-black tracking-tight text-white mb-1"><motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>12</motion.span>%</div>
          <div className="flex items-center gap-2 text-xs text-green-500/70">
             <span className="w-full h-1 bg-green-950 rounded-full mt-2 relative overflow-hidden"><span className="absolute left-0 top-0 h-full w-[12%] bg-blue-500 shadow-[0_0_10px_rgba(0,100,255,1)]"></span></span>
          </div>
        </CardGlow>
      </div>

      {/* MID SECTION - MAP & HONEYPOT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 flex-1 min-h-[400px]">
        
        {/* Radar Map Placeholder */}
        <CardGlow delay={0.5} className="lg:col-span-2 flex flex-col min-h-[350px]">
           <div className="flex items-center gap-3 mb-6">
              <Map className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold tracking-widest uppercase text-white shadow-[0_0_10px_rgba(0,255,0,0.5)]">Global Threat Vectors</h2>
           </div>
           <div className="relative flex-1 min-h-[250px] rounded border border-green-500/30 bg-black/50 overflow-hidden flex items-center justify-center -m-1">
               {/* Radar scan simulation */}
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute w-[40rem] h-[40rem] rounded-full border border-green-500/10 bg-[conic-gradient(from_0deg,transparent_0%,rgba(0,255,0,0.2)_10%,transparent_10%)] mix-blend-screen" />
               <motion.div className="absolute w-2 h-2 bg-red-500 rounded-full shadow-[0_0_15px_rgba(255,0,0,1)]" animate={{ opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ top: '30%', left: '40%' }} />
               <motion.div className="absolute w-2 h-2 bg-red-500 rounded-full shadow-[0_0_15px_rgba(255,0,0,1)]" animate={{ opacity: [1, 0], scale: [1, 3] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} style={{ top: '60%', left: '70%' }} />
               <motion.div className="absolute w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(255,150,0,1)]" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} style={{ top: '20%', left: '80%' }} />
               
               {/* Grid concentric circles */}
               <div className="absolute w-[100%] h-[100%] rounded-full border border-green-500/10 scale-50" />
               <div className="absolute w-[100%] h-[100%] rounded-full border border-green-500/10 scale-75" />
               <div className="absolute w-[100%] h-[100%] rounded-full border border-green-500/20" />
               
               <div className="z-10 text-center pointer-events-none mix-blend-overlay">
                  <div className="text-4xl font-black text-green-500 opacity-20 tracking-[0.5em]">T H R E A T _ I N T E L</div>
               </div>
           </div>
        </CardGlow>

        {/* Live Attack Feed */}
        <CardGlow delay={0.6} className="flex flex-col min-h-[350px]"> 
          <div className="flex items-center justify-between mb-6 border-b border-green-500/20 pb-4">
             <div className="flex items-center gap-3">
                <TerminalSquare className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-bold tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">Live Feed</h2>
             </div>
             <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto relative max-h-[400px]">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10 pointer-events-none" />
             <div className="flex flex-col gap-3">
               <AnimatePresence>
                 {logs.map((log) => (
                   <motion.div
                     key={log.id}
                     initial={{ opacity: 0, x: -20, height: 0 }}
                     animate={{ opacity: 1, x: 0, height: "auto" }}
                     exit={{ opacity: 0, x: 20 }}
                     className="bg-green-950/20 border-l-[3px] border-green-500 p-3 rounded-sm relative group hover:bg-green-900/30 transition-colors"
                     style={{ borderLeftColor: log.severity === 'CRITICAL' ? 'rgb(239, 68, 68)' : log.severity === 'HIGH' ? 'rgb(249, 115, 22)' : 'rgb(34, 197, 94)' }}
                   >
                     {log.status === "HONEYPOT_TRAPPED" && <div className="absolute -inset-0.5 bg-yellow-500/10 blur animate-pulse" />}
                     <div className="flex justify-between items-start mb-1 text-[10px] tracking-widest">
                       <span className="text-green-500/60 font-bold">{log.time}</span>
                       <span className={`font-black ${severityColor(log.severity)} flex px-1 py-0.5 rounded bg-black/50 border border-current`}>{log.status}</span>
                     </div>
                     <div className="font-bold text-sm text-white drop-shadow-md flex justify-between items-center mt-2">
                       <span className="truncate pr-2 tracking-wide group-hover:text-green-400 transition-colors uppercase flex items-center gap-2">
                           <Bug className="w-3 h-3"/> {log.type}
                       </span>
                       <span className="text-xs text-green-300 font-mono tracking-tighter bg-black/60 px-1 border border-green-500/20 rounded shadow-[0_0_10px_rgba(0,255,0,0.1)]">{log.ip}</span>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          </div>
        </CardGlow>
      </div>
    </div>
  );
}