'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppIcon from '@/components/AppIcon';
import BehaviorCollector from '@/lib/behavior/collector';
import {
  collectDeviceFingerprint,
  getClientNetworkInfo,
  getOrCreateDeviceKeyPair,
  signChallenge
} from '@/lib/security/clientDevice';

import { startAuthentication } from '@simplewebauthn/browser';

export default function Login() {
  const params = useParams();
  const router = useRouter();
  const currentLang = params?.lang || 'en';
  const [dict, setDict] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const loginDict = dict.auth?.login || {};
  const commonDict = dict.common || {};

  const behaviorCollector = React.useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !behaviorCollector.current) {
      behaviorCollector.current = new BehaviorCollector();
      behaviorCollector.current.startTracking();
    }
    return () => {
      if (behaviorCollector.current) {
        behaviorCollector.current.stopTracking();
      }
    };
  }, []);

  useEffect(() => {
    import(`@/i18n/dictionaries/${currentLang}.json`)
      .then((module) => setDict(module.default || {}))
      .catch(() => import('@/i18n/dictionaries/en.json').then((m) => setDict(m.default || {})));
  }, [currentLang]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const device = collectDeviceFingerprint();
      const network = getClientNetworkInfo();
      const behaviorData = behaviorCollector.current?.getData() || {};
      const keyPair = await getOrCreateDeviceKeyPair();

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          deviceDna: device.deviceDna,
          ipAddress: network.ipAddress,
          locationCountry: network.locationCountry,
          locationCity: network.locationCity,
          browserSignature: device.browserSignature,
          screenResolution: device.screenResolution,
          networkHints: '',
          behaviorData
        })
      });

      const loginPayload = await loginResponse.json();
      if (!loginResponse.ok) {
        throw new Error(loginPayload.error || 'Login failed.');
      }

      // Legacy/direct login flow: backend returns ready-to-use tokens.
      if (loginPayload.token) {
        localStorage.setItem('ps_session_token', loginPayload.token);
        localStorage.setItem('token', loginPayload.token);

        if (loginPayload.refreshToken) {
          localStorage.setItem('refreshToken', loginPayload.refreshToken);
        }

        if (loginPayload.user?.id) {
          localStorage.setItem('ps_user_id', String(loginPayload.user.id));
        }

        if (loginPayload.user?.email) {
          localStorage.setItem('ps_user_email', loginPayload.user.email);
        }

        if (loginPayload.user?.name) {
          localStorage.setItem('ps_user_name', loginPayload.user.name);
        }

        if (loginPayload.user?.phone) {
          localStorage.setItem('ps_user_phone', loginPayload.user.phone);
        }

        setMessageType('success');
        setMessage('Login successful. Redirecting...');

        setTimeout(() => {
          router.push(`/${currentLang}/dashboard`);
        }, 500);

        return;
      }

      if (!loginPayload.challenge || !loginPayload.challengeId) {
        throw new Error('Login challenge data missing from server response.');
      }

      const signature = await signChallenge(keyPair.privateKey, loginPayload.challenge);

      const challengeResponse = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: loginPayload.challengeId,
          signature,
          ipAddress: network.ipAddress,
          locationCountry: network.locationCountry,
          locationCity: network.locationCity,
          browserSignature: device.browserSignature,
          screenResolution: device.screenResolution,
          deviceDna: device.deviceDna,
          devicePublicKeyPem: keyPair.publicPem,
          trustedDeviceName: 'Browser Device'
        })
      });

      const authPayload = await challengeResponse.json();
      if (!challengeResponse.ok) {
        throw new Error(authPayload.error || 'Device challenge verification failed.');
      }

      localStorage.setItem('ps_session_token', authPayload.sessionToken);
      localStorage.setItem('ps_user_id', authPayload.user.id);
      localStorage.setItem('ps_user_email', authPayload.user.email);
      localStorage.setItem('ps_user_name', authPayload.user.name);
      localStorage.setItem('ps_verification_id', authPayload.verification?.id || '');
      if (authPayload.verification?.devEmailOtp) {
        localStorage.setItem('ps_dev_email_otp', authPayload.verification.devEmailOtp);
      }

      if (authPayload.verification?.devSmsOtp) {
        localStorage.setItem('ps_dev_sms_otp', authPayload.verification.devSmsOtp);
      }

      setMessageType('success');
      setMessage('Primary login complete. Redirecting to multi-factor verification...');

      setTimeout(() => {
        router.push(`/${currentLang}/verify?verificationId=${authPayload.verification?.id || ''}`);
      }, 600);
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Unable to login securely.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!formData.email) {
      setMessageType('error');
      setMessage('Please enter your email address first to use biometrics.');
      return;
    }

    setLoading(true);
    setMessage('Initializing biometric verification...');
    
    try {
      const email = formData.email.trim().toLowerCase();
      const resp = await fetch(`/api/auth/webauthn/login/generate?email=${encodeURIComponent(email)}`);
      const options = await resp.json();

      if (!resp.ok) throw new Error(options.error || 'Failed to initialize biometric challenge.');

      setMessage('Waiting for biometric assertion...');
      const authResp = await startAuthentication({ optionsJSON: options });

      setMessage('Verifying with server...');
      const vResp = await fetch('/api/auth/webauthn/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, authenticationResponse: authResp })
      });
      const vData = await vResp.json();

      if (!vResp.ok) throw new Error(vData.error || 'Biometric verification failed.');

      setMessageType('success');
      setMessage('Biometric login successful. Redirecting...');
      
      // Setup typical login locals
      if (vData.user) {
        localStorage.setItem('ps_user_id', String(vData.user.id));
        localStorage.setItem('ps_user_email', vData.user.email);
        localStorage.setItem('ps_user_name', vData.user.name);
      }

      setTimeout(() => {
        router.push(`/${currentLang}/dashboard`);
      }, 500);

    } catch (e) {
      console.error(e);
      setMessageType('error');
      if (e.message.includes('No biometric credentials registered')) {
        setMessage('No biometrics found. Please login with your password first, go to Security settings, and click "Enable Biometrics".');
      } else {
        setMessage(`Biometric error: ${e.message}`);
      }
    } finally {
      if(!message.includes('Redirecting')) setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <div className="auth-icon" style={{ color: 'var(--primary-color)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><AppIcon name="shieldCheck" size={48} /></div>
            <h1>{loginDict.title || 'Platform Access'}</h1>
            <p>{loginDict.subtitle || 'Authorize access to your enterprise financial portal.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">{loginDict.emailLabel || 'Email Address'}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={loginDict.emailPlaceholder || 'Enter your email'}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{loginDict.passwordLabel || 'Password'}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={loginDict.passwordPlaceholder || 'Enter your password'}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>{loginDict.rememberMe || 'Remember me'}</span>
              </label>
              <Link href={`/${currentLang}/forgot-password`} className="text-link">
                {loginDict.forgotPassword || 'Forgot password?'}
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Verifying...' : loginDict.loginButton || 'Login Securely'}
            </button>

            {message ? (
              <p style={{ marginTop: 10, color: messageType === 'error' ? '#b91c1c' : '#166534' }}>{message}</p>
            ) : null}
          </form>

          <div className="auth-divider">
            <span>{commonDict.or || 'or'}</span>
          </div>

          <div className="social-login">
            <button type="button" className="btn btn-social" onClick={handleBiometricLogin} disabled={loading}>
              <span><AppIcon name="scan" size={16} /></span>
              {loginDict.continueWithBiometric || 'Continue with biometric verification'}
            </button>
          </div>

          <div className="auth-footer">
            <p>
              {loginDict.noAccount || "Don't have an account?"}{' '}
              <Link href={`/${currentLang}/register`} className="text-link-bold">
                {loginDict.signUpFree || 'Sign up for free'}
              </Link>
            </p>
          </div>

          <div className="security-badge">
            <span className="badge-icon"><AppIcon name="lock" size={16} /></span>
            <div className="badge-text">
              <strong>{loginDict.securityBadgeTitle || 'Protected by 7-Layer Security'}</strong>
              <p>{loginDict.securityBadgeText || 'Session and credential validation run in real time.'}</p>
            </div>
          </div>
        </div>

        <div className="auth-features">
          <h3>{loginDict.whyLoginTitle || 'Why Login with PayShield?'}</h3>
          <div className="feature-list-compact">
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>{loginDict.saltPepper || 'Salt & Pepper encryption'}</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>{loginDict.deviceDNA || 'Device DNA verification'}</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>{loginDict.threatDetection || 'Real-time threat detection'}</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>{loginDict.behaviorAnalytics || 'Behavioral analytics'}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
