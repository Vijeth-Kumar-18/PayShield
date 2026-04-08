'use client';

import { useState } from 'react';
import Link from 'next/link';

const TERMS_SECTIONS = [
  {
    id: 1, icon: '📋', title: 'Acceptance of Terms',
    content: `By accessing or using PayShield, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our platform. We reserve the right to update these terms at any time, and continued use of the platform constitutes acceptance of the revised terms.`,
  },
  {
    id: 2, icon: '🛡️', title: 'Use of the Platform',
    content: `PayShield is designed exclusively for legitimate UPI payment transactions. You agree not to use the platform for any fraudulent, illegal, or unauthorized activity. Any attempt to reverse-engineer, tamper with, or exploit our AI security systems is strictly prohibited and may result in immediate account termination and legal action.`,
  },
  {
    id: 3, icon: '🔐', title: 'Account Security',
    content: `You are responsible for maintaining the confidentiality of your UPI PIN and device credentials. PayShield implements Device DNA authentication — your account is bound to your registered device. If you lose your device, you must immediately contact support. PayShield will never ask for your UPI PIN via call, SMS, or email.`,
  },
  {
    id: 4, icon: '💸', title: 'Transaction Liability',
    content: `PayShield is not liable for losses arising from unauthorized transactions if the user has shared their credentials or PIN. However, transactions flagged and blocked by our AI system are fully protected. In the event of a disputed transaction, users must raise a grievance within 30 days of the transaction date.`,
  },
  {
    id: 5, icon: '🍯', title: 'Honeypot & Security Systems',
    content: `PayShield operates proactive decoy (Honeypot) systems to detect and trap unauthorized access attempts. By using PayShield, you acknowledge that suspicious login attempts will be automatically redirected to these decoy environments for threat analysis. Information collected from attackers may be shared with law enforcement agencies.`,
  },
  {
    id: 6, icon: '⚖️', title: 'Governing Law',
    content: `These Terms are governed by the laws of India. Any disputes arising from the use of PayShield shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka. PayShield complies with all applicable RBI and NPCI guidelines for UPI payment systems.`,
  },
];

const PRIVACY_SECTIONS = [
  {
    id: 1, icon: '📊', title: 'Data We Collect',
    content: `We collect: (a) Identity data — name, email, phone number, and bank account information provided during registration. (b) Device data — Device DNA fingerprint, IP address, and geolocation for security authentication. (c) Behavioural data — typing rhythm, mouse movement patterns, and transaction timing used exclusively for AI anomaly detection.`,
  },
  {
    id: 2, icon: '🔒', title: 'How We Protect Your Data',
    content: `All sensitive credentials are hashed using Argon2id with a unique 16-byte Salt per user and a server-side Pepper stored in a Hardware Security Module (HSM). All payment data in transit is encrypted using AES-256. We do not store your UPI PIN at any point — it is processed only by the UPI network.`,
  },
  {
    id: 3, icon: '🚫', title: 'Data We Never Sell',
    content: `PayShield does not sell, rent, or trade your personal data to any third party for marketing purposes. Your behavioural and financial data is used exclusively for fraud detection and security within our platform. We do not use your data for targeted advertising.`,
  },
  {
    id: 4, icon: '🌍', title: 'Data Retention & Location',
    content: `Your data is stored on servers located within India in compliance with the Digital Personal Data Protection Act, 2023. Transaction logs are retained for 5 years as mandated by RBI guidelines. Behavioural data used for AI training is anonymised and retained for up to 2 years.`,
  },
  {
    id: 5, icon: '👤', title: 'Your Rights',
    content: `You have the right to: access your personal data, request corrections, request deletion (subject to legal retention requirements), and opt out of non-essential data processing. To exercise these rights, contact our Data Protection Officer at dpo@payshield.in.`,
  },
  {
    id: 6, icon: '🍪', title: 'Cookies & Tracking',
    content: `PayShield uses only essential session cookies required for secure authentication. We do not use third-party tracking cookies or analytics pixels. Your session data is encrypted and automatically cleared upon logout.`,
  },
];

export default function TermsPrivacy() {
  const [activeTab, setActiveTab] = useState('terms');
  const [expanded, setExpanded]   = useState(null);

  const sections = activeTab === 'terms' ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <>
      <style>{`
        .tp-page { min-height:100vh; background:#f1f5f9; font-family:'Segoe UI',sans-serif; }

        .tp-topbar {
          background:#fff; border-bottom:1px solid #e2e8f0;
          padding:18px 32px; display:flex; align-items:center;
          justify-content:space-between; position:sticky; top:0; z-index:50;
        }
        .tp-topbar-left { display:flex; align-items:center; gap:14px; }
        .tp-back {
          width:38px;height:38px;border-radius:10px;border:1px solid #e2e8f0;
          background:#f8fafc;display:flex;align-items:center;justify-content:center;
          text-decoration:none;font-size:18px;color:#1e293b;transition:all 0.2s;
        }
        .tp-back:hover { background:#eff6ff;border-color:#bfdbfe; }
        .tp-topbar h1 { font-size:20px;font-weight:700;color:#0f172a;margin:0; }
        .tp-topbar p  { font-size:13px;color:#64748b;margin:0; }
        .tp-date { font-size:12px;color:#94a3b8;background:#f8fafc;padding:5px 12px;border-radius:8px;border:1px solid #e2e8f0; }

        .tp-body { max-width:820px;margin:0 auto;padding:28px 20px;display:flex;flex-direction:column;gap:24px; }

        .tp-hero {
          background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 50%,#7c3aed 100%);
          border-radius:20px;padding:32px;color:#fff;
          display:flex;align-items:center;gap:20px;
          box-shadow:0 10px 40px rgba(37,99,235,.3);
        }
        .tp-hero-icon { font-size:52px;flex-shrink:0; }
        .tp-hero h2  { font-size:22px;font-weight:800;margin:0 0 6px; }
        .tp-hero p   { font-size:14px;opacity:.85;margin:0;line-height:1.6; }

        .tp-tabs {
          display:flex;background:#fff;border-radius:14px;padding:6px;gap:6px;
          border:1px solid #e2e8f0;width:fit-content;
        }
        .tp-tab {
          padding:10px 28px;border-radius:10px;border:none;font-size:14px;
          font-weight:600;cursor:pointer;transition:all 0.2s;background:transparent;color:#64748b;
        }
        .tp-tab.active { background:#1d4ed8;color:#fff;box-shadow:0 2px 8px rgba(29,78,216,.25); }
        .tp-tab:not(.active):hover { background:#f1f5f9;color:#1e293b; }

        .tp-last-updated {
          background:#fff;border-radius:12px;padding:14px 18px;
          border:1px solid #e2e8f0;font-size:13px;color:#64748b;
          display:flex;align-items:center;gap:8px;
        }

        .tp-accordion { display:flex;flex-direction:column;gap:10px; }
        .tp-acc-item {
          background:#fff;border-radius:14px;border:1px solid #f1f5f9;
          box-shadow:0 1px 3px rgba(0,0,0,.04);overflow:hidden;transition:box-shadow 0.2s;
        }
        .tp-acc-item:hover { box-shadow:0 4px 14px rgba(0,0,0,.08); }
        .tp-acc-header {
          display:flex;align-items:center;gap:14px;padding:16px 20px;
          cursor:pointer;user-select:none;
        }
        .tp-acc-icon {
          width:42px;height:42px;border-radius:11px;background:#eff6ff;
          display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;
        }
        .tp-acc-title { flex:1;font-size:15px;font-weight:700;color:#0f172a; }
        .tp-acc-num { font-size:12px;color:#94a3b8;font-weight:600;margin-right:4px; }
        .tp-acc-arrow { font-size:18px;color:#94a3b8;transition:transform 0.3s;flex-shrink:0; }
        .tp-acc-arrow.open { transform:rotate(180deg);color:#2563eb; }
        .tp-acc-body {
          padding:0 20px;max-height:0;overflow:hidden;transition:max-height 0.35s ease,padding 0.2s;
        }
        .tp-acc-body.open { max-height:400px;padding:0 20px 20px; }
        .tp-acc-body p { font-size:14px;color:#475569;line-height:1.8; }

        .tp-bottom-note {
          background:#fff;border-radius:14px;padding:20px;border:1px solid #e2e8f0;
          display:flex;gap:14px;align-items:flex-start;
        }
        .tp-bottom-icon { font-size:28px;flex-shrink:0; }
        .tp-bottom-note h4 { font-size:14px;font-weight:700;color:#0f172a;margin:0 0 4px; }
        .tp-bottom-note p  { font-size:13px;color:#64748b;margin:0;line-height:1.6; }
        .tp-contact-link { color:#2563eb;font-weight:600;text-decoration:none; }
        .tp-contact-link:hover { text-decoration:underline; }

        @media(max-width:600px){
          .tp-topbar{padding:14px 16px;}
          .tp-body{padding:16px 12px;}
          .tp-hero{flex-direction:column;text-align:center;}
          .tp-tabs{width:100%;}
          .tp-tab{flex:1;text-align:center;padding:10px 8px;}
        }
      `}</style>

      <div className="tp-page">
        <header className="tp-topbar">
          <div className="tp-topbar-left">
            <Link href="/dashboard" className="tp-back">←</Link>
            <div>
              <h1>Legal & Policies</h1>
              <p>Terms of Service & Privacy Policy</p>
            </div>
          </div>
          <span className="tp-date">Last updated: March 2026</span>
        </header>

        <div className="tp-body">
          {/* Hero */}
          <div className="tp-hero">
            <span className="tp-hero-icon">{activeTab === 'terms' ? '⚖️' : '🔐'}</span>
            <div>
              <h2>{activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h2>
              <p>
                {activeTab === 'terms'
                  ? 'These terms govern your use of PayShield. Please read them carefully before using our platform.'
                  : 'We take your privacy seriously. Here is exactly what data we collect, how we protect it, and your rights.'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="tp-tabs">
            <button className={`tp-tab ${activeTab === 'terms' ? 'active' : ''}`} onClick={() => { setActiveTab('terms'); setExpanded(null); }}>
              ⚖️ Terms of Service
            </button>
            <button className={`tp-tab ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => { setActiveTab('privacy'); setExpanded(null); }}>
              🔐 Privacy Policy
            </button>
          </div>

          <div className="tp-last-updated">
            📅 These {activeTab === 'terms' ? 'Terms' : 'Policies'} were last updated on <strong>20 March 2026</strong> and comply with RBI, NPCI, and DPDP Act 2023 guidelines.
          </div>

          {/* Accordion */}
          <div className="tp-accordion">
            {sections.map(s => (
              <div className="tp-acc-item" key={s.id}>
                <div className="tp-acc-header" onClick={() => toggle(s.id)}>
                  <div className="tp-acc-icon">{s.icon}</div>
                  <p className="tp-acc-title">
                    <span className="tp-acc-num">{s.id}.</span> {s.title}
                  </p>
                  <span className={`tp-acc-arrow ${expanded === s.id ? 'open' : ''}`}>⌄</span>
                </div>
                <div className={`tp-acc-body ${expanded === s.id ? 'open' : ''}`}>
                  <p>{s.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div className="tp-bottom-note">
            <span className="tp-bottom-icon">📬</span>
            <div>
              <h4>Questions about our {activeTab === 'terms' ? 'Terms' : 'Privacy Policy'}?</h4>
              <p>
                Contact our legal team at{' '}
                <a href="mailto:legal@payshield.in" className="tp-contact-link">legal@payshield.in</a>
                {activeTab === 'privacy' && <> or our Data Protection Officer at <a href="mailto:dpo@payshield.in" className="tp-contact-link">dpo@payshield.in</a></>}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}