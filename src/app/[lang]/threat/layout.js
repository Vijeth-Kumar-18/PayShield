import React from 'react';

export default function ThreatLayout({ children }) {
  // Ultra-hacker dark themed global layout - covers full viewport, overrides parent nav
  return (
    <div className="fixed inset-0 bg-black text-green-500 font-mono overflow-auto z-[100]">
      {/* Background vignette - decorative edge-darkening, below content */}
      <div className="pointer-events-none fixed inset-0 z-[101] bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]"></div>

      {/* CRT scanline effect overlay - topmost decorative layer, uses blend so content still visible */}
      <div className="pointer-events-none fixed inset-0 z-[102] mix-blend-overlay opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>

      <main className="relative z-[103] w-full min-h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
