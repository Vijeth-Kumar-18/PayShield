'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Notification data ────────────────────────────────────────────────────────
const ALL_NOTIFICATIONS = [
  {
    id: 1,
    category: 'security',
    icon: '🚨',
    title: 'Suspicious Login Blocked',
    message: 'An unauthorized login attempt from Russia (IP: 185.220.xx.xx) was detected and blocked. Your account was redirected to Honeypot.',
    time: 'Today, 11:55 AM',
    read: false,
    priority: 'high',
    tags: ['Geo-Block', 'Honeypot Active'],
  },
  {
    id: 2,
    category: 'payment',
    icon: '✅',
    title: 'Payment Successful',
    message: 'You paid ₹1,299 to Amazon India via UPI. Transaction ID: TXN2026031901.',
    time: 'Today, 11:42 AM',
    read: false,
    priority: 'normal',
    tags: ['UPI', 'Verified'],
  },
  {
    id: 3,
    category: 'security',
    icon: '🧬',
    title: 'New Device Detected',
    message: 'A login was attempted from an unregistered device. Device DNA mismatch detected. Access denied.',
    time: 'Today, 09:30 AM',
    read: false,
    priority: 'high',
    tags: ['Device DNA', 'Blocked'],
  },
  {
    id: 4,
    category: 'payment',
    icon: '💰',
    title: 'Money Received',
    message: 'Rahul Sharma sent you ₹5,000 via UPI. Your balance has been updated.',
    time: 'Today, 09:15 AM',
    read: true,
    priority: 'normal',
    tags: ['UPI', 'Credit'],
  },
  {
    id: 5,
    category: 'system',
    icon: '🛡️',
    title: 'Security Scan Complete',
    message: 'Your daily security scan finished. All 4 protection layers are active. Security score: 98/100.',
    time: 'Today, 08:00 AM',
    read: true,
    priority: 'normal',
    tags: ['Auto-Scan', 'All Clear'],
  },
  {
    id: 6,
    category: 'security',
    icon: '⚠️',
    title: 'Unusual Transaction Timing',
    message: 'AI behavioural monitor flagged an unusual login at 3:12 AM. If this was you, no action needed.',
    time: 'Yesterday, 3:12 AM',
    read: true,
    priority: 'medium',
    tags: ['AI Monitor', 'Flagged'],
  },
  {
    id: 7,
    category: 'payment',
    icon: '🧾',
    title: 'Payment to Swiggy',
    message: 'You paid ₹348 to Swiggy for food order #SW4821. Transaction verified and encrypted.',
    time: 'Yesterday, 8:30 PM',
    read: true,
    priority: 'normal',
    tags: ['UPI', 'Verified'],
  },
  {
    id: 8,
    category: 'system',
    icon: '🔑',
    title: 'Cryptographic Key Renewed',
    message: 'Your device\'s RSA public-private key pair has been automatically rotated for enhanced security.',
    time: 'Mar 18, 12:00 AM',
    read: true,
    priority: 'normal',
    tags: ['RSA', 'Auto-Renew'],
  },
  {
    id: 9,
    category: 'payment',
    icon: '⛽',
    title: 'Fuel Payment Confirmed',
    message: 'You paid ₹2,100 to HP Petrol Bunk, Mangaluru. AES-256 encrypted transaction.',
    time: 'Mar 18, 6:10 PM',
    read: true,
    priority: 'normal',
    tags: ['UPI', 'Verified'],
  },
  {
    id: 10,
    category: 'system',
    icon: '📍',
    title: 'Location Whitelist Updated',
    message: 'Bengaluru and Mangaluru have been added to your trusted locations for geo-authentication.',
    time: 'Mar 17, 10:00 AM',
    read: true,
    priority: 'normal',
    tags: ['Geo-Auth', 'Updated'],
  },
];

const FILTERS = ['All', 'Security', 'Payments', 'System'];

const PRIORITY_COLOR = {
  high:   { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
  medium: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  normal: { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
};

const TAG_COLORS = {
  'Geo-Block':    '#7c3aed', 'Honeypot Active': '#dc2626', 'UPI': '#2563eb',
  'Verified':     '#059669', 'Device DNA':       '#0891b2', 'Blocked': '#dc2626',
  'Credit':       '#059669', 'Auto-Scan':        '#64748b', 'All Clear': '#059669',
  'AI Monitor':   '#7c3aed', 'Flagged':          '#b45309', 'RSA': '#0891b2',
  'Auto-Renew':   '#059669', 'Geo-Auth':         '#7c3aed', 'Updated': '#2563eb',
};

export default function Notifications() {
  const [filter, setFilter]       = useState('All');
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'All')      return true;
    if (filter === 'Security') return n.category === 'security';
    if (filter === 'Payments') return n.category === 'payment';
    if (filter === 'System')   return n.category === 'system';
    return true;
  });

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const markRead = (id) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const dismiss = (id) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <>
      <style>{`
        .nf-page {
          min-height: 100vh; background: #f1f5f9;
          font-family: 'Segoe UI', sans-serif;
        }

        /* Top bar */
        .nf-topbar {
          background: #fff; border-bottom: 1px solid #e2e8f0;
          padding: 18px 32px; display: flex; align-items: center;
          justify-content: space-between; position: sticky; top: 0; z-index: 50;
        }
        .nf-topbar-left { display: flex; align-items: center; gap: 14px; }
        .nf-back {
          width: 38px; height: 38px; border-radius: 10px; border: 1px solid #e2e8f0;
          background: #f8fafc; display: flex; align-items: center; justify-content: center;
          text-decoration: none; font-size: 18px; transition: all 0.2s; color: #1e293b;
        }
        .nf-back:hover { background: #eff6ff; border-color: #bfdbfe; }
        .nf-topbar-title h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
        .nf-topbar-title p  { font-size: 13px; color: #64748b; margin: 0; }
        .nf-unread-badge {
          background: #ef4444; color: #fff; font-size: 12px; font-weight: 700;
          padding: 3px 9px; border-radius: 20px; margin-left: 8px;
        }
        .nf-mark-all {
          font-size: 13px; color: #2563eb; font-weight: 600; background: none;
          border: 1px solid #bfdbfe; padding: 7px 16px; border-radius: 8px;
          cursor: pointer; transition: all 0.2s;
        }
        .nf-mark-all:hover { background: #eff6ff; }

        /* Body */
        .nf-body { max-width: 780px; margin: 0 auto; padding: 28px 20px; }

        /* Filter tabs */
        .nf-filters {
          display: flex; gap: 8px; margin-bottom: 24px;
          background: #fff; padding: 6px; border-radius: 14px;
          border: 1px solid #e2e8f0; width: fit-content;
        }
        .nf-filter-btn {
          padding: 8px 20px; border-radius: 10px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
          background: transparent; color: #64748b;
        }
        .nf-filter-btn.active {
          background: #1d4ed8; color: #fff;
          box-shadow: 0 2px 8px rgba(29,78,216,0.25);
        }
        .nf-filter-btn:not(.active):hover { background: #f1f5f9; color: #1e293b; }

        /* Section label */
        .nf-section-label {
          font-size: 12px; font-weight: 700; color: #94a3b8;
          letter-spacing: 1px; text-transform: uppercase;
          margin: 20px 0 10px; padding-left: 4px;
        }

        /* Notification card */
        .nf-card {
          background: #fff; border-radius: 16px; border: 1px solid #f1f5f9;
          margin-bottom: 10px; overflow: hidden; transition: box-shadow 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,.04);
        }
        .nf-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
        .nf-card.unread { border-left: 4px solid #2563eb; }
        .nf-card.high   { border-left: 4px solid #ef4444; }

        .nf-card-inner {
          display: flex; align-items: flex-start; gap: 14px; padding: 16px 18px;
        }
        .nf-icon-wrap {
          width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .nf-icon-security { background: #fee2e2; }
        .nf-icon-payment  { background: #f0fdf4; }
        .nf-icon-system   { background: #eff6ff; }

        .nf-content { flex: 1; min-width: 0; }
        .nf-content-top {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 8px; margin-bottom: 5px;
        }
        .nf-title {
          font-size: 14px; font-weight: 700; color: #0f172a;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .nf-unread-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #2563eb;
          flex-shrink: 0; margin-top: 1px;
        }
        .nf-time { font-size: 12px; color: #94a3b8; white-space: nowrap; flex-shrink: 0; }
        .nf-message { font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 10px; }

        .nf-footer { display: flex; align-items: center; justify-content: space-between; }
        .nf-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .nf-tag {
          font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px;
          color: #fff;
        }
        .nf-actions { display: flex; gap: 8px; }
        .nf-action-btn {
          font-size: 12px; padding: 4px 12px; border-radius: 8px; border: none;
          cursor: pointer; font-weight: 600; transition: all 0.2s;
        }
        .nf-read-btn   { background: #eff6ff; color: #2563eb; }
        .nf-read-btn:hover { background: #dbeafe; }
        .nf-dismiss-btn { background: #f1f5f9; color: #64748b; }
        .nf-dismiss-btn:hover { background: #e2e8f0; color: #ef4444; }

        /* Priority banner for high */
        .nf-priority-banner {
          padding: 8px 18px; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; gap: 6px;
          border-bottom: 1px solid transparent;
        }

        /* Empty state */
        .nf-empty {
          text-align: center; padding: 60px 20px; color: #94a3b8;
        }
        .nf-empty-icon { font-size: 48px; margin-bottom: 12px; }
        .nf-empty h3 { font-size: 18px; font-weight: 700; color: #64748b; margin-bottom: 6px; }
        .nf-empty p  { font-size: 14px; }

        /* Summary bar */
        .nf-summary {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
          margin-bottom: 24px;
        }
        .nf-summary-card {
          background: #fff; border-radius: 14px; padding: 16px;
          border: 1px solid #f1f5f9; text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,.04);
        }
        .nf-summary-val  { font-size: 28px; font-weight: 800; color: #0f172a; }
        .nf-summary-label{ font-size: 12px; color: #64748b; margin-top: 2px; }

        @media (max-width: 600px) {
          .nf-topbar { padding: 14px 16px; }
          .nf-body   { padding: 16px 12px; }
          .nf-summary { grid-template-columns: repeat(3,1fr); gap: 8px; }
          .nf-summary-val { font-size: 22px; }
          .nf-filters { flex-wrap: wrap; width: 100%; }
          .nf-filter-btn { flex: 1; text-align: center; }
        }
      `}</style>

      <div className="nf-page">
        {/* Top bar */}
        <header className="nf-topbar">
          <div className="nf-topbar-left">
            <Link href="/dashboard" className="nf-back">←</Link>
            <div className="nf-topbar-title">
              <h1>
                Notifications
                {unreadCount > 0 && (
                  <span className="nf-unread-badge">{unreadCount} new</span>
                )}
              </h1>
              <p>Security alerts, payments & system updates</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button className="nf-mark-all" onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </header>

        <div className="nf-body">

          {/* Summary */}
          <div className="nf-summary">
            <div className="nf-summary-card">
              <p className="nf-summary-val" style={{ color: '#ef4444' }}>
                {notifications.filter(n => n.priority === 'high').length}
              </p>
              <p className="nf-summary-label">🚨 Security Alerts</p>
            </div>
            <div className="nf-summary-card">
              <p className="nf-summary-val" style={{ color: '#2563eb' }}>{unreadCount}</p>
              <p className="nf-summary-label">🔵 Unread</p>
            </div>
            <div className="nf-summary-card">
              <p className="nf-summary-val" style={{ color: '#10b981' }}>
                {notifications.filter(n => n.category === 'payment').length}
              </p>
              <p className="nf-summary-label">💸 Payments</p>
            </div>
          </div>

          {/* Filters */}
          <div className="nf-filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`nf-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Notifications list */}
          {filtered.length === 0 ? (
            <div className="nf-empty">
              <div className="nf-empty-icon">🔔</div>
              <h3>All caught up!</h3>
              <p>No notifications in this category.</p>
            </div>
          ) : (
            <>
              {/* Unread section */}
              {filtered.some(n => !n.read) && (
                <>
                  <p className="nf-section-label">New</p>
                  {filtered.filter(n => !n.read).map(n => (
                    <NotifCard
                      key={n.id}
                      n={n}
                      onRead={markRead}
                      onDismiss={dismiss}
                    />
                  ))}
                </>
              )}

              {/* Read section */}
              {filtered.some(n => n.read) && (
                <>
                  <p className="nf-section-label">Earlier</p>
                  {filtered.filter(n => n.read).map(n => (
                    <NotifCard
                      key={n.id}
                      n={n}
                      onRead={markRead}
                      onDismiss={dismiss}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Individual notification card ─────────────────────────────────────────────
function NotifCard({ n, onRead, onDismiss }) {
  const p = PRIORITY_COLOR[n.priority];

  return (
    <div
      className={`nf-card ${!n.read ? 'unread' : ''} ${n.priority === 'high' ? 'high' : ''}`}
    >
      {/* Priority banner for high-priority */}
      {n.priority === 'high' && (
        <div
          className="nf-priority-banner"
          style={{ background: p.bg, color: p.text, borderColor: p.border }}
        >
          🚨 High Priority — Immediate attention required
        </div>
      )}

      <div className="nf-card-inner">
        {/* Icon */}
        <div className={`nf-icon-wrap nf-icon-${n.category}`}>
          {n.icon}
        </div>

        {/* Content */}
        <div className="nf-content">
          <div className="nf-content-top">
            <p className="nf-title">
              {!n.read && <span className="nf-unread-dot" />}
              {n.title}
            </p>
            <span className="nf-time">{n.time}</span>
          </div>

          <p className="nf-message">{n.message}</p>

          <div className="nf-footer">
            {/* Tags */}
            <div className="nf-tags">
              {n.tags.map(tag => (
                <span
                  key={tag}
                  className="nf-tag"
                  style={{ background: TAG_COLORS[tag] || '#64748b' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="nf-actions">
              {!n.read && (
                <button className="nf-action-btn nf-read-btn" onClick={() => onRead(n.id)}>
                  Mark read
                </button>
              )}
              <button className="nf-action-btn nf-dismiss-btn" onClick={() => onDismiss(n.id)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}