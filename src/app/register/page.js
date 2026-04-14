'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppIcon from '@/components/AppIcon';
import { performSystemCheck } from '@/lib/auth/systemCheck';
import { checkGSMModule } from '@/lib/auth/gsmCheck';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    motherNickname: '',
    firstPetName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);
  const [gsmInfo, setGsmInfo] = useState(null);
  const [location, setLocation] = useState(null);
  const [securityStatus, setSecurityStatus] = useState(null);

  // OTP Verification States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpType, setOtpType] = useState('email');
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log('Location permission denied')
      );
    }
    
    // Run security checks
    const runSecurityChecks = async () => {
      try {
        const systemCheck = await performSystemCheck();
        const gsmCheck = await checkGSMModule();
        setSystemInfo(systemCheck);
        setGsmInfo(gsmCheck);
        
        // Set security status message
        if (gsmCheck.isEmulator?.isEmulator) {
          setSecurityStatus({
            type: 'warning',
            message: '⚠️ Emulator detected! For security, please use a real device.',
            score: gsmCheck.securityScore
          });
        } else if (gsmCheck.isMobileDevice?.isPhone && gsmCheck.hasSIMCapability?.hasSIM) {
          setSecurityStatus({
            type: 'success',
            message: '✓ Secure mobile device with SIM verified',
            score: gsmCheck.securityScore
          });
        } else if (gsmCheck.isMobileDevice?.isPhone) {
          setSecurityStatus({
            type: 'info',
            message: 'ℹ️ Mobile device detected. SIM verification recommended for payments.',
            score: gsmCheck.securityScore
          });
        } else {
          setSecurityStatus({
            type: 'info',
            message: 'Desktop device detected. Additional verification may be required.',
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

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setResendDisabled(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const generateDeviceFingerprint = async () => {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.deviceMemory || 'unknown',
      gsmInfo?.securityScore || 'unknown',
    ];
    
    const fingerprint = components.join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Send OTP to email or phone
  const sendOTP = async (identifier, type) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, type }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        setCountdown(60);
        setResendDisabled(true);
        
        if (data.testMode && data.testOtp) {
          alert(`[TEST MODE] Your OTP is: ${data.testOtp}\n\nIn production, this would be sent to your ${type}.`);
        } else {
          alert(`Verification code sent to ${type === 'email' ? identifier : 'your phone'}`);
        }
      } else {
        setError(data.error || `Failed to send ${type} verification`);
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(`Failed to send ${type} verification. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: otpIdentifier,
          otp: otpCode,
          type: otpType,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowOTPModal(false);
        setOtpCode('');
        
        if (otpType === 'email') {
          // Email verified, now verify phone
          setOtpType('phone');
          setOtpIdentifier(formData.phone);
          setShowOTPModal(true);
          await sendOTP(formData.phone, 'phone');
        } else {
          // Both email and phone verified, complete registration
          await completeRegistration();
        }
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Complete registration after OTP verification
  const completeRegistration = async () => {
    setLoading(true);
    setError('');
    
    try {
      const deviceId = await generateDeviceFingerprint();
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          motherNickname: formData.motherNickname,
          firstPetName: formData.firstPetName,
          deviceId,
          location: location ? `${location.lat},${location.lng}` : 'unknown',
          systemInfo,
          gsmInfo,
          isEmailVerified: true,
          isPhoneVerified: true,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submitted, current step:', step); // Debug log
    
    if (step === 1) {
      console.log('Validating step 1...');
      console.log('Form data:', formData);
      
      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        console.log('Password mismatch');
        return;
      }
      
      // Check password length
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        console.log('Password too short');
        return;
      }
      
      // Check if email is provided
      if (!formData.email) {
        setError('Email is required');
        console.log('Email missing');
        return;
      }
      
      // Check if phone is provided
      if (!formData.phone) {
        setError('Phone number is required');
        console.log('Phone missing');
        return;
      }
      
      // Check if full name is provided
      if (!formData.fullName) {
        setError('Full name is required');
        console.log('Full name missing');
        return;
      }
      
      // Check if device is emulator
      if (gsmInfo?.isEmulator?.isEmulator) {
        setError('Cannot register: Emulator detected. Please use a real device for security.');
        console.log('Emulator detected');
        return;
      }
      
      // Clear any errors and move to step 2
      setError('');
      console.log('Moving to step 2...');
      setStep(2);
      
    } else {
      // Step 2 - Start OTP verification
      console.log('Step 2: Starting OTP verification...');
      
      // Validate security questions
      if (!formData.motherNickname) {
        setError('Please answer the security question');
        return;
      }
      
      if (!formData.firstPetName) {
        setError('Please answer the security question');
        return;
      }
      
      setError('');
      // Start with email verification
      setOtpType('email');
      setOtpIdentifier(formData.email);
      setShowOTPModal(true);
      await sendOTP(formData.email, 'email');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  // OTP Modal Component
  const OTPSModal = () => (
    <div className="otp-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }} onClick={() => !loading && setShowOTPModal(false)}>
      <div className="otp-modal-content" style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '16px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>
            {otpType === 'email' ? '📧' : '📱'}
          </div>
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
            Verify Your {otpType === 'email' ? 'Email' : 'Phone Number'}
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Enter the verification code sent to:
          </p>
          <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', color: '#4f46e5' }}>
            {otpIdentifier}
          </p>
        </div>
        
        <input
          type="text"
          placeholder="Enter 6-digit code"
          maxLength="6"
          value={otpCode}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            setOtpCode(value);
            if (error) setError('');
          }}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '24px',
            textAlign: 'center',
            letterSpacing: '8px',
            margin: '15px 0',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            outline: 'none',
            fontFamily: 'monospace',
          }}
          autoFocus
        />
        
        {error && (
          <div style={{
            color: '#dc3545',
            fontSize: '13px',
            padding: '8px',
            backgroundColor: '#f8d7da',
            borderRadius: '8px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {countdown > 0 ? (
            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
              Resend code in {countdown} seconds
            </p>
          ) : (
            <button
              type="button"
              onClick={() => sendOTP(otpIdentifier, otpType)}
              disabled={resendDisabled || loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'underline',
              }}
            >
              Resend Verification Code
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowOTPModal(false)}
            className="btn btn-secondary"
            style={{ flex: 1 }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={verifyOTP}
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={loading || otpCode.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        
        <p style={{
          textAlign: 'center',
          fontSize: '11px',
          color: '#999',
          marginTop: '20px',
          marginBottom: 0
        }}>
          For security, this code expires in 10 minutes
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="auth-container">
        <div className="auth-box register-box">
          <div className="auth-header">
            <div className="auth-icon"><AppIcon name="shieldCheck" size={24} /></div>
            <h1>Create Your Account</h1>
            <p>Set up your account with enterprise-grade protection controls.</p>
          </div>

          {/* Security Status Banner */}
          {securityStatus && (
            <div className={`security-banner status-${securityStatus.type}`} style={{
              padding: '10px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              backgroundColor: securityStatus.type === 'success' ? '#d4edda' : 
                              securityStatus.type === 'warning' ? '#fff3cd' : '#d1ecf1',
              color: securityStatus.type === 'success' ? '#155724' : 
                     securityStatus.type === 'warning' ? '#856404' : '#0c5460',
              border: `1px solid ${securityStatus.type === 'success' ? '#c3e6cb' : 
                                    securityStatus.type === 'warning' ? '#ffeeba' : '#bee5d4'}`
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>{securityStatus.message}</span>
                <span style={{fontWeight: 'bold', fontSize: '12px'}}>
                  Security Score: {securityStatus.score}/100
                </span>
              </div>
            </div>
          )}

          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {step === 1 && (
              <>
                <h3 className="form-section-title">Basic Information</h3>
                
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

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
                  <small className="form-hint">We'll send a verification code to this email</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                  <small className="form-hint">Required for SMS verification & GSM security alerts</small>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                  />
                  <small className="form-hint">Will be encrypted with salt & pepper</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                  />
                </div>

                {error && (
                  <div className="error-message" style={{
                    color: '#dc3545',
                    fontSize: '14px',
                    padding: '10px',
                    backgroundColor: '#f8d7da',
                    borderRadius: '6px',
                    marginBottom: '15px'
                  }}>
                    {error}
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="form-section-title">Security Questions</h3>
                <p className="security-note">
                  <span className="note-icon"><AppIcon name="lock" size={16} /></span>
                  These answers will be encrypted and stored on blockchain. They will never 
                  be stored on your device or browser.
                </p>

                <div className="form-group">
                  <label htmlFor="motherNickname">What did your mother call you?</label>
                  <input
                    type="text"
                    id="motherNickname"
                    name="motherNickname"
                    value={formData.motherNickname}
                    onChange={handleChange}
                    placeholder="Enter the nickname"
                    required
                  />
                  <small className="form-hint">Example: "Chintu", "Sweetheart", etc.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="firstPetName">What was your first pet's name?</label>
                  <input
                    type="text"
                    id="firstPetName"
                    name="firstPetName"
                    value={formData.firstPetName}
                    onChange={handleChange}
                    placeholder="Enter pet name"
                    required
                  />
                  <small className="form-hint">Example: "Tommy", "Bella", etc.</small>
                </div>

                {/* GSM Device Info Display */}
                {gsmInfo && (
                  <div className="gsm-info-box" style={{
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '12px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <AppIcon name="scan" size={16} />
                      <span>Device Security Verification</span>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                      <div>📱 Device Type:</div>
                      <div>{gsmInfo.isMobileDevice?.isPhone ? 'Mobile Phone' : 
                             gsmInfo.isMobileDevice?.isTablet ? 'Tablet' : 'Desktop'}</div>
                      
                      {gsmInfo.hasSIMCapability?.hasSIM && (
                        <>
                          <div>📡 SIM Card:</div>
                          <div style={{color: '#28a745'}}>✓ Detected</div>
                        </>
                      )}
                      
                      {gsmInfo.hasSIMCapability?.carrier && (
                        <>
                          <div>📶 Carrier:</div>
                          <div>{gsmInfo.hasSIMCapability.carrier}</div>
                        </>
                      )}
                      
                      <div>🌐 Network:</div>
                      <div>{gsmInfo.networkInfo?.networkCategory || 'Unknown'}</div>
                    </div>
                  </div>
                )}

                <div className="info-box">
                  <h4><AppIcon name="scan" size={16} className="inline-icon" /> The Childhood Whisper</h4>
                  <p>
                    During suspicious login attempts, you'll be asked to combine these answers 
                    to prove your identity. Only you know these personal details!
                  </p>
                </div>

                {error && (
                  <div className="error-message" style={{
                    color: '#dc3545',
                    fontSize: '14px',
                    padding: '10px',
                    backgroundColor: '#f8d7da',
                    borderRadius: '6px',
                    marginBottom: '15px'
                  }}>
                    {error}
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="btn btn-secondary btn-full"
                  style={{marginBottom: '10px'}}
                >
                  Back
                </button>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading || (step === 1 && gsmInfo?.isEmulator?.isEmulator)}
              style={{opacity: (loading || (step === 1 && gsmInfo?.isEmulator?.isEmulator)) ? '0.6' : '1'}}
            >
              {loading ? 'Processing...' : (step === 1 ? 'Continue to Security Questions' : 'Verify & Create Account')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-link-bold">
                Login here
              </Link>
            </p>
          </div>

          {step === 1 && (
            <div className="security-features-list">
              <h4>Your account will be protected with:</h4>
              <div className="mini-features">
                <span className="mini-feature"><AppIcon name="lock" size={14} /> Spice Lock</span>
                <span className="mini-feature"><AppIcon name="shield" size={14} /> Mirror Maze</span>
                <span className="mini-feature"><AppIcon name="globe" size={14} /> Digital Passport</span>
                <span className="mini-feature"><AppIcon name="dna" size={14} /> Device DNA</span>
                <span className="mini-feature"><AppIcon name="mail" size={14} /> Email OTP</span>
                <span className="mini-feature"><AppIcon name="phone" size={14} /> SMS Verify</span>
              </div>
            </div>
          )}

          {/* Show GSM info summary in step 1 as well */}
          {step === 1 && gsmInfo && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '11px',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              <span>🔒 Device Security Score: {gsmInfo.securityScore}/100</span>
              {gsmInfo.isMobileDevice?.isPhone && <span style={{marginLeft: '10px'}}>📱 Mobile Device</span>}
              {gsmInfo.hasSIMCapability?.hasSIM && <span style={{marginLeft: '10px'}}>✅ SIM Verified</span>}
            </div>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && <OTPSModal />}
    </>
  );
}