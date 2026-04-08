'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  { q: 'What is PayShield and how does it protect me?', a: 'PayShield is an AI-powered security gateway that sits between your device and the banking server. It uses Argon2id password hashing, RSA Device DNA authentication, AES-256 encryption, geo-location monitoring, and a Honeypot (Mirror Maze) system to protect every transaction in real time.' },
  { q: 'What should I do if I suspect unauthorized access?', a: 'Immediately tap "Freeze Account" from the Security page, or call our 24/7 emergency line at 1800-PAY-SAFE. PayShield\'s Honeypot system will have already redirected any attacker to a decoy account — your real funds are safe.' },
  { q: 'I got a geo-block alert when logging in from a new city. What do I do?', a: 'This is expected behavior. When you log in from a new location, PayShield requires secondary cryptographic verification. Follow the on-screen prompt to verify via your registered device or email OTP to whitelist the new location.' },
  { q: 'How do I switch to a new phone?', a: 'Because PayShield uses Device DNA (public-private key pairs), switching phones requires a multi-step re-authentication. Go to Profile > Security > Register New Device. You will need your original device or email OTP to complete the process.' },
  { q: 'Why is my transaction taking 30 seconds?', a: 'A 30-second processing delay is triggered when our AI system detects unusual behavior patterns (e.g., typing speed, mouse movement, or login timing anomalies). This is a security feature — the Slow Motion Trap — used to trace and log potential attackers. Legitimate users will pass automatically.' },
  { q: 'How is my UPI PIN protected?', a: 'PayShield never stores your UPI PIN. It is processed exclusively by the UPI network (NPCI). Your password is hashed using Argon2id with a unique Salt and server-side Pepper stored in a Hardware Security Module — making it impossible to reverse-engineer even in a full database breach.' },
  { q: 'What is the Honeypot / Mirror Maze?', a: 'The Honeypot is a decoy account automatically created alongside your real account. It has a fake balance (e.g., ₹50,000) and forged transaction history. If an attacker gains unauthorized access, they are silently redirected to this fake account, while your real funds remain untouched and their IP is traced.' },
  { q: 'How do I contact support for a failed payment?', a: 'For failed payments, go to Transactions > Select the transaction > Raise Dispute. Alternatively, use the chat support below or email support@payshield.in. Disputes must be raised within 30 days of the transaction.' },
];

const CATEGORIES = [
  { icon: '🔐', label: 'Account & Security', color: '#1d4ed8' },
  { icon: '💸', label: 'Payments & Transactions', color: '#059669' },
  { icon: '📱', label: 'Device & App Issues', color: '#7c3aed' },
  { icon: '🌍', label: 'Geo-Block & Travel', color: '#0891b2' },
];

export default function HelpSupport() {
  const [expanded, setExpanded] = useState(null);
  const [search,   setSearch]   = useState('');
  const [msgSent,  setMsgSent]  = useState(false);
  const [form,     setForm]     = useState({ subject: '', message: '' });

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!form.subject || !form.message) return;
    setMsgSent(true);
    setForm({ subject: '', message: '' });
    setTimeout(() => setMsgSent(false), 4000);
  };

  return (
    <>
      <style>{`
        .hs-page { min-height:100vh;background:#f1f5f9;font-family:'Segoe UI',sans-serif; }

        .hs-topbar {
          background:#fff;border-bottom:1px solid #e2e8f0;padding:18px 32px;
          display:flex;align-items:center;gap:14px;position:sticky;top:0;z-index:50;
        }
        .hs-back {
          width:38px;height:38px;border-radius:10px;border:1px solid #e2e8f0;
          background:#f8fafc;display:flex;align-items:center;justify-content:center;
          text-decoration:none;font-size:18px;color:#1e293b;transition:all 0.2s;flex-shrink:0;
        }
        .hs-back:hover { background:#eff6ff;border-color:#bfdbfe; }
        .hs-topbar h1 { font-size:20px;font-weight:700;color:#0f172a;margin:0; }
        .hs-topbar p  { font-size:13px;color:#64748b;margin:0; }

        .hs-body { max-width:860px;margin:0 auto;padding:28px 20px;display:flex;flex-direction:column;gap:24px; }

        .hs-hero {
          background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 50%,#7c3aed 100%);
          border-radius:20px;padding:32px;color:#fff;text-align:center;
          box-shadow:0 10px 40px rgba(37,99,235,.3);
        }
        .hs-hero h2 { font-size:24px;font-weight:800;margin:0 0 8px; }
        .hs-hero p  { font-size:15px;opacity:.85;margin:0 0 20px; }
        .hs-search {
          display:flex;align-items:center;gap:10px;background:#fff;border-radius:12px;
          padding:10px 16px;max-width:480px;margin:0 auto;
        }
        .hs-search span { font-size:18px; }
        .hs-search input {
          flex:1;border:none;outline:none;font-size:14px;color:#0f172a;background:transparent;
        }

        .hs-categories { display:grid;grid-template-columns:repeat(4,1fr);gap:12px; }
        .hs-cat {
          background:#fff;border-radius:14px;padding:18px;border:1px solid #f1f5f9;
          box-shadow:0 1px 3px rgba(0,0,0,.04);text-align:center;cursor:pointer;
          transition:all 0.2s;text-decoration:none;
        }
        .hs-cat:hover { transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.1); }
        .hs-cat-icon { font-size:28px;margin-bottom:8px; }
        .hs-cat-label { font-size:13px;font-weight:600;color:#0f172a; }

        .hs-card { background:#fff;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 1px 4px rgba(0,0,0,.05);overflow:hidden; }
        .hs-card-header { padding:16px 22px;border-bottom:1px solid #f8fafc; }
        .hs-card-header h3 { font-size:15px;font-weight:700;color:#0f172a;margin:0 0 2px; }
        .hs-card-header p  { font-size:13px;color:#64748b;margin:0; }

        .hs-faq-item { border-bottom:1px solid #f8fafc; }
        .hs-faq-item:last-child { border-bottom:none; }
        .hs-faq-header {
          display:flex;align-items:flex-start;gap:12px;padding:16px 22px;
          cursor:pointer;user-select:none;transition:background .15s;
        }
        .hs-faq-header:hover { background:#fafbff; }
        .hs-faq-q { flex:1;font-size:14px;font-weight:600;color:#0f172a;line-height:1.5; }
        .hs-faq-arrow { font-size:18px;color:#94a3b8;transition:transform .3s;flex-shrink:0;margin-top:1px; }
        .hs-faq-arrow.open { transform:rotate(180deg);color:#2563eb; }
        .hs-faq-body { padding:0 22px;max-height:0;overflow:hidden;transition:max-height .35s ease,padding .2s; }
        .hs-faq-body.open { max-height:300px;padding:0 22px 18px 50px; }
        .hs-faq-body p { font-size:14px;color:#475569;line-height:1.8; }

        .hs-no-results { padding:32px;text-align:center;color:#94a3b8; }
        .hs-no-results p { font-size:14px;margin-top:8px; }

        .hs-two-col { display:grid;grid-template-columns:1fr 1fr;gap:20px; }

        .hs-contact-form { padding:22px;display:flex;flex-direction:column;gap:14px; }
        .hs-label { font-size:13px;font-weight:600;color:#374151;margin-bottom:5px; }
        .hs-input,.hs-textarea {
          width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #e2e8f0;
          font-size:14px;color:#0f172a;background:#f8fafc;outline:none;
          transition:border .2s;box-sizing:border-box;font-family:inherit;
        }
        .hs-input:focus,.hs-textarea:focus { border-color:#2563eb;background:#fff; }
        .hs-textarea { resize:vertical;min-height:100px; }
        .hs-send-btn {
          width:100%;padding:13px;border-radius:12px;border:none;
          background:linear-gradient(135deg,#1d4ed8,#4f46e5);color:#fff;
          font-size:15px;font-weight:700;cursor:pointer;transition:all 0.2s;
          box-shadow:0 4px 14px rgba(29,78,216,.3);
        }
        .hs-send-btn:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 6px 20px rgba(29,78,216,.4); }
        .hs-send-btn:disabled { opacity:.5;cursor:not-allowed; }
        .hs-success-msg {
          background:#dcfce7;border:1px solid #86efac;border-radius:10px;
          padding:12px 16px;font-size:13px;color:#15803d;font-weight:600;
          display:flex;gap:8px;align-items:center;
        }

        .hs-contact-channels { padding:22px;display:flex;flex-direction:column;gap:14px; }
        .hs-channel {
          display:flex;align-items:center;gap:14px;padding:14px;border-radius:12px;
          background:#f8fafc;border:1px solid #f1f5f9;transition:all .2s;
        }
        .hs-channel:hover { background:#eff6ff;border-color:#bfdbfe; }
        .hs-ch-icon {
          width:42px;height:42px;border-radius:11px;display:flex;align-items:center;
          justify-content:center;font-size:20px;flex-shrink:0;
        }
        .hs-ch-info { flex:1; }
        .hs-ch-name  { font-size:14px;font-weight:600;color:#0f172a; }
        .hs-ch-value { font-size:13px;color:#2563eb;font-weight:600; }
        .hs-ch-hours { font-size:12px;color:#94a3b8; }

        .hs-emergency {
          background:linear-gradient(135deg,#ef4444,#dc2626);border-radius:16px;
          padding:24px;color:#fff;display:flex;align-items:center;gap:18px;
          box-shadow:0 8px 24px rgba(239,68,68,.3);
        }
        .hs-em-icon { font-size:40px;flex-shrink:0; }
        .hs-em-title { font-size:18px;font-weight:800;margin:0 0 4px; }
        .hs-em-sub   { font-size:14px;opacity:.9;margin:0 0 12px; }
        .hs-em-number { font-size:28px;font-weight:800;letter-spacing:2px; }
        .hs-em-tag  { font-size:12px;opacity:.8;margin-top:2px; }

        @media(max-width:700px){
          .hs-topbar{padding:14px 16px;}
          .hs-body{padding:16px 12px;}
          .hs-categories{grid-template-columns:repeat(2,1fr);}
          .hs-two-col{grid-template-columns:1fr;}
        }
      `}</style>

      <div className="hs-page">
        <header className="hs-topbar">
          <Link href="/dashboard" className="hs-back">←</Link>
          <div>
            <h1>Help & Support</h1>
            <p>Find answers or reach our team</p>
          </div>
        </header>

        <div className="hs-body">
          {/* Hero + Search */}
          <div className="hs-hero">
            <h2>How can we help you?</h2>
            <p>Search our knowledge base or browse by category below</p>
            <div className="hs-search">
              <span>🔍</span>
              <input
                placeholder="Search FAQs, topics…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="hs-categories">
            {CATEGORIES.map(c => (
              <div key={c.label} className="hs-cat" onClick={() => setSearch(c.label.split(' ')[0])}>
                <div className="hs-cat-icon">{c.icon}</div>
                <p className="hs-cat-label">{c.label}</p>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="hs-card">
            <div className="hs-card-header">
              <h3>❓ Frequently Asked Questions</h3>
              <p>{filtered.length} result{filtered.length !== 1 ? 's' : ''}{search && ` for "${search}"`}</p>
            </div>
            {filtered.length === 0 ? (
              <div className="hs-no-results">
                <p style={{fontSize:32}}>🤷</p>
                <p>No results found. Try different keywords or contact support below.</p>
              </div>
            ) : (
              filtered.map((f, i) => (
                <div className="hs-faq-item" key={i}>
                  <div className="hs-faq-header" onClick={() => setExpanded(prev => prev === i ? null : i)}>
                    <span style={{fontSize:16,flexShrink:0}}>💬</span>
                    <p className="hs-faq-q">{f.q}</p>
                    <span className={`hs-faq-arrow ${expanded === i ? 'open' : ''}`}>⌄</span>
                  </div>
                  <div className={`hs-faq-body ${expanded === i ? 'open' : ''}`}>
                    <p>{f.a}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Contact + Channels */}
          <div className="hs-two-col">
            <div className="hs-card">
              <div className="hs-card-header">
                <h3>✉️ Send Us a Message</h3>
                <p>We'll reply within 24 hours</p>
              </div>
              <div className="hs-contact-form">
                {msgSent && (
                  <div className="hs-success-msg">✅ Message sent! We'll get back to you soon.</div>
                )}
                <div>
                  <p className="hs-label">Subject</p>
                  <input className="hs-input" placeholder="e.g. Failed transaction, geo-block issue…" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))}/>
                </div>
                <div>
                  <p className="hs-label">Message</p>
                  <textarea className="hs-textarea" placeholder="Describe your issue in detail…" value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}/>
                </div>
                <button className="hs-send-btn" disabled={!form.subject || !form.message} onClick={handleSend}>
                  Send Message →
                </button>
              </div>
            </div>

            <div className="hs-card">
              <div className="hs-card-header">
                <h3>📞 Contact Channels</h3>
                <p>Reach us your preferred way</p>
              </div>
              <div className="hs-contact-channels">
                {[
                  { icon:'📧', bg:'#eff6ff', name:'Email Support',   value:'support@payshield.in',    hours:'Reply within 24 hours' },
                  { icon:'💬', bg:'#f0fdf4', name:'Live Chat',        value:'Available in-app',         hours:'Mon–Sat, 9 AM – 9 PM' },
                  { icon:'📞', bg:'#fef3c7', name:'Phone Support',    value:'1800-PAY-HELP',            hours:'Mon–Fri, 10 AM – 6 PM' },
                  { icon:'🐦', bg:'#eff6ff', name:'Twitter / X',      value:'@PayShieldIN',             hours:'Response within 2 hours' },
                ].map(ch => (
                  <div className="hs-channel" key={ch.name}>
                    <div className="hs-ch-icon" style={{background:ch.bg}}>{ch.icon}</div>
                    <div className="hs-ch-info">
                      <p className="hs-ch-name">{ch.name}</p>
                      <p className="hs-ch-value">{ch.value}</p>
                      <p className="hs-ch-hours">{ch.hours}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency */}
          <div className="hs-emergency">
            <span className="hs-em-icon">🚨</span>
            <div>
              <p className="hs-em-title">Account Compromised? Act Immediately.</p>
              <p className="hs-em-sub">Call our 24/7 emergency security line to instantly freeze your account.</p>
              <p className="hs-em-number">1800-PAY-SAFE</p>
              <p className="hs-em-tag">Free · Available 24/7 · Toll-free</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}