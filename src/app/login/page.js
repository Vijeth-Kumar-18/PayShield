'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppIcon from '@/components/AppIcon';
import { performSystemCheck } from '@/lib/auth/systemCheck';
import { checkGSMModule } from '@/lib/auth/gsmCheck';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);
  const [gsmInfo, setGsmInfo] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [userId, setUserId] = useState(null);
  const [securityStatus, setSecurityStatus] = useState(null);

  useEffect(() => {
    // Perform system and GSM checks on component mount
    const runSecurityChecks = async () => {
      try {
        const systemCheck = await performSystemCheck();
        const gsmCheck = await checkGSMModule();
        setSystemInfo(systemCheck);
        setGsmInfo(gsmCheck);
        
        // Update security status for display
        if (gsmCheck.isEmulator?.isEmulator) {
          setSecurityStatus({
            level: 'warning',
            message: '⚠️ Emulator detected. Some features may be restricted.',
            score: gsmCheck.securityScore
          });
        } else if (gsmCheck.isMobileDevice?.isPhone && gsmCheck.hasSIMCapability?.hasSIM) {
          setSecurityStatus({
            level: 'success',
            message: '✓ Secure mobile device verified',
            score: gsmCheck.securityScore
          });
        } else if (gsmCheck.isMobileDevice?.isPhone) {
          setSecurityStatus({
            level: 'info',
            message: 'ℹ️ Mobile device detected. SIM verification recommended.',
            score: gsmCheck.securityScore
          });
        } else {
          setSecurityStatus({
            level: 'info',
            message: 'Desktop device - Additional verification may be required',
            score: gsmCheck.securityScore
          });
        }
        
        console.log('System Check:', systemCheck);
        console.log('GSM Check:', gsmCheck);
      } catch (err) {
        console.error('Security check failed:', err);
      }
    };
    
    runSecurityChecks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const deviceInfo = {
        systemInfo,
        gsmInfo,
        timestamp: new Date().toISOString(),
      };
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          deviceInfo,
          ipAddress: await getIPAddress(),
          userAgent: navigator.userAgent,
        }),
      });
      
      const data = await response.json();
      
      console.log('Login response:', data);
      
      if (response.ok) {
        if (data.requiresTwoFactor) {
          setShow2FA(true);
          setUserId(data.userId);
        } else if (data.success) {
          // Save tokens and user info
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('userEmail', data.user.email);
          localStorage.setItem('userName', data.user.fullName || data.user.email.split('@')[0]);
          console.log('Token and user info saved, redirecting...');
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp: twoFACode }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.fullName || data.user.email.split('@')[0]);
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Invalid 2FA code');
      }
    } catch (err) {
      setError('2FA verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 2FA Screen
  if (show2FA) {
    return (
      <>
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-header">
              <div className="auth-icon"><AppIcon name="shieldCheck" size={24} /></div>
              <h1>Two-Factor Authentication</h1>
              <p>Enter the verification code sent to your phone</p>
            </div>

            <form onSubmit={handle2FASubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="2fa">Verification Code</label>
                <input
                  type="text"
                  id="2fa"
                  name="2fa"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                />
              </div>

              {error && (
                <div className="error-message" style={{color: 'red', fontSize: '14px', marginBottom: '15px'}}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // Main Login Screen
  return (
    <>
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <div className="auth-icon"><AppIcon name="shieldCheck" size={24} /></div>
            <h1>Welcome Back</h1>
            <p>Sign in to access your secure payment workspace.</p>
          </div>

          {/* Security Status Badge - Added */}
          {securityStatus && (
            <div className={`security-status-badge status-${securityStatus.level}`} style={{
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '12px',
              backgroundColor: securityStatus.level === 'success' ? '#d4edda' : 
                              securityStatus.level === 'warning' ? '#fff3cd' : '#d1ecf1',
              color: securityStatus.level === 'success' ? '#155724' : 
                     securityStatus.level === 'warning' ? '#856404' : '#0c5460',
              border: `1px solid ${securityStatus.level === 'success' ? '#c3e6cb' : 
                                    securityStatus.level === 'warning' ? '#ffeeba' : '#bee5d4'}`
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>{securityStatus.message}</span>
                <span style={{fontWeight: 'bold'}}>Score: {securityStatus.score}/100</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="error-message" style={{color: 'red', fontSize: '14px', marginBottom: '15px'}}>
                {error}
              </div>
            )}

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login Securely'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="social-login">
            <button className="btn btn-social">
              <span><AppIcon name="scan" size={16} /></span>
              Continue with biometric verification
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link href="/register" className="text-link-bold">
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="security-badge">
            <span className="badge-icon"><AppIcon name="lock" size={16} /></span>
            <div className="badge-text">
              <strong>Protected by 7-Layer Security</strong>
              <p>Session and credential validation run in real time.</p>
            </div>
          </div>
        </div>

        <div className="auth-features">
          <h3>Why Login with PayShield?</h3>
          <div className="feature-list-compact">
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>Salt & Pepper encryption</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>Device DNA verification</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>Real-time threat detection</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>Behavioral analytics</span>
            </div>
          </div>
          
          {/* GSM Security Info - Added */}
          {gsmInfo && gsmInfo.isMobileDevice?.isPhone && (
            <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '12px'}}>
              <div style={{fontWeight: 'bold', marginBottom: '5px'}}>📱 Device Security Info</div>
              <div>• Mobile Device: {gsmInfo.isMobileDevice.isPhone ? 'Yes' : 'No'}</div>
              <div>• SIM Detected: {gsmInfo.hasSIMCapability?.hasSIM ? 'Yes' : 'No'}</div>
              {gsmInfo.hasSIMCapability?.carrier && <div>• Carrier: {gsmInfo.hasSIMCapability.carrier}</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}