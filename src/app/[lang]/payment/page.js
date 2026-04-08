'use client';

import { useState } from 'react';

const initialState = {
  userId: '',
  amount: '',
  payee: '',
  locationCountry: 'India',
  locationCity: '',
  ipAddress: '',
  deviceDna: '',
  browserSignature: '',
  screenResolution: '',
  mouseShakeIntensity: 20,
  scrollSpeed: 500,
  paymentFrequency: 1,
  transferAllIntent: false
};

export default function PaymentPage() {
  const [form, setForm] = useState(initialState);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          mouseShakeIntensity: Number(form.mouseShakeIntensity),
          scrollSpeed: Number(form.scrollSpeed),
          paymentFrequency: Number(form.paymentFrequency)
        })
      });

      const data = await res.json();
      setResponse({ ok: res.ok, data });
    } catch (error) {
      setResponse({ ok: false, data: { error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container-narrow">
        <div className="page-header">
          <h1 className="page-title">Payment Gateway</h1>
          <p className="page-subtitle">Execute payments with behavioral risk scoring, device validation, and adaptive fraud controls.</p>
        </div>

        <form onSubmit={onSubmit} className="auth-form" style={{ marginBottom: 24 }}>
          <input className="form-input" name="userId" value={form.userId} onChange={onChange} placeholder="User ID" required />
          <input className="form-input" name="payee" value={form.payee} onChange={onChange} placeholder="Payee / UPI ID" required />
          <input className="form-input" name="amount" value={form.amount} onChange={onChange} placeholder="Amount" required />
          <input className="form-input" name="locationCountry" value={form.locationCountry} onChange={onChange} placeholder="Country" required />
          <input className="form-input" name="locationCity" value={form.locationCity} onChange={onChange} placeholder="City" required />
          <input className="form-input" name="ipAddress" value={form.ipAddress} onChange={onChange} placeholder="IP Address" required />
          <input className="form-input" name="deviceDna" value={form.deviceDna} onChange={onChange} placeholder="Device DNA" required />
          <input className="form-input" name="browserSignature" value={form.browserSignature} onChange={onChange} placeholder="Browser Signature" required />
          <input className="form-input" name="screenResolution" value={form.screenResolution} onChange={onChange} placeholder="Screen Resolution" required />

          <input className="form-input" name="mouseShakeIntensity" value={form.mouseShakeIntensity} onChange={onChange} placeholder="Mouse shake intensity (0-100)" required />
          <input className="form-input" name="scrollSpeed" value={form.scrollSpeed} onChange={onChange} placeholder="Scroll speed" required />
          <input className="form-input" name="paymentFrequency" value={form.paymentFrequency} onChange={onChange} placeholder="Payment frequency" required />

          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" name="transferAllIntent" checked={form.transferAllIntent} onChange={onChange} />
            Transfer all money intent
          </label>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Processing...' : 'Pay'}
          </button>
        </form>

        {response ? (
          <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
            {JSON.stringify(response.data, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
