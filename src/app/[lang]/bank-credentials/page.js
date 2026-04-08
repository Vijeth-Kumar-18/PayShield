'use client';

import { useState } from 'react';
import AppIcon from '@/components/AppIcon';

const initialState = {
  userId: '',
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  ifsc: '',
  upiId: ''
};

export default function BankCredentialsPage() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('Encrypting and storing your credential payload...');

    try {
      const response = await fetch('/api/bank-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          accountNumber: form.accountNumber.trim(),
          ifsc: form.ifsc.trim().toUpperCase(),
          upiId: form.upiId.trim().toLowerCase()
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to store credentials.');
      }

      setStatus('success');
      setMessage(`Secure bank profile saved with record id: ${payload.id}`);
      setForm(initialState);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong while saving credentials.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box register-box">
        <div className="auth-header">
          <div className="auth-icon"><AppIcon name="bank" size={24} /></div>
          <h1>Bank Credential Vault</h1>
          <p>Sensitive banking attributes are encrypted client-side and persisted securely.</p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label>User ID</label>
            <input name="userId" value={form.userId} onChange={onChange} required className="form-input" />
          </div>

          <div className="form-group">
            <label>Bank Name</label>
            <input name="bankName" value={form.bankName} onChange={onChange} required className="form-input" />
          </div>

          <div className="form-group">
            <label>Account Holder</label>
            <input name="accountHolderName" value={form.accountHolderName} onChange={onChange} required className="form-input" />
          </div>

          <div className="form-group">
            <label>Account Number</label>
            <input name="accountNumber" value={form.accountNumber} onChange={onChange} required className="form-input" />
          </div>

          <div className="form-group">
            <label>IFSC Code</label>
            <input name="ifsc" value={form.ifsc} onChange={onChange} required className="form-input" />
          </div>

          <div className="form-group">
            <label>UPI ID</label>
            <input name="upiId" value={form.upiId} onChange={onChange} required className="form-input" />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Securing...' : 'Encrypt and Save'}
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: 16, color: status === 'error' ? '#b91c1c' : '#166534' }}>{message}</p>
        ) : null}
      </div>
    </div>
  );
}
