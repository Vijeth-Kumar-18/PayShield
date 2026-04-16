'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── Sidebar nav items ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard',        href: '/dashboard',     active: false },
  { icon: '💸', label: 'Pay',              href: '/payment',       active: false },
  { icon: '📋', label: 'Transactions',     href: '/transactions',  active: false },
  { icon: '🔔', label: 'Notifications',    href: '/notifications', active: false },
  { icon: '📷', label: 'QR Payment',       href: '/qr',            active: false },
  { icon: '👤', label: 'Profile',          href: '/profile',       active: false },
  { icon: '🛡️', label: 'Security',         href: '/security',      active: false },
  { icon: '🚨', label: 'Threat Admin',     href: '/admin/threats', active: true  },
  { icon: '⚙️', label: 'Settings',         href: '/settings',      active: false },
];

export default function BehavioralThreatsAdmin() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/behavior/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch threat stats", e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    // Auth & User Extraction
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/en/login');
      return;
    }
    
    let userEmail = localStorage.getItem('userEmail') || localStorage.getItem('ps_user_email');
    let userName = localStorage.getItem('userName') || localStorage.getItem('ps_user_name');
    
    const finalName = userName || (userEmail ? userEmail.split('@')[0] : 'User');
    
    setUser({
      name: finalName,
      email: userEmail || 'user@example.com',
      avatar: finalName.charAt(0).toUpperCase()
    });

    // Fetch Stats
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // 15s updates
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = '/en/login';
  };

  return (
    <>
      {/* ── Inline styles matching the dashboard ─────────────────────────────────────────────────── */}
      <style precedence="default" href="dashboard-css">{`
        .dashboard-page { display: flex; min-height: 100vh; background: #f1f5f9; font-family: 'Segoe UI', sans-serif; }

        /* ── Sidebar ── */
        .ps-sidebar {
          width: 260px; min-height: 100vh; background: #0f172a;
          display: flex; flex-direction: column;
          position: sticky; top: 0; flex-shrink: 0;
          transition: transform 0.3s ease;
          z-index: 100;
        }
        .ps-sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 24px 20px; border-bottom: 1px solid #1e293b;
        }
        .ps-sidebar-logo span:first-child { font-size: 26px; }
        .ps-sidebar-logo strong { color: #fff; font-size: 18px; letter-spacing: 0.5px; }

        .ps-user-block {
          padding: 20px; display: flex; align-items: center; gap: 12px;
          border-bottom: 1px solid #1e293b; margin-bottom: 8px;
        }
        .ps-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: #fff; font-weight: 700; flex-shrink: 0;
        }
        .ps-user-info p  { color: #fff; font-weight: 600; font-size: 14px; margin: 0; }
        .ps-user-info small { color: #64748b; font-size: 12px; }

        .ps-nav { flex: 1; padding: 8px 12px; display: flex; flex-direction: column; gap: 2px; }
        .ps-nav-item {
          display: flex; align-items: center; gap: 12px; padding: 11px 12px;
          border-radius: 10px; color: #94a3b8; font-size: 14px; font-weight: 500;
          text-decoration: none; transition: all 0.2s; cursor: pointer;
        }
        .ps-nav-item:hover  { background: #1e293b; color: #e2e8f0; }
        .ps-nav-item.active { background: #dc2626; color: #fff; } /* Red active for admin */
        .ps-nav-item .ni    { font-size: 16px; width: 20px; text-align: center; }

        .ps-sidebar-bottom {
          padding: 16px; border-top: 1px solid #1e293b;
        }
        .ps-logout-btn {
          width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #1e293b;
          background: transparent; color: #ef4444; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center;
          justify-content: center; gap: 8px;
        }
        .ps-logout-btn:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

        /* ── Main content ── */
        .ps-main { flex: 1; overflow-x: hidden; }

        .ps-topbar {
          background: #fff; padding: 16px 28px; display: flex;
          align-items: center; justify-content: space-between;
          border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 50;
        }
        .ps-topbar-left { display: flex; flex-direction: column; }
        .ps-topbar-left h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
        .ps-topbar-left p  { font-size: 13px; color: #64748b; margin: 0; }
        .ps-topbar-right { display: flex; align-items: center; gap: 12px; }

        .ps-icon-btn {
          width: 38px; height: 38px; border-radius: 10px; border: 1px solid #e2e8f0;
          background: #f8fafc; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 16px; transition: all 0.2s; position: relative;
        }
        .ps-icon-btn:hover { background: #eff6ff; border-color: #bfdbfe; }
        
        .ps-hamburger {
          display: none; width: 38px; height: 38px; border-radius: 10px;
          border: 1px solid #e2e8f0; background: #f8fafc; align-items: center;
          justify-content: center; cursor: pointer; font-size: 18px;
        }

        .ps-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 24px; }

        /* Stats row */
        .ps-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .ps-stat-card {
          background: #fff; border-radius: 16px; padding: 22px;
          display: flex; flex-direction: column; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,.06); border: 1px solid #f1f5f9;
          transition: box-shadow 0.2s; position: relative; overflow: hidden;
        }
        .ps-stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
        .ps-stat-card::before {
          content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
        }
        .ps-stat-card.blue::before { background: #3b82f6; }
        .ps-stat-card.red::before { background: #ef4444; }
        .ps-stat-card.orange::before { background: #f97316; }
        
        .ps-stat-label { font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 8px; }
        .ps-stat-value { font-size: 32px; font-weight: 800; color: #0f172a; }

        /* Tables & Cards */
        .ps-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 4px rgba(0,0,0,.05); overflow: hidden; }
        .ps-card-header {
          padding: 18px 22px; border-bottom: 1px solid #f1f5f9;
          display: flex; justify-content: space-between; align-items: center; background: #fafafa;
        }
        .ps-card-header h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
        .ps-refresh-btn {
          font-size: 13px; color: #475569; font-weight: 600; background: #e2e8f0; border: none; cursor: pointer;
          padding: 6px 14px; border-radius: 6px; transition: background 0.2s; outline: none;
        }
        .ps-refresh-btn:hover { background: #cbd5e1; }

        .ps-table-wrapper { overflow-x: auto; width: 100%; }
        .ps-table { width: 100%; border-collapse: collapse; text-align: left; }
        .ps-table th { padding: 14px 22px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
        .ps-table td { padding: 16px 22px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .ps-table tr:hover td { background: #f8fafc; }
        
        .ps-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .ps-badge.block { background: #fee2e2; color: #991b1b; }
        .ps-badge.otp { background: #ffedd5; color: #9a3412; }
        .ps-badge.allow { background: #dcfce7; color: #166534; }
        
        .ps-risk-score { font-weight: 800; }
        .ps-risk-high { color: #dc2626; }
        .ps-risk-med { color: #ea580c; }
        .ps-risk-low { color: #16a34a; }

        .ps-rule-tag { display: inline-block; background: #f1f5f9; color: #475569; font-size: 11px; padding: 3px 8px; border-radius: 4px; margin: 2px; font-family: monospace; border: 1px solid #e2e8f0; }
        .ps-ip-code { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #475569; }

        @media (max-width: 992px) {
          .ps-sidebar {
            position: fixed; left: 0; top: 0; bottom: 0;
            transform: translateX(-100%);
          }
          .ps-sidebar.open { transform: translateX(0); }
          .ps-hamburger { display: flex; }
          .ps-stats-row { grid-template-columns: 1fr; }
        }
      `}</style>
      
      <div className="dashboard-page">
        {/* ── Sidebar ── */}
        <aside className={`ps-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="ps-sidebar-logo">
            <span>🛡️</span>
            <strong>PayShield</strong>
          </div>

          <div className="ps-user-block">
            <div className="ps-avatar">{user?.avatar || '?'}</div>
            <div className="ps-user-info">
              <p>{user?.name || 'Loading...'}</p>
              <small>{user?.email || '...'}</small>
            </div>
          </div>

          <nav className="ps-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`ps-nav-item ${item.active ? 'active' : ''}`}
              >
                <span className="ni">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ps-sidebar-bottom">
            <button className="ps-logout-btn" onClick={handleLogout}>
              <span>🚪</span> Log Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="ps-main">
          {/* Top bar */}
          <header className="ps-topbar">
            <div className="ps-topbar-left">
              <h1>Threat Administrator Dashboard 🚨</h1>
              <p>Real-time behavioral monitoring and anomaly detection.</p>
            </div>
            <div className="ps-topbar-right">
              <button className="ps-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
              <Link href="/dashboard" className="ps-refresh-btn" style={{textDecoration: 'none'}}>
                Return to Dashboard App
              </Link>
            </div>
          </header>

          {/* Body */}
          <div className="ps-body">
            
            {loadingStats ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>⏳</span>
                Fetching Live Threat Data...
              </div>
            ) : !stats ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ef4444' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>⚠️</span>
                Failed to load threat intelligence data.
              </div>
            ) : (
               <>
                 {/* Top Stats row */}
                 <div className="ps-stats-row">
                   <div className="ps-stat-card blue">
                     <p className="ps-stat-label">TOTAL LOGIN ANALYSES</p>
                     <p className="ps-stat-value">{stats.totalEvents}</p>
                   </div>
                   <div className="ps-stat-card red">
                     <p className="ps-stat-label">THREATS BLOCKED</p>
                     <p className="ps-stat-value" style={{color: '#dc2626'}}>{stats.blockedAttempts}</p>
                   </div>
                   <div className="ps-stat-card orange">
                     <p className="ps-stat-label">RECENT ANOMALIES</p>
                     <p className="ps-stat-value" style={{color: '#ea580c'}}>{stats.recentThreats?.length || 0}</p>
                   </div>
                 </div>

                 {/* Threats Table */}
                 <div className="ps-card">
                   <div className="ps-card-header">
                     <h3>Recent Behavioral Anomalies Log</h3>
                     <button className="ps-refresh-btn" onClick={fetchStats}>↻ Refresh Data</button>
                   </div>
                   <div className="ps-table-wrapper">
                     {stats.recentThreats?.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                          No recent security anomalies detected.
                        </div>
                     ) : (
                       <table className="ps-table">
                         <thead>
                           <tr>
                             <th>Timestamp</th>
                             <th>Outcome</th>
                             <th>Risk Profile</th>
                             <th>Hardcoded Rules Triggered</th>
                             <th>Metadata</th>
                           </tr>
                         </thead>
                         <tbody>
                           {stats.recentThreats.map((threat) => (
                             <tr key={threat.id}>
                               <td style={{ color: '#64748b', fontSize: '13px' }}>
                                 {new Date(threat.createdAt).toLocaleString()}
                               </td>
                               <td>
                                 {threat.actionTaken === 'block' ? (
                                   <span className="ps-badge block">🛑 Blocked</span>
                                 ) : threat.actionTaken === 'require_otp' ? (
                                   <span className="ps-badge otp">🔑 OTP Required</span>
                                 ) : (
                                   <span className="ps-badge allow">✅ Passed</span>
                                 )}
                               </td>
                               <td>
                                 <span className={`ps-risk-score ${threat.riskScore >= 80 ? 'ps-risk-high' : threat.riskScore >= 60 ? 'ps-risk-med' : 'ps-risk-low'}`}>
                                   {threat.riskScore} / 100
                                 </span>
                               </td>
                               <td style={{ maxWidth: '300px' }}>
                                 {threat.triggeredRules && threat.triggeredRules.length > 0 ? (
                                   threat.triggeredRules.map((r, i) => (
                                     <span key={i} className="ps-rule-tag" title={r}>
                                       {r.replace(' (', '\n(')}
                                     </span>
                                   ))
                                 ) : (
                                   <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>Normal baseline matched</span>
                                 )}
                               </td>
                               <td>
                                 <span className="ps-ip-code">Event ID: {threat.id}</span>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     )}
                   </div>
                 </div>
               </>
            )}
            
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99, cursor: 'pointer' }}
        />
      )}
    </>
  );
}
