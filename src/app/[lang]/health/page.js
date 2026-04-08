'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SERVICES = [
  { id: 'api',      icon: '⚡', name: 'PayShield API Gateway',     status: 'operational', uptime: '99.98%', latency: '42ms',  desc: 'Core payment processing engine' },
  { id: 'ai',       icon: '🤖', name: 'AI Anomaly Detection',       status: 'operational', uptime: '99.95%', latency: '88ms',  desc: 'Isolation Forest ML monitor' },
  { id: 'auth',     icon: '🔐', name: 'Authentication Service',     status: 'operational', uptime: '100%',   latency: '31ms',  desc: 'Device DNA & RSA challenge-response' },
  { id: 'encrypt',  icon: '🔒', name: 'AES-256 Encryption Layer',   status: 'operational', uptime: '100%',   latency: '12ms',  desc: 'End-to-end payment encryption' },
  { id: 'geo',      icon: '🌍', name: 'Geo-Auth Service',           status: 'operational', uptime: '99.91%', latency: '65ms',  desc: 'IP & location risk authentication' },
  { id: 'honeypot', icon: '🍯', name: 'Honeypot / Mirror Maze',     status: 'operational', uptime: '99.99%', latency: '—',     desc: 'Decoy account threat trapping' },
  { id: 'db',       icon: '🗄️', name: 'PostgreSQL / Neon DB',       status: 'operational', uptime: '99.97%', latency: '18ms',  desc: 'Encrypted user data storage' },
  { id: 'notif',    icon: '🔔', name: 'Notification Service',       status: 'degraded',    uptime: '98.20%', latency: '210ms', desc: 'Push alerts & security notifications' },
  { id: 'blockchain', icon: '⛓️', name: 'Ethereum Smart Contracts', status: 'operational', uptime: '99.85%', latency: '120ms', desc: 'Immutable honeypot transaction logs' },
  { id: 'tls',      icon: '🛡️', name: 'TLS Communication Layer',   status: 'operational', uptime: '100%',   latency: '8ms',   desc: 'Secure channel encryption' },
];

const INCIDENTS = [
  { date: 'Mar 19, 2026', title: 'Notification Service Latency Spike', status: 'monitoring', color: '#f59e0b', desc: 'Increased delivery times detected. Team investigating.' },
  { date: 'Mar 15, 2026', title: 'Scheduled Maintenance — Neon DB',    status: 'resolved',   color: '#10b981', desc: 'Planned 10-minute maintenance window completed successfully.' },
  { date: 'Mar 10, 2026', title: 'Geo-Auth False Positive Rate',       status: 'resolved',   color: '#10b981', desc: 'Tuned geo-blocking thresholds. False positive rate reduced by 34%.' },
];

const STATUS_META = {
  operational: { label: 'Operational', color: '#10b981', bg: '#dcfce7', dot: '#22c55e' },
  degraded:    { label: 'Degraded',    color: '#b45309', bg: '#fef3c7', dot: '#f59e0b' },
  outage:      { label: 'Outage',      color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
};

// Simulate live latency ticking
function useLiveLatency(base) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    if (base === '—') return;
    const n = parseInt(base);
    const t = setInterval(() => {
      setVal((n + Math.floor(Math.random() * 20 - 10)) + 'ms');
    }, 2000);
    return () => clearInterval(t);
  }, [base]);
  return val;
}

function ServiceRow({ s }) {
  const liveLatency = useLiveLatency(s.latency);
  const m = STATUS_META[s.status];
  return (
    <div className="hm-row">
      <div className="hm-row-icon">{s.icon}</div>
      <div className="hm-row-info">
        <p className="hm-row-name">{s.name}</p>
        <p className="hm-row-desc">{s.desc}</p>
      </div>
      <div className="hm-row-uptime">
        <p className="hm-row-up-val">{s.uptime}</p>
        <p className="hm-row-up-label">Uptime</p>
      </div>
      <div className="hm-row-latency">
        <p className="hm-row-lat-val">{liveLatency}</p>
        <p className="hm-row-lat-label">Latency</p>
      </div>
      <div className="hm-status-pill" style={{ background: m.bg, color: m.color }}>
        <span className="hm-status-dot" style={{ background: m.dot }}/>
        {m.label}
      </div>
    </div>
  );
}

export default function HealthMonitor() {
  const operational = SERVICES.filter(s => s.status === 'operational').length;
  const degraded    = SERVICES.filter(s => s.status === 'degraded').length;
  const outage      = SERVICES.filter(s => s.status === 'outage').length;
  const overall     = outage > 0 ? 'outage' : degraded > 0 ? 'degraded' : 'operational';
  const om = STATUS_META[overall];

  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(v => v+1), 5000); return () => clearInterval(t); }, []);

  return (
    <>
      <style>{`
        .hm-page { min-height:100vh;background:#f1f5f9;font-family:'Segoe UI',sans-serif; }

        .hm-topbar {
          background:#fff;border-bottom:1px solid #e2e8f0;padding:18px 32px;
          display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;
        }
        .hm-topbar-left { display:flex;align-items:center;gap:14px; }
        .hm-back {
          width:38px;height:38px;border-radius:10px;border:1px solid #e2e8f0;
          background:#f8fafc;display:flex;align-items:center;justify-content:center;
          text-decoration:none;font-size:18px;color:#1e293b;transition:all 0.2s;
        }
        .hm-back:hover { background:#eff6ff;border-color:#bfdbfe; }
        .hm-topbar h1 { font-size:20px;font-weight:700;color:#0f172a;margin:0; }
        .hm-topbar p  { font-size:13px;color:#64748b;margin:0; }
        .hm-live {
          background:#dcfce7;color:#15803d;font-size:12px;font-weight:700;
          padding:6px 14px;border-radius:20px;display:flex;align-items:center;gap:6px;
        }
        .hm-live-dot { width:7px;height:7px;background:#22c55e;border-radius:50%;animation:hmpulse 1.5s infinite; }
        @keyframes hmpulse { 0%,100%{opacity:1}50%{opacity:.3} }

        .hm-body { max-width:900px;margin:0 auto;padding:28px 20px;display:flex;flex-direction:column;gap:22px; }

        /* Overall status banner */
        .hm-banner {
          border-radius:18px;padding:24px 28px;display:flex;align-items:center;gap:18px;
          box-shadow:0 6px 24px rgba(0,0,0,.08);
        }
        .hm-banner-icon { font-size:44px;flex-shrink:0; }
        .hm-banner-title { font-size:20px;font-weight:800;margin:0 0 4px; }
        .hm-banner-sub   { font-size:14px;opacity:.85;margin:0; }
        .hm-banner-time  { margin-left:auto;font-size:13px;opacity:.75;white-space:nowrap; }

        /* Stats row */
        .hm-stats { display:grid;grid-template-columns:repeat(3,1fr);gap:14px; }
        .hm-stat-card {
          background:#fff;border-radius:14px;padding:18px;border:1px solid #f1f5f9;
          box-shadow:0 1px 3px rgba(0,0,0,.04);text-align:center;
        }
        .hm-stat-val   { font-size:32px;font-weight:800;color:#0f172a; }
        .hm-stat-label { font-size:13px;color:#64748b;margin-top:4px; }

        /* Services card */
        .hm-card { background:#fff;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 1px 4px rgba(0,0,0,.05);overflow:hidden; }
        .hm-card-header {
          padding:16px 22px;border-bottom:1px solid #f8fafc;
          display:flex;justify-content:space-between;align-items:center;
        }
        .hm-card-header h3 { font-size:15px;font-weight:700;color:#0f172a;margin:0; }
        .hm-card-header p  { font-size:13px;color:#64748b;margin:0; }

        .hm-row {
          display:flex;align-items:center;gap:14px;padding:14px 22px;
          border-bottom:1px solid #f8fafc;transition:background .15s;
        }
        .hm-row:last-child { border-bottom:none; }
        .hm-row:hover { background:#fafbff; }
        .hm-row-icon {
          width:40px;height:40px;border-radius:10px;background:#f1f5f9;
          display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;
        }
        .hm-row-info { flex:1;min-width:0; }
        .hm-row-name { font-size:14px;font-weight:600;color:#0f172a; }
        .hm-row-desc { font-size:12px;color:#94a3b8;margin-top:1px; }
        .hm-row-uptime,.hm-row-latency { text-align:center;min-width:64px; }
        .hm-row-up-val,.hm-row-lat-val { font-size:14px;font-weight:700;color:#0f172a; }
        .hm-row-up-label,.hm-row-lat-label { font-size:11px;color:#94a3b8; }
        .hm-status-pill {
          font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px;
          display:flex;align-items:center;gap:5px;flex-shrink:0;white-space:nowrap;
        }
        .hm-status-dot { width:7px;height:7px;border-radius:50%;flex-shrink:0; }

        /* Incidents */
        .hm-incident {
          display:flex;align-items:flex-start;gap:14px;padding:14px 22px;
          border-bottom:1px solid #f8fafc;
        }
        .hm-incident:last-child { border-bottom:none; }
        .hm-inc-dot { width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:5px; }
        .hm-inc-info { flex:1; }
        .hm-inc-title { font-size:14px;font-weight:600;color:#0f172a;margin-bottom:3px; }
        .hm-inc-desc  { font-size:13px;color:#64748b;margin-bottom:4px;line-height:1.5; }
        .hm-inc-date  { font-size:12px;color:#94a3b8; }
        .hm-inc-badge {
          font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;flex-shrink:0;
        }

        @media(max-width:700px){
          .hm-topbar{padding:14px 16px;}
          .hm-body{padding:16px 12px;}
          .hm-stats{grid-template-columns:repeat(3,1fr);gap:8px;}
          .hm-row-uptime,.hm-row-latency{display:none;}
          .hm-banner-time{display:none;}
        }
      `}</style>

      <div className="hm-page">
        <header className="hm-topbar">
          <div className="hm-topbar-left">
            <Link href="/dashboard" className="hm-back">←</Link>
            <div>
              <h1>System Health Monitor</h1>
              <p>Real-time status of all PayShield services</p>
            </div>
          </div>
          <div className="hm-live">
            <span className="hm-live-dot"/>
            Live · Updates every 5s
          </div>
        </header>

        <div className="hm-body">
          {/* Overall banner */}
          <div className="hm-banner" style={{ background: `linear-gradient(135deg, ${om.color}22, ${om.color}11)`, border: `1.5px solid ${om.color}44`, color: om.color }}>
            <span className="hm-banner-icon">{overall === 'operational' ? '✅' : overall === 'degraded' ? '⚠️' : '🔴'}</span>
            <div>
              <p className="hm-banner-title">
                {overall === 'operational' ? 'All Systems Operational' : overall === 'degraded' ? 'Partial Degradation' : 'Service Outage'}
              </p>
              <p className="hm-banner-sub">
                {operational} of {SERVICES.length} services running normally
                {degraded > 0 && ` · ${degraded} degraded`}
              </p>
            </div>
            <span className="hm-banner-time">Last checked: {new Date().toLocaleTimeString()}</span>
          </div>

          {/* Stats */}
          <div className="hm-stats">
            <div className="hm-stat-card">
              <p className="hm-stat-val" style={{ color:'#10b981' }}>{operational}</p>
              <p className="hm-stat-label">✅ Operational</p>
            </div>
            <div className="hm-stat-card">
              <p className="hm-stat-val" style={{ color:'#f59e0b' }}>{degraded}</p>
              <p className="hm-stat-label">⚠️ Degraded</p>
            </div>
            <div className="hm-stat-card">
              <p className="hm-stat-val" style={{ color:'#ef4444' }}>{outage}</p>
              <p className="hm-stat-label">🔴 Outage</p>
            </div>
          </div>

          {/* Services list */}
          <div className="hm-card">
            <div className="hm-card-header">
              <h3>🖥️ Service Status</h3>
              <p>All {SERVICES.length} PayShield components</p>
            </div>
            {SERVICES.map(s => <ServiceRow key={s.id} s={s} />)}
          </div>

          {/* Incidents */}
          <div className="hm-card">
            <div className="hm-card-header">
              <h3>📋 Recent Incidents</h3>
              <p>Last 30 days</p>
            </div>
            {INCIDENTS.map((inc, i) => (
              <div className="hm-incident" key={i}>
                <span className="hm-inc-dot" style={{ background: inc.color }}/>
                <div className="hm-inc-info">
                  <p className="hm-inc-title">{inc.title}</p>
                  <p className="hm-inc-desc">{inc.desc}</p>
                  <p className="hm-inc-date">📅 {inc.date}</p>
                </div>
                <span
                  className="hm-inc-badge"
                  style={{ background: inc.color + '22', color: inc.color }}
                >
                  {inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}