'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppIcon from '@/components/AppIcon';
import { authFetch } from '@/lib/http/authFetch';
import { startRegistration } from '@simplewebauthn/browser';

export default function Security() {
  const params = useParams();
  const currentLang = params?.lang || 'en';
  const [dict, setDict] = useState({});
  const [securityQuestions, setSecurityQuestions] = useState({
    motherNickname: '',
    firstPetName: ''
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState('');
  const security = dict.security || {};
  const common = dict.common || {};

  const handleEnableBiometrics = async () => {
    try {
      setBiometricStatus('Starting registration...');
      const email = localStorage.getItem('ps_user_email') || localStorage.getItem('ps_user_id'); // Try email
      if (!email) {
        setBiometricStatus('Error: User not identified. Please re-login.');
        return;
      }
      
      const resp = await authFetch(`/api/auth/webauthn/register/generate?email=${encodeURIComponent(email)}`);
      const options = await resp.json();
      
      if (!resp.ok) throw new Error(options.error || 'Failed to get options');

      setBiometricStatus('Verifying locally...');
      const attResp = await startRegistration({ optionsJSON: options });

      setBiometricStatus('Sending to server...');
      const vResp = await authFetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, registrationResponse: attResp })
      });
      const vData = await vResp.json();

      if (vResp.ok) {
        setBiometricStatus('Biometrics enabled successfully!');
      } else {
        setBiometricStatus(`Error: ${vData.error || 'Verification failed'}`);
      }
    } catch (e) {
      console.error(e);
      setBiometricStatus(`Error: ${e.message}`);
    }
  };

  useEffect(() => {
    import(`@/i18n/dictionaries/${currentLang}.json`)
      .then((module) => setDict(module.default || {}))
      .catch(() => import('@/i18n/dictionaries/en.json').then((m) => setDict(m.default || {})));
  }, [currentLang]);

  const handleQuestionChange = (e) => {
    setSecurityQuestions({
      ...securityQuestions,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveQuestions = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('ps_user_id');
    if (!userId) {
      setSaveError(true);
      setSaveMessage('Login is required to update security questions.');
      return;
    }

    try {
      const response = await authFetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          motherNickname: securityQuestions.motherNickname,
          firstPetName: securityQuestions.firstPetName
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to update security questions.');
      }

      setSaveError(false);
      setSaveMessage('Security questions updated successfully.');
      setSecurityQuestions({ motherNickname: '', firstPetName: '' });
    } catch (error) {
      setSaveError(true);
      setSaveMessage(error.message || 'Unable to update security questions.');
    }
  };

  return (
    <>
      <div className="page-container">
        <div className="container-narrow">
          <div className="page-header">
            <h1 className="page-title">{security.pageTitle || 'Security Settings'}</h1>
            <p className="page-subtitle">{security.pageSubtitle || 'Manage your security features and protection settings'}</p>
          </div>

          <div className="security-score-card">
            <div className="score-content">
              <h2>{security.scoreTitle || 'Your Security Score'}</h2>
              <div className="score-circle">
                <div className="score-value">98%</div>
              </div>
              <p className="score-status excellent">{security.scoreStatus || 'Excellent Protection'}</p>
            </div>
            <div className="score-breakdown">
              <h3>{security.scoreBreakdown || 'Score Breakdown'}</h3>
              <div className="score-item">
                <span>{security.passwordStrength || 'Password Strength'}</span>
                <div className="score-bar"><div className="score-fill" style={{ width: '100%' }}></div></div>
                <span>100%</span>
              </div>
              <div className="score-item">
                <span>{security.deviceTrust || 'Device Trust'}</span>
                <div className="score-bar"><div className="score-fill" style={{ width: '95%' }}></div></div>
                <span>95%</span>
              </div>
              <div className="score-item">
                <span>{security.behavioralPattern || 'Behavioral Pattern'}</span>
                <div className="score-bar"><div className="score-fill" style={{ width: '98%' }}></div></div>
                <span>98%</span>
              </div>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title-small">{security.layersTitle || 'Security Layers Status'}</h2>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon"><AppIcon name="lock" size={16} /></span>
                  <div><h3>{security.spiceLockTitle || 'The Spice Lock'}</h3><p>{security.spiceLockDesc || 'Triple-layer password encryption'}</p></div>
                </div>
                <span className="status-badge success">{common.active || 'Active'}</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">{security.spiceLockSalt || 'Salt: Unique 16-digit random key'}</div>
                <div className="detail-item">{security.spiceLockPepper || 'Pepper: Master server key applied'}</div>
                <div className="detail-item">{security.spiceLockLastUpdate || 'Last Updated: Feb 1, 2026'}</div>
                <button className="btn btn-secondary btn-small">{security.changePassword || 'Change Password'}</button>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon"><AppIcon name="shield" size={16} /></span>
                  <div><h3>{security.mirrorMazeTitle || 'The Mirror Maze'}</h3><p>{security.mirrorMazeDesc || 'Decoy accounts protection'}</p></div>
                </div>
                <span className="status-badge success">{common.active || 'Active'}</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">{security.mirrorMazeDecoys || 'Decoy Accounts: 3 active fake accounts'}</div>
                <div className="detail-item">{security.mirrorMazeSuccess || 'Success Rate: 100% of attacks redirected'}</div>
                <div className="detail-item">{security.mirrorMazeTriggered || 'Last Triggered: 3 days ago'}</div>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon"><AppIcon name="globe" size={16} /></span>
                  <div><h3>{security.digitalPassportTitle || 'The Digital Passport'}</h3><p>{security.digitalPassportDesc || 'Location and device verification'}</p></div>
                </div>
                <span className="status-badge success">{common.active || 'Active'}</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">{security.digitalPassportLocation || 'Current Location: Bangalore, India'}</div>
                <div className="detail-item">{security.digitalPassportRegions || 'Allowed Regions: India, Nepal, Bhutan, France'}</div>
                <div className="detail-item">{security.digitalPassportBlocked || 'Blocked Attempts: 2 this month'}</div>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon"><AppIcon name="scan" size={16} /></span>
                  <div><h3>{security.childhoodWhisperTitle || 'The Childhood Whisper'}</h3><p>{security.childhoodWhisperDesc || 'Blockchain-secured personal verification'}</p></div>
                </div>
                <span className="status-badge success">{common.active || 'Active'}</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">{security.childhoodWhisperStorage || 'Storage: Encrypted on blockchain'}</div>
                <div className="detail-item">{security.childhoodWhisperQuestions || 'Questions Set: 2 security questions configured'}</div>
                <div className="detail-item">{security.childhoodWhisperVerified || 'Last Verified: 1 day ago'}</div>
                <button className="btn btn-secondary btn-small" onClick={() => document.getElementById('questions-form').scrollIntoView({ behavior: 'smooth' })}>
                  {security.updateQuestions || 'Update Questions'}
                </button>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon"><AppIcon name="timer" size={16} /></span>
                  <div><h3>{security.slowMotionTrapTitle || 'The Slow Motion Trap'}</h3><p>{security.slowMotionTrapDesc || 'Intelligent delay during threats'}</p></div>
                </div>
                <span className="status-badge success">{common.ready || 'Ready'}</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">{security.slowMotionTrapDelay || 'Delay Duration: 30 seconds'}</div>
                <div className="detail-item">{security.slowMotionTrapActivated || 'Times Activated: 1 this month'}</div>
                <div className="detail-item">{security.slowMotionTrapSuccess || 'Success Rate: 100% threats neutralized'}</div>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon"><AppIcon name="dna" size={16} /></span>
                  <div><h3>{security.deviceDNATitle || 'The Device DNA'}</h3><p>{security.deviceDNADesc || '20+ unique device identifiers'}</p></div>
                </div>
                <span className="status-badge success">{common.active || 'Active'}</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">{security.deviceDNATrusted || 'Trusted Devices: 3 devices registered'}</div>
                <div className="detail-item">{security.deviceDNACurrent || 'Current Device: Dell XPS 15 (Trusted)'}</div>
                <div className="detail-item">{security.deviceDNABlocked || 'Unknown Devices Blocked: 5 this month'}</div>
                <Link href={`/${currentLang}/dashboard#devices`} className="btn btn-secondary btn-small">{security.manageDevices || 'Manage Devices'}</Link>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon"><AppIcon name="camera" size={16} /></span>
                  <div><h3>{security.behaviorCameraTitle || 'The Behavior Camera'}</h3><p>{security.behaviorCameraDesc || 'AI-powered behavioral analytics'}</p></div>
                </div>
                <span className="status-badge success">{common.learning || 'Learning'}</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">{security.behaviorCameraStatus || 'AI Learning Status: 87% pattern recognition accuracy'}</div>
                <div className="detail-item">{security.behaviorCameraPatterns || 'Patterns Tracked: Mouse movement, transaction timing, amounts'}</div>
                <div className="detail-item">{security.behaviorCameraAnomalies || 'Anomalies Detected: 2 this week'}</div>
              </div>
            </div>

            <div className="security-layer">
              <div className="layer-header">
                <div className="layer-info">
                  <span className="layer-icon"><AppIcon name="alert" size={16} /></span>
                  <div><h3>{security.alertSystemTitle || 'Alert System'}</h3><p>{security.alertSystemDesc || 'Multi-channel threat notifications'}</p></div>
                </div>
                <span className="status-badge success">{common.active || 'Active'}</span>
              </div>
              <div className="layer-details">
                <div className="detail-item">{security.alertSystemGSM || 'GSM Alert: +91-XXXXX-XXXXX'}</div>
                <div className="detail-item">{security.alertSystemEmail || 'Email Alert: john.doe@example.com'}</div>
                <div className="detail-item">{security.alertSystemSent || 'Alerts Sent: 3 this month'}</div>
                <button className="btn btn-secondary btn-small">{security.updateContactInfo || 'Update Contact Info'}</button>
              </div>
            </div>
          </div>

          <div className="section" id="questions-form">
            <h2 className="section-title-small">{security.updateQuestionsTitle || 'Update Security Questions'}</h2>
            <div className="info-box"><p>{security.updateQuestionsInfo || 'Blockchain Protection: These answers are encrypted and stored on blockchain. They will never be accessible from your browser or device.'}</p></div>
            <form onSubmit={handleSaveQuestions} className="security-form">
              <div className="form-group">
                <label htmlFor="motherNickname">{security.question1 || 'What did your mother call you?'}</label>
                <input type="text" id="motherNickname" name="motherNickname" value={securityQuestions.motherNickname} onChange={handleQuestionChange} placeholder={security.question1Placeholder || 'Enter new answer'} />
              </div>
              <div className="form-group">
                <label htmlFor="firstPetName">{security.question2 || "What was your first pet's name?"}</label>
                <input type="text" id="firstPetName" name="firstPetName" value={securityQuestions.firstPetName} onChange={handleQuestionChange} placeholder={security.question2Placeholder || 'Enter new answer'} />
              </div>
              <button type="submit" className="btn btn-primary">{security.saveQuestions || 'Save Security Questions'}</button>
              {saveMessage ? (
                <p style={{ marginTop: 10, color: saveError ? '#b91c1c' : '#166534' }}>{saveMessage}</p>
              ) : null}
            </form>
          </div>

          <div className="section">
            <h2 className="section-title-small">{security.additionalTitle || 'Additional Security Options'}</h2>
            
            <div className="option-card">
              <div className="option-info">
                <h3><AppIcon name="lock" size={14} /> Biometric Passkeys (WebAuthn)</h3>
                <p>Login securely using your device's built-in scanner (Windows Hello / TouchID), a device PIN, or by linking your smartphone (via QR code) to use its fingerprint/FaceID.</p>
                {biometricStatus && <p style={{ fontSize: '0.8rem', color: biometricStatus.includes('Error') ? '#b91c1c' : '#166534', marginTop: 4 }}>Status: {biometricStatus}</p>}
              </div>
              <button className="btn btn-secondary" onClick={handleEnableBiometrics} disabled={biometricStatus.startsWith('Starting')}>
                Enable Biometrics
              </button>
            </div>

            <div className="option-card">
              <div className="option-info">
                <h3><AppIcon name="mobile" size={14} /> {security.twoFactorTitle || 'Two-Factor Authentication (2FA)'}</h3>
                <p>{security.twoFactorDesc || 'Add an extra layer of security with SMS or authenticator app'}</p>
              </div>
              <button className="btn btn-secondary">{security.enableTwoFactor || 'Enable 2FA'}</button>
            </div>
            <div className="option-card">
              <div className="option-info">
                <h3><AppIcon name="bell" size={14} /> {security.transactionNotifTitle || 'Transaction Notifications'}</h3>
                <p>{security.transactionNotifDesc || 'Receive instant alerts for every transaction'}</p>
              </div>
              <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
            </div>
            <div className="option-card">
              <div className="option-info">
                <h3><AppIcon name="globe" size={14} /> {security.geoRestrictTitle || 'Geographic Restrictions'}</h3>
                <p>{security.geoRestrictDesc || 'Automatically block transactions from unauthorized countries'}</p>
              </div>
              <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
            </div>
            <div className="option-card">
              <div className="option-info">
                <h3><AppIcon name="timer" size={14} /> {security.timeRestrictTitle || 'Time-Based Restrictions'}</h3>
                <p>{security.timeRestrictDesc || 'Block transactions during unusual hours (e.g., 12 AM - 6 AM)'}</p>
              </div>
              <label className="toggle-switch"><input type="checkbox" /><span className="toggle-slider"></span></label>
            </div>
          </div>

          <div className="section danger-zone">
            <h2 className="section-title-small">{security.dangerZoneTitle || 'Danger Zone'}</h2>
            <div className="danger-card">
              <div className="danger-info">
                <h3><AppIcon name="settings" size={14} /> {security.resetSettingsTitle || 'Reset All Security Settings'}</h3>
                <p>{security.resetSettingsDesc || 'This will reset all security features to default settings'}</p>
              </div>
              <button className="btn btn-danger">{security.resetButton || 'Reset Settings'}</button>
            </div>
            <div className="danger-card">
              <div className="danger-info">
                <h3><AppIcon name="alert" size={14} /> {security.deleteAccountTitle || 'Delete Account'}</h3>
                <p>{security.deleteAccountDesc || 'Permanently delete your PayShield account and all data'}</p>
              </div>
              <button className="btn btn-danger">{security.deleteButton || 'Delete Account'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
