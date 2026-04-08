'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Synthetic recent QR payments ────────────────────────────────────────────
const RECENT_QR = [
  { icon: '🛒', name: 'Amazon India',   upi: 'amazon@upi',       amount: '₹1,299', date: 'Today',        type: 'paid' },
  { icon: '🍕', name: 'Swiggy',         upi: 'swiggy@icici',     amount: '₹348',   date: 'Yesterday',    type: 'paid' },
  { icon: '👤', name: 'Rahul Sharma',   upi: 'rahul@oksbi',      amount: '₹5,000', date: 'Mar 18',       type: 'received' },
  { icon: '⛽', name: 'HP Petrol Bunk', upi: 'hppetrol@ybl',     amount: '₹2,100', date: 'Mar 18',       type: 'paid' },
  { icon: '👤', name: 'Priya Nair',     upi: 'priya@paytm',      amount: '₹3,500', date: 'Mar 17',       type: 'received' },
];

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ['Scan to Pay', 'My QR Code'];

// ─── Fake QR grid (SVG-style visual) ─────────────────────────────────────────
// Generates a deterministic-looking QR block pattern from a seed string
function QRPattern({ seed = 'payshield', size = 200 }) {
  const cells = 21;
  const cell  = size / cells;

  // Simple hash to get pseudo-random booleans
  const hash = (s, i) => {
    let h = 0;
    for (let j = 0; j < s.length; j++) h = (h * 31 + s.charCodeAt(j)) >>> 0;
    return ((h ^ (i * 2654435761)) >>> 0) % 3 !== 0;
  };

  const dots = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Always draw the 3 finder patterns (corners)
      const inFinder =
        (r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7);
      if (inFinder) continue;
      if (hash(seed, r * cells + c)) {
        dots.push(
          <rect
            key={`${r}-${c}`}
            x={c * cell} y={r * cell}
            width={cell - 1} height={cell - 1}
            rx={1} fill="#0f172a"
          />
        );
      }
    }
  }

  // Finder pattern helper
  const Finder = ({ x, y }) => (
    <g>
      <rect x={x} y={y} width={cell*7} height={cell*7} rx={3} fill="#0f172a"/>
      <rect x={x+cell} y={y+cell} width={cell*5} height={cell*5} rx={2} fill="#fff"/>
      <rect x={x+cell*2} y={y+cell*2} width={cell*3} height={cell*3} rx={1} fill="#0f172a"/>
    </g>
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff"/>
      {dots}
      <Finder x={0}               y={0} />
      <Finder x={(cells-7)*cell}  y={0} />
      <Finder x={0}               y={(cells-7)*cell} />
      {/* Centre logo */}
      <rect x={size/2-18} y={size/2-18} width={36} height={36} rx={8} fill="#1d4ed8"/>
      <text x={size/2} y={size/2+7} textAnchor="middle" fontSize={20} fill="#fff">🛡️</text>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QRPayment() {
  const [tab,         setTab]         = useState(0);
  const [scanning,    setScanning]    = useState(false);
  const [scanDone,    setScanDone]    = useState(false);
  const [upiInput,    setUpiInput]    = useState('');
  const [amount,      setAmount]      = useState('');
  const [note,        setNote]        = useState('');
  const [step,        setStep]        = useState('form');   // form | confirm | pin | success
  const [pin,         setPin]         = useState('');
  const [copied,      setCopied]      = useState(false);
  const [shareMsg,    setShareMsg]    = useState('');

  // Simulate scan
  const startScan = () => {
    setScanning(true);
    setScanDone(false);
    setTimeout(() => {
      setScanning(false);
      setScanDone(true);
      setUpiInput('merchant@oksbi');
    }, 2500);
  };

  const handleProceed = () => {
    if (!upiInput || !amount) return;
    setStep('confirm');
  };

  const handleConfirm = () => setStep('pin');

  const handlePin = (digit) => {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 6) {
      setTimeout(() => { setStep('success'); setPin(''); }, 600);
    }
  };

  const handleReset = () => {
    setStep('form'); setUpiInput(''); setAmount(''); setNote('');
    setPin(''); setScanDone(false);
  };

  const copyUPI = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    setShareMsg('QR shared successfully!');
    setTimeout(() => setShareMsg(''), 2000);
  };

  return (
    <>
      <style>{`
        .qr-page {
          min-height: 100vh; background: #f1f5f9;
          font-family: 'Segoe UI', sans-serif;
        }

        /* Topbar */
        .qr-topbar {
          background: #fff; border-bottom: 1px solid #e2e8f0;
          padding: 18px 32px; display: flex; align-items: center;
          justify-content: space-between; position: sticky; top: 0; z-index: 50;
        }
        .qr-topbar-left { display: flex; align-items: center; gap: 14px; }
        .qr-back {
          width: 38px; height: 38px; border-radius: 10px; border: 1px solid #e2e8f0;
          background: #f8fafc; display: flex; align-items: center; justify-content: center;
          text-decoration: none; font-size: 18px; color: #1e293b; transition: all 0.2s;
        }
        .qr-back:hover { background: #eff6ff; border-color: #bfdbfe; }
        .qr-topbar h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
        .qr-topbar p  { font-size: 13px; color: #64748b; margin: 0; }
        .qr-secure-pill {
          background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 600;
          padding: 6px 14px; border-radius: 20px; display: flex; align-items: center; gap: 5px;
        }
        .qr-secure-dot { width:7px;height:7px;background:#22c55e;border-radius:50%; animation: qrpulse 2s infinite; }
        @keyframes qrpulse { 0%,100%{opacity:1}50%{opacity:.4} }

        /* Body */
        .qr-body { max-width: 860px; margin: 0 auto; padding: 28px 20px; display: flex; flex-direction: column; gap: 24px; }

        /* Tabs */
        .qr-tabs {
          display: flex; background: #fff; border-radius: 14px;
          padding: 6px; gap: 6px; border: 1px solid #e2e8f0;
          width: fit-content;
        }
        .qr-tab {
          padding: 10px 28px; border-radius: 10px; border: none; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: all 0.2s; background: transparent; color: #64748b;
        }
        .qr-tab.active { background: #1d4ed8; color: #fff; box-shadow: 0 2px 8px rgba(29,78,216,.25); }
        .qr-tab:not(.active):hover { background: #f1f5f9; color: #1e293b; }

        /* Two-col layout */
        .qr-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        /* Card */
        .qr-card { background: #fff; border-radius: 18px; border: 1px solid #f1f5f9; box-shadow: 0 1px 4px rgba(0,0,0,.05); overflow: hidden; }
        .qr-card-header { padding: 18px 22px; border-bottom: 1px solid #f8fafc; }
        .qr-card-header h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
        .qr-card-header p  { font-size: 13px; color: #64748b; margin: 0; }

        /* ── SCAN TAB ── */

        /* Camera viewfinder */
        .qr-viewfinder {
          margin: 22px auto; width: 220px; height: 220px; position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .qr-vf-box {
          width: 200px; height: 200px; border-radius: 16px;
          background: #0f172a; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .qr-vf-corners span {
          position: absolute; width: 28px; height: 28px; border-color: #2563eb; border-style: solid;
        }
        .qr-vf-corners span:nth-child(1) { top:8px;left:8px;border-width:3px 0 0 3px;border-radius:6px 0 0 0; }
        .qr-vf-corners span:nth-child(2) { top:8px;right:8px;border-width:3px 3px 0 0;border-radius:0 6px 0 0; }
        .qr-vf-corners span:nth-child(3) { bottom:8px;left:8px;border-width:0 0 3px 3px;border-radius:0 0 0 6px; }
        .qr-vf-corners span:nth-child(4) { bottom:8px;right:8px;border-width:0 3px 3px 0;border-radius:0 0 6px 0; }
        .qr-scan-line {
          position: absolute; left: 16px; right: 16px; height: 2px;
          background: linear-gradient(90deg, transparent, #2563eb, transparent);
          animation: scanmove 2s ease-in-out infinite;
          box-shadow: 0 0 8px #2563eb;
        }
        @keyframes scanmove { 0%{top:20px}50%{top:160px}100%{top:20px} }
        .qr-scan-idle { color: #64748b; font-size: 32px; }
        .qr-scan-done { font-size: 48px; animation: popin .4s ease; }
        @keyframes popin { 0%{transform:scale(.5)}100%{transform:scale(1)} }

        .qr-scan-btn {
          display: block; width: calc(100% - 44px); margin: 0 22px 22px;
          padding: 13px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #1d4ed8, #4f46e5); color: #fff;
          font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(29,78,216,.3);
        }
        .qr-scan-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,78,216,.4); }
        .qr-scan-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        /* UPI form */
        .qr-form { padding: 22px; display: flex; flex-direction: column; gap: 16px; }
        .qr-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .qr-input {
          width: 100%; padding: 11px 14px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; font-size: 14px; color: #0f172a;
          background: #f8fafc; outline: none; transition: border 0.2s; box-sizing: border-box;
        }
        .qr-input:focus { border-color: #2563eb; background: #fff; }
        .qr-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .qr-proceed-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #1d4ed8, #4f46e5); color: #fff;
          font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(29,78,216,.3); margin-top: 4px;
        }
        .qr-proceed-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,78,216,.4); }
        .qr-proceed-btn:disabled { opacity:.5; cursor:not-allowed; }

        /* ── CONFIRM STEP ── */
        .qr-confirm { padding: 28px 22px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .qr-confirm-amt {
          font-size: 42px; font-weight: 800; color: #0f172a; letter-spacing: -1px;
        }
        .qr-confirm-to { font-size: 15px; color: #64748b; }
        .qr-confirm-to strong { color: #0f172a; }
        .qr-security-note {
          background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;
          padding: 12px 16px; width: 100%; font-size: 13px; color: #1d4ed8;
          display: flex; gap: 8px; align-items: flex-start;
        }
        .qr-confirm-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; }
        .qr-btn-cancel {
          padding: 12px; border-radius: 10px; border: 1.5px solid #e2e8f0;
          background: #fff; color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .qr-btn-cancel:hover { background: #f8fafc; }
        .qr-btn-pay {
          padding: 12px; border-radius: 10px; border: none;
          background: linear-gradient(135deg,#1d4ed8,#4f46e5); color: #fff;
          font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(29,78,216,.3);
        }
        .qr-btn-pay:hover { transform:translateY(-1px); }

        /* ── PIN STEP ── */
        .qr-pin-wrap { padding: 28px 22px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .qr-pin-title { font-size: 18px; font-weight: 700; color: #0f172a; }
        .qr-pin-sub   { font-size: 13px; color: #64748b; margin-top: -12px; text-align: center; }
        .qr-pin-dots  { display: flex; gap: 12px; }
        .qr-pin-dot {
          width: 16px; height: 16px; border-radius: 50%; border: 2px solid #cbd5e1;
          transition: all 0.2s;
        }
        .qr-pin-dot.filled { background: #1d4ed8; border-color: #1d4ed8; }
        .qr-pin-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; width: 240px; }
        .qr-pin-key {
          height: 56px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff;
          font-size: 20px; font-weight: 700; color: #0f172a; cursor: pointer; transition: all 0.15s;
        }
        .qr-pin-key:hover { background: #eff6ff; border-color: #bfdbfe; }
        .qr-pin-key:active { transform: scale(.95); }
        .qr-pin-del { background: #fef2f2; border-color: #fca5a5; color: #ef4444; font-size: 16px; }

        /* ── SUCCESS STEP ── */
        .qr-success { padding: 40px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .qr-success-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg,#10b981,#059669);
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; box-shadow: 0 8px 24px rgba(16,185,129,.35);
          animation: popin .5s ease;
        }
        .qr-success h2 { font-size: 22px; font-weight: 800; color: #0f172a; }
        .qr-success-amt { font-size: 38px; font-weight: 800; color: #10b981; letter-spacing:-1px; }
        .qr-success-to  { font-size: 14px; color: #64748b; }
        .qr-success-to strong { color: #0f172a; }
        .qr-txn-id {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 10px 20px; font-size: 13px; color: #64748b; font-family: monospace;
        }
        .qr-success-enc {
          background: #dcfce7; border: 1px solid #86efac; border-radius: 10px;
          padding: 10px 16px; font-size: 13px; color: #15803d;
          display: flex; gap: 8px; align-items: center; width: 100%; max-width: 340px;
        }
        .qr-new-pay {
          margin-top: 8px; padding: 12px 32px; border-radius: 12px; border: none;
          background: linear-gradient(135deg,#1d4ed8,#4f46e5); color: #fff;
          font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(29,78,216,.3);
        }
        .qr-new-pay:hover { transform:translateY(-1px); }

        /* ── MY QR CODE TAB ── */
        .qr-myqr-wrap { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 28px 22px; }
        .qr-myqr-card {
          background: linear-gradient(135deg,#1d4ed8 0%,#4f46e5 60%,#7c3aed 100%);
          border-radius: 20px; padding: 28px; display: flex; flex-direction: column;
          align-items: center; gap: 14px; box-shadow: 0 10px 40px rgba(37,99,235,.3);
          color: #fff; width: 100%; max-width: 320px;
        }
        .qr-myqr-name { font-size: 18px; font-weight: 800; }
        .qr-myqr-upi  { font-size: 13px; opacity: .8; }
        .qr-myqr-box  {
          background: #fff; border-radius: 16px; padding: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,.15);
        }
        .qr-myqr-tag {
          background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.2);
          border-radius: 10px; padding: 6px 14px; font-size: 12px; font-weight: 600;
        }
        .qr-myqr-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 320px; }
        .qr-myqr-btn {
          padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; border: 1.5px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .qr-myqr-btn.primary { background: linear-gradient(135deg,#1d4ed8,#4f46e5); color:#fff; border:none; box-shadow:0 4px 12px rgba(29,78,216,.3); }
        .qr-myqr-btn.primary:hover { transform:translateY(-1px); }
        .qr-myqr-btn.secondary { background: #fff; color: #1e293b; }
        .qr-myqr-btn.secondary:hover { background: #f1f5f9; }
        .qr-copy-confirm { font-size: 13px; color: #10b981; font-weight: 600; text-align:center; min-height:20px; }

        /* Recent QR */
        .qr-recent-item {
          display: flex; align-items: center; gap: 14px;
          padding: 13px 22px; border-bottom: 1px solid #f8fafc; transition: background .15s;
        }
        .qr-recent-item:last-child { border-bottom: none; }
        .qr-recent-item:hover { background: #fafbff; }
        .qr-ri-icon {
          width: 40px; height: 40px; border-radius: 11px; background: #eff6ff;
          display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
        }
        .qr-ri-info { flex:1; min-width:0; }
        .qr-ri-name { font-size:14px; font-weight:600; color:#0f172a; }
        .qr-ri-upi  { font-size:12px; color:#94a3b8; margin-top:1px; }
        .qr-ri-right { text-align:right; }
        .qr-ri-amt  { font-size:14px; font-weight:700; }
        .qr-ri-amt.paid     { color:#ef4444; }
        .qr-ri-amt.received { color:#10b981; }
        .qr-ri-date { font-size:12px; color:#94a3b8; margin-top:1px; }

        @media (max-width:768px) {
          .qr-two-col { grid-template-columns:1fr; }
          .qr-topbar  { padding:14px 16px; }
          .qr-body    { padding:16px 12px; }
          .qr-input-row { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="qr-page">
        {/* Topbar */}
        <header className="qr-topbar">
          <div className="qr-topbar-left">
            <Link href="/dashboard" className="qr-back">←</Link>
            <div>
              <h1>QR Payment</h1>
              <p>Scan to pay or show your QR to receive money</p>
            </div>
          </div>
          <div className="qr-secure-pill">
            <span className="qr-secure-dot"/>
            AES-256 Secured
          </div>
        </header>

        <div className="qr-body">
          {/* Tabs */}
          <div className="qr-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`qr-tab ${tab === i ? 'active' : ''}`} onClick={() => { setTab(i); handleReset(); }}>
                {i === 0 ? '📷 ' : '🪪 '}{t}
              </button>
            ))}
          </div>

          {/* ── TAB 0: Scan to Pay ── */}
          {tab === 0 && (
            <div className="qr-two-col">

              {/* Left — scanner + form */}
              <div className="qr-card">
                <div className="qr-card-header">
                  <h3>📷 Scan QR Code</h3>
                  <p>Point your camera at any UPI QR code</p>
                </div>

                {(step === 'form') && (
                  <>
                    {/* Viewfinder */}
                    <div className="qr-viewfinder">
                      <div className="qr-vf-box">
                        <div className="qr-vf-corners">
                          <span/><span/><span/><span/>
                        </div>
                        {scanning && <div className="qr-scan-line"/>}
                        {!scanning && !scanDone && <span className="qr-scan-idle">📷</span>}
                        {scanDone && <span className="qr-scan-done">✅</span>}
                      </div>
                    </div>

                    <button
                      className="qr-scan-btn"
                      onClick={startScan}
                      disabled={scanning}
                    >
                      {scanning ? '🔍 Scanning…' : scanDone ? '🔄 Scan Again' : '📷 Start Camera Scan'}
                    </button>

                    {/* Manual / auto-filled form */}
                    <div className="qr-form">
                      <div>
                        <p className="qr-label">UPI ID / VPA</p>
                        <input
                          className="qr-input"
                          placeholder="e.g. name@okaxis"
                          value={upiInput}
                          onChange={e => setUpiInput(e.target.value)}
                        />
                      </div>
                      <div className="qr-input-row">
                        <div>
                          <p className="qr-label">Amount (₹)</p>
                          <input
                            className="qr-input"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                          />
                        </div>
                        <div>
                          <p className="qr-label">Note (optional)</p>
                          <input
                            className="qr-input"
                            placeholder="For rent, food…"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        className="qr-proceed-btn"
                        onClick={handleProceed}
                        disabled={!upiInput || !amount}
                      >
                        Proceed to Pay →
                      </button>
                    </div>
                  </>
                )}

                {/* Confirm step */}
                {step === 'confirm' && (
                  <div className="qr-confirm">
                    <p style={{fontSize:13,color:'#64748b'}}>You are paying</p>
                    <p className="qr-confirm-amt">₹{Number(amount).toLocaleString('en-IN')}</p>
                    <p className="qr-confirm-to">To: <strong>{upiInput}</strong>{note && ` · ${note}`}</p>
                    <div className="qr-security-note">
                      🔒 Transaction will be AES-256 encrypted and verified via your Device DNA before processing.
                    </div>
                    <div className="qr-confirm-btns">
                      <button className="qr-btn-cancel" onClick={handleReset}>Cancel</button>
                      <button className="qr-btn-pay"    onClick={handleConfirm}>Enter UPI PIN →</button>
                    </div>
                  </div>
                )}

                {/* PIN step */}
                {step === 'pin' && (
                  <div className="qr-pin-wrap">
                    <p className="qr-pin-title">🔐 Enter UPI PIN</p>
                    <p className="qr-pin-sub">Paying ₹{Number(amount).toLocaleString('en-IN')} to {upiInput}</p>
                    <div className="qr-pin-dots">
                      {[0,1,2,3,4,5].map(i => (
                        <div key={i} className={`qr-pin-dot ${i < pin.length ? 'filled' : ''}`}/>
                      ))}
                    </div>
                    <div className="qr-pin-grid">
                      {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
                        k === '' ? <div key={i}/> :
                        <button
                          key={i}
                          className={`qr-pin-key ${k==='⌫'?'qr-pin-del':''}`}
                          onClick={() => k === '⌫' ? setPin(p => p.slice(0,-1)) : handlePin(k)}
                        >{k}</button>
                      ))}
                    </div>
                    <button className="qr-btn-cancel" style={{width:'100%',maxWidth:240}} onClick={handleReset}>Cancel</button>
                  </div>
                )}

                {/* Success step */}
                {step === 'success' && (
                  <div className="qr-success">
                    <div className="qr-success-icon">✅</div>
                    <h2>Payment Successful!</h2>
                    <p className="qr-success-amt">₹{Number(amount).toLocaleString('en-IN')}</p>
                    <p className="qr-success-to">Paid to <strong>{upiInput}</strong></p>
                    <p className="qr-txn-id">TXN ID: TXN{Date.now().toString().slice(-10)}</p>
                    <div className="qr-success-enc">
                      🔒 Payment encrypted with AES-256 & verified via PayShield
                    </div>
                    <button className="qr-new-pay" onClick={handleReset}>Make Another Payment</button>
                  </div>
                )}
              </div>

              {/* Right — recent QR payments */}
              <div className="qr-card">
                <div className="qr-card-header">
                  <h3>🕒 Recent QR Payments</h3>
                  <p>Your last 5 QR transactions</p>
                </div>
                {RECENT_QR.map((r, i) => (
                  <div className="qr-recent-item" key={i}>
                    <div className="qr-ri-icon">{r.icon}</div>
                    <div className="qr-ri-info">
                      <p className="qr-ri-name">{r.name}</p>
                      <p className="qr-ri-upi">{r.upi}</p>
                    </div>
                    <div className="qr-ri-right">
                      <p className={`qr-ri-amt ${r.type}`}>
                        {r.type === 'paid' ? '-' : '+'}{r.amount}
                      </p>
                      <p className="qr-ri-date">{r.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 1: My QR Code ── */}
          {tab === 1 && (
            <div className="qr-two-col">
              <div className="qr-card">
                <div className="qr-card-header">
                  <h3>🪪 Your PayShield QR</h3>
                  <p>Share this to receive money instantly</p>
                </div>
                <div className="qr-myqr-wrap">
                  <div className="qr-myqr-card">
                    <p className="qr-myqr-name">Y G Pavan</p>
                    <p className="qr-myqr-upi">pavan@payshield · SBI</p>
                    <div className="qr-myqr-box">
                      <QRPattern seed="ygpavan-payshield-4sf23is123" size={180}/>
                    </div>
                    <span className="qr-myqr-tag">🔒 PayShield Verified</span>
                  </div>

                  <div className="qr-myqr-actions">
                    <button className="qr-myqr-btn primary" onClick={handleShare}>
                      📤 Share QR
                    </button>
                    <button className="qr-myqr-btn secondary" onClick={copyUPI}>
                      {copied ? '✅ Copied!' : '📋 Copy UPI ID'}
                    </button>
                  </div>
                  <p className="qr-copy-confirm">{shareMsg}</p>

                  <div style={{background:'#eff6ff',borderRadius:12,padding:'14px 16px',width:'100%',maxWidth:320,fontSize:13,color:'#1d4ed8',border:'1px solid #bfdbfe'}}>
                    🛡️ Your QR is cryptographically signed. Any tampering is automatically detected by PayShield.
                  </div>
                </div>
              </div>

              {/* Right — recent received */}
              <div className="qr-card">
                <div className="qr-card-header">
                  <h3>💰 Received via QR</h3>
                  <p>Payments others made to your QR</p>
                </div>
                {RECENT_QR.filter(r => r.type === 'received').map((r, i) => (
                  <div className="qr-recent-item" key={i}>
                    <div className="qr-ri-icon">{r.icon}</div>
                    <div className="qr-ri-info">
                      <p className="qr-ri-name">{r.name}</p>
                      <p className="qr-ri-upi">{r.upi}</p>
                    </div>
                    <div className="qr-ri-right">
                      <p className="qr-ri-amt received">+{r.amount}</p>
                      <p className="qr-ri-date">{r.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}