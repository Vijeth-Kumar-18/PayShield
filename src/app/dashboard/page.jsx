'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── Sidebar nav items ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard',        href: '/dashboard',     active: true  },
  { icon: '💸', label: 'Pay',              href: '/payment',       active: false },
  { icon: '📋', label: 'Transactions',     href: '/transactions',  active: false },
  { icon: '🔔', label: 'Notifications',    href: '/notifications', active: false },
  { icon: '📷', label: 'QR Payment',       href: '/qr',            active: false },
  { icon: '👤', label: 'Profile',          href: '/profile',       active: false },
  { icon: '🛡️', label: 'Security',         href: '/security',      active: false },
  { icon: '🚨', label: 'Threat Admin',       href: '/admin/threats', active: false },
  { icon: '⚙️', label: 'Settings',         href: '/settings',      active: false },
];

// ─── Quick-action buttons ─────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '💸', label: 'Send Money',      href: '/payment',       color: '#2563eb' },
  { icon: '📷', label: 'Scan & Pay',      href: '/qr',            color: '#1d4ed8' },
  { icon: '📋', label: 'History',         href: '/transactions',  color: '#0891b2' },
  { icon: '🔔', label: 'Notifications',   href: '/notifications', color: '#059669' },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { icon: '✅', label: 'Transactions',  value: '1,248',  sub: 'This month',         color: '#10b981' },
  { icon: '🛡️', label: 'Threats Blocked', value: '3',   sub: 'Last 30 days',       color: '#2563eb' },
  { icon: '⚡', label: 'Avg Speed',     value: '1.2s',   sub: 'Per transaction',    color: '#f59e0b' },
  { icon: '🔒', label: 'Security Score', value: '98%',  sub: 'Excellent',           color: '#1d4ed8' },
];

// ─── Recent transactions ──────────────────────────────────────────────────────
const TRANSACTIONS = [
  { icon: '🛒', name: 'Amazon India',      desc: 'Online Shopping',   date: 'Today, 11:42 AM',   location: 'Bengaluru',  amount: '-₹1,299', type: 'debit',  status: 'Verified' },
  { icon: '👤', name: 'Rahul Sharma',       desc: 'UPI Transfer',      date: 'Today, 09:15 AM',   location: 'Mumbai',     amount: '+₹5,000', type: 'credit', status: 'Verified' },
  { icon: '🍕', name: 'Swiggy',            desc: 'Food Order',         date: 'Yesterday, 8:30 PM', location: 'Bengaluru', amount: '-₹348',   type: 'debit',  status: 'Verified' },
  { icon: '⛽', name: 'HP Petrol Bunk',    desc: 'Fuel Payment',       date: 'Mar 18, 6:10 PM',   location: 'Mangaluru',  amount: '-₹2,100', type: 'debit',  status: 'Verified' },
  { icon: '👤', name: 'Priya Nair',        desc: 'UPI Transfer',       date: 'Mar 17, 2:00 PM',   location: 'Kochi',      amount: '+₹3,500', type: 'credit', status: 'Verified' },
];

// ─── Security status cards ────────────────────────────────────────────────────
const PROTECTIONS = [
  { icon: '🧬', label: 'Device DNA',       status: 'Active',  desc: 'This device is registered & verified.' },
  { icon: '🌍', label: 'Geo-Auth',         status: 'Active',  desc: 'Location monitoring is on.' },
  { icon: '🍯', label: 'Honeypot',         status: 'Active',  desc: 'Mirror Maze decoy is armed.' },
  { icon: '🤖', label: 'AI Monitoring',    status: 'Active',  desc: 'Behavioural anomaly detection running.' },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/en/login');
      return;
    }
    
    // Try to get user info from multiple possible localStorage keys
    let userEmail = localStorage.getItem('userEmail') || localStorage.getItem('ps_user_email');
    let userName = localStorage.getItem('userName') || localStorage.getItem('ps_user_name');
    
    // If they aren't stored individually, check if there's a user object stored
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        userEmail = userEmail || storedUser.email;
        userName = userName || storedUser.name || storedUser.full_name;
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
    
    // Clean up "undefined" or "null" strings that might have been saved accidentally
    if (userEmail === 'undefined' || userEmail === 'null') userEmail = null;
    if (userName === 'undefined' || userName === 'null') userName = null;
    
    const finalName = userName || (userEmail ? userEmail.split('@')[0] : 'User');
    
    setUser({
      name: finalName,
      email: userEmail || 'user@example.com',
      avatar: finalName.charAt(0).toUpperCase()
    });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = '/en/login';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
          <div style={{ fontSize: '18px', color: '#64748b' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Inline styles ─────────────────────────────────────────────────── */}
      <style precedence="default" href="dashboard-css">{`
        /* Reset dashboard page from global navbar/footer */
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
        .ps-nav-item.active { background: #1d4ed8; color: #fff; }
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

        /* Top bar */
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
        .ps-notif-dot {
          position: absolute; top: 6px; right: 6px; width: 8px; height: 8px;
          background: #ef4444; border-radius: 50%; border: 2px solid #f8fafc;
        }
        .ps-status-pill {
          background: #dcfce7; color: #15803d; padding: 5px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 5px;
        }
        .ps-status-dot { width: 7px; height: 7px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        .ps-hamburger {
          display: none; width: 38px; height: 38px; border-radius: 10px;
          border: 1px solid #e2e8f0; background: #f8fafc; align-items: center;
          justify-content: center; cursor: pointer; font-size: 18px;
        }

        /* ── Page body ── */
        .ps-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 24px; }

        /* Balance card */
        .ps-balance-card {
          background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 50%, #1d4ed8 100%);
          border-radius: 20px; padding: 28px 32px; color: #fff; position: relative; overflow: hidden;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 10px 40px rgba(37,99,235,0.35);
        }
        .ps-balance-card::before {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
        }
        .ps-balance-card::after {
          content: ''; position: absolute; bottom: -80px; right: 120px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .ps-balance-left  { position: relative; z-index: 1; }
        .ps-balance-label { font-size: 13px; opacity: .75; margin-bottom: 6px; letter-spacing: .5px; }
        .ps-balance-amount{ font-size: 42px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; }
        .ps-balance-sub   { font-size: 13px; opacity: .7; }
        .ps-balance-right { position: relative; z-index: 1; text-align: right; }
        .ps-balance-tag   {
          background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.2); border-radius: 12px;
          padding: 8px 16px; font-size: 13px; font-weight: 600; margin-bottom: 16px;
          display: inline-block;
        }
        .ps-balance-acno  { font-size: 13px; opacity: .6; }

        /* Stats row */
        .ps-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ps-stat-card {
          background: #fff; border-radius: 16px; padding: 18px;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,.06); border: 1px solid #f1f5f9;
          transition: box-shadow 0.2s;
        }
        .ps-stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
        .ps-stat-icon-wrap {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .ps-stat-label { font-size: 12px; color: #64748b; margin-bottom: 3px; }
        .ps-stat-value { font-size: 22px; font-weight: 700; color: #0f172a; }
        .ps-stat-sub   { font-size: 11px; color: #94a3b8; margin-top: 2px; }

        /* Quick actions */
        .ps-section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .ps-qa-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .ps-qa-btn {
          background: #fff; border-radius: 16px; padding: 22px 16px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          text-decoration: none; border: 1px solid #f1f5f9;
          box-shadow: 0 1px 4px rgba(0,0,0,.05);
          transition: all 0.25s; cursor: pointer;
        }
        .ps-qa-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.1); }
        .ps-qa-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; font-size: 22px;
        }
        .ps-qa-label { font-size: 13px; font-weight: 600; color: #1e293b; text-align: center; }

        /* Two column row */
        .ps-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        /* Transactions */
        .ps-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 4px rgba(0,0,0,.05); overflow: hidden; }
        .ps-card-header {
          padding: 18px 22px; border-bottom: 1px solid #f1f5f9;
          display: flex; justify-content: space-between; align-items: center;
        }
        .ps-card-header h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
        .ps-view-all {
          font-size: 13px; color: #2563eb; font-weight: 600; text-decoration: none;
          padding: 5px 12px; border-radius: 8px; transition: background 0.2s;
        }
        .ps-view-all:hover { background: #eff6ff; }

        .ps-txn-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 22px; border-bottom: 1px solid #f8fafc;
          transition: background 0.15s;
        }
        .ps-txn-row:last-child { border-bottom: none; }
        .ps-txn-row:hover { background: #fafbff; }
        .ps-txn-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
          flex-shrink: 0;
        }
        .ps-txn-icon.debit  { background: #fef2f2; }
        .ps-txn-icon.credit { background: #f0fdf4; }
        .ps-txn-info { flex: 1; min-width: 0; }
        .ps-txn-name { font-size: 14px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ps-txn-meta { font-size: 12px; color: #94a3b8; margin-top: 2px; }
        .ps-txn-right { text-align: right; flex-shrink: 0; }
        .ps-txn-amount { font-size: 14px; font-weight: 700; }
        .ps-txn-amount.debit  { color: #ef4444; }
        .ps-txn-amount.credit { color: #10b981; }
        .ps-txn-status { font-size: 11px; color: #10b981; margin-top: 2px; font-weight: 500; }

        /* Security panel */
        .ps-security-list { padding: 8px 0; }
        .ps-prot-row {
          display: flex; align-items: center; gap: 14px; padding: 12px 22px;
          border-bottom: 1px solid #f8fafc; transition: background 0.15s;
        }
        .ps-prot-row:last-child { border-bottom: none; }
        .ps-prot-row:hover { background: #fafbff; }
        .ps-prot-icon {
          width: 40px; height: 40px; border-radius: 10px; background: #f0fdf4;
          display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0;
        }
        .ps-prot-info { flex: 1; }
        .ps-prot-name { font-size: 14px; font-weight: 600; color: #0f172a; }
        .ps-prot-desc { font-size: 12px; color: #94a3b8; margin-top: 1px; }
        .ps-active-pill {
          background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px; flex-shrink: 0;
        }

        /* Security score mini */
        .ps-score-wrap { padding: 20px 22px; display: flex; align-items: center; gap: 18px; }
        .ps-score-circle {
          width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
          background: conic-gradient(#10b981 0% 98%, #e2e8f0 98% 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 6px #f0fdf4;
        }
        .ps-score-inner {
          width: 52px; height: 52px; border-radius: 50%; background: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 800; color: #10b981;
        }
        .ps-score-label { font-size: 18px; font-weight: 700; color: #0f172a; }
        .ps-score-sub   { font-size: 13px; color: #64748b; margin-top: 2px; }

        /* Responsive */
        @media (max-width: 1100px) {
          .ps-stats-row { grid-template-columns: repeat(2, 1fr); }
          .ps-two-col   { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .ps-sidebar  { position: fixed; left: 0; top: 0; bottom: 0; transform: translateX(-100%); }
          .ps-sidebar.open { transform: translateX(0); }
          .ps-hamburger{ display: flex; }
          .ps-body     { padding: 16px; }
          .ps-topbar   { padding: 12px 16px; }
          .ps-stats-row { grid-template-columns: repeat(2, 1fr); }
          .ps-qa-grid  { grid-template-columns: repeat(2, 1fr); }
          .ps-balance-amount { font-size: 30px; }
          .ps-balance-right  { display: none; }
        }
        @media (max-width: 480px) {
          .ps-stats-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="dashboard-page">
        {/* ── Sidebar ── */}
        <aside className={`ps-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Logo */}
          <div className="ps-sidebar-logo">
            <span>🛡️</span>
            <strong>PayShield</strong>
          </div>

          {/* User */}
          <div className="ps-user-block">
            <div className="ps-avatar">{user?.avatar || 'U'}</div>
            <div className="ps-user-info">
              <p>{user?.name || 'User'}</p>
              <small>{user?.email || 'user@example.com'}</small>
            </div>
          </div>

          {/* Nav */}
          <nav className="ps-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`ps-nav-item ${item.active ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="ni">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
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
              <h1>Good morning, {user?.name || 'User'} 👋</h1>
              <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;·&nbsp; All systems secure</p>
            </div>
            <div className="ps-topbar-right">
              <button
                className="ps-hamburger"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >☰</button>
              <Link href="/notifications" className="ps-icon-btn" title="Notifications">
                🔔
                <span className="ps-notif-dot" />
              </Link>
              <div className="ps-status-pill">
                <span className="ps-status-dot" />
                Secure
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="ps-body">

            {/* Balance card */}
            <div className="ps-balance-card">
              <div className="ps-balance-left">
                <p className="ps-balance-label">AVAILABLE BALANCE</p>
                <p className="ps-balance-amount">₹48,250.00</p>
                <p className="ps-balance-sub">Last updated: Today, 11:42 AM</p>
              </div>
              <div className="ps-balance-right">
                <div className="ps-balance-tag">🔒 PayShield Protected</div>
                <p className="ps-balance-acno">A/C: •••• •••• 4821</p>
              </div>
            </div>

            {/* Stats */}
            <div className="ps-stats-row">
              {STATS.map((s) => (
                <div className="ps-stat-card" key={s.label}>
                  <div
                    className="ps-stat-icon-wrap"
                    style={{ background: s.color + '18' }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p className="ps-stat-label">{s.label}</p>
                    <p className="ps-stat-value" style={{ color: s.color }}>{s.value}</p>
                    <p className="ps-stat-sub">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div>
              <p className="ps-section-title">Quick Actions</p>
              <div className="ps-qa-grid">
                {QUICK_ACTIONS.map((a) => (
                  <Link key={a.label} href={a.href} className="ps-qa-btn">
                    <div
                      className="ps-qa-icon"
                      style={{ background: a.color + '18' }}
                    >
                      {a.icon}
                    </div>
                    <span className="ps-qa-label">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Two column: transactions + security */}
            <div className="ps-two-col">

              {/* Recent Transactions */}
              <div className="ps-card">
                <div className="ps-card-header">
                  <h3>Recent Transactions</h3>
                  <Link href="/transactions" className="ps-view-all">View all →</Link>
                </div>
                {TRANSACTIONS.map((t, i) => (
                  <div className="ps-txn-row" key={i}>
                    <div className={`ps-txn-icon ${t.type}`}>{t.icon}</div>
                    <div className="ps-txn-info">
                      <p className="ps-txn-name">{t.name}</p>
                      <p className="ps-txn-meta">{t.desc} &nbsp;·&nbsp; {t.date}</p>
                    </div>
                    <div className="ps-txn-right">
                      <p className={`ps-txn-amount ${t.type}`}>{t.amount}</p>
                      <p className="ps-txn-status">✔ {t.status}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Score */}
                <div className="ps-card">
                  <div className="ps-card-header">
                    <h3>Security Score</h3>
                    <Link href="/security" className="ps-view-all">Details →</Link>
                  </div>
                  <div className="ps-score-wrap">
                    <div className="ps-score-circle">
                      <div className="ps-score-inner">98%</div>
                    </div>
                    <div>
                      <p className="ps-score-label">Excellent Protection</p>
                      <p className="ps-score-sub">All security layers are active and verified.</p>
                    </div>
                  </div>
                </div>

                {/* Protections */}
                <div className="ps-card">
                  <div className="ps-card-header">
                    <h3>Active Protections</h3>
                  </div>
                  <div className="ps-security-list">
                    {PROTECTIONS.map((p) => (
                      <div className="ps-prot-row" key={p.label}>
                        <div className="ps-prot-icon">{p.icon}</div>
                        <div className="ps-prot-info">
                          <p className="ps-prot-name">{p.label}</p>
                          <p className="ps-prot-desc">{p.desc}</p>
                        </div>
                        <span className="ps-active-pill">{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>{/* /ps-body */}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 99, cursor: 'pointer',
          }}
        />
      )}
    </>
  );
}