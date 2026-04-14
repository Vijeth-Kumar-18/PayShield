// Complete GSM SIM Module Check for Payment Security

export const checkGSMModule = async () => {
  const checks = {
    isMobileDevice: checkIsMobileDevice(),
    hasSIMCapability: await checkSIMCapability(),
    networkInfo: await getNetworkInformation(),
    isEmulator: await checkIfEmulator(),
    telephonyAPI: checkTelephonyAPI(),
    deviceIntegrity: await checkDeviceIntegrity(),
  };
  
  // Calculate security score (0-100)
  checks.securityScore = calculateSecurityScore(checks);
  
  return checks;
};

// Check if device is actually a mobile phone
const checkIsMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  const mobileKeywords = [
    /android/i, /webos/i, /iphone/i, /ipad/i, /ipod/i,
    /blackberry/i, /windows phone/i, /opera mini/i, /iemobile/i
  ];
  
  const isMobile = mobileKeywords.some(keyword => keyword.test(userAgent));
  
  // Additional checks for tablet vs phone
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  const isPhone = isMobile && !isTablet;
  
  return {
    isMobile: isMobile,
    isPhone: isPhone,
    isTablet: isTablet,
    userAgent: userAgent,
  };
};

// Check SIM card capability
const checkSIMCapability = async () => {
  const simChecks = {
    hasSIM: false,
    carrier: null,
    networkType: null,
  };
  
  // Check for mobile network APIs
  if ('connection' in navigator) {
    const connection = navigator.connection;
    simChecks.networkType = connection.effectiveType;
    
    // If on cellular network (not WiFi), likely has SIM
    if (connection.type === 'cellular') {
      simChecks.hasSIM = true;
    }
  }
  
  // Check for Network Information API (gives carrier info on some devices)
  if ('mozMobileConnection' in navigator || 'webkitMobileConnection' in navigator) {
    const mobileConnection = navigator.mozMobileConnection || navigator.webkitMobileConnection;
    if (mobileConnection && mobileConnection.voice) {
      simChecks.hasSIM = true;
      simChecks.carrier = mobileConnection.voice.network?.shortName || 'Unknown';
    }
  }
  
  // Check if device has phone capabilities
  if ('telephony' in navigator) {
    simChecks.hasSIM = true;
  }
  
  return simChecks;
};

// Get network information
const getNetworkInformation = async () => {
  const network = {};
  
  if ('connection' in navigator) {
    const conn = navigator.connection;
    network.type = conn.type || 'unknown';
    network.effectiveType = conn.effectiveType;
    network.downlink = conn.downlink;
    network.rtt = conn.rtt;
    network.saveData = conn.saveData;
  }
  
  // Detect if on mobile network vs WiFi
  if (network.type === 'cellular') {
    network.networkCategory = 'mobile_data';
  } else if (network.type === 'wifi') {
    network.networkCategory = 'wifi';
  } else {
    network.networkCategory = 'unknown';
  }
  
  return network;
};

// Check if device is an emulator (fraud detection)
const checkIfEmulator = async () => {
  const emulatorIndicators = [];
  
  // Check 1: User agent anomalies
  const ua = navigator.userAgent.toLowerCase();
  const emulatorKeywords = ['android sdk', 'sdk_build', 'google_sdk', 'emulator', 'genymotion', 'virtualbox'];
  emulatorKeywords.forEach(keyword => {
    if (ua.includes(keyword)) emulatorIndicators.push(keyword);
  });
  
  // Check 2: WebGL renderer (emulators often have generic renderers)
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      
      if (renderer && (renderer.includes('SwiftShader') || renderer.includes('llvmpipe'))) {
        emulatorIndicators.push('software_renderer');
      }
      if (vendor && vendor.includes('Google')) {
        emulatorIndicators.push('google_vendor');
      }
    }
  }
  
  // Check 3: Screen resolution anomalies (emulators often use standard sizes)
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const commonEmulatorResolutions = [
    [540, 960], [720, 1280], [1080, 1920], [768, 1024]
  ];
  
  commonEmulatorResolutions.forEach(res => {
    if (screenWidth === res[0] && screenHeight === res[1]) {
      emulatorIndicators.push('common_emulator_resolution');
    }
  });
  
  // Check 4: Performance timing (emulators have different timing characteristics)
  const startTime = performance.now();
  let sum = 0;
  for (let i = 0; i < 1000000; i++) sum += i;
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration < 5) { // Too fast - likely emulator
    emulatorIndicators.push('suspicious_performance');
  }
  
  return {
    isEmulator: emulatorIndicators.length > 0,
    indicators: emulatorIndicators,
    confidence: emulatorIndicators.length > 2 ? 'high' : (emulatorIndicators.length > 0 ? 'medium' : 'low'),
  };
};

// Check telephony API availability
const checkTelephonyAPI = () => {
  return {
    hasTelephony: 'telephony' in navigator,
    hasContacts: 'contacts' in navigator,
    hasSMS: 'sms' in navigator,
  };
};

// Check device integrity (jailbreak/root detection hints)
const checkDeviceIntegrity = async () => {
  const integrity = {
    isJailbroken: false,
    isRooted: false,
    indicators: [],
  };
  
  // Check for common root/jailbreak file paths (client-side hints)
  const rootIndicators = [
    '/system/app/Superuser.apk',
    '/sbin/su',
    '/system/bin/su',
    '/system/xbin/su',
    '/data/local/xbin/su',
    '/data/local/bin/su',
    '/system/sd/xbin/su',
    '/system/bin/failsafe/su',
    '/data/local/su',
  ];
  
  // Note: Actual file check requires native module, this is a simulation
  // For production, you'd need a native bridge or backend check
  
  return integrity;
};

// Calculate overall security score
const calculateSecurityScore = (checks) => {
  let score = 100;
  
  // Deduct for emulator detection
  if (checks.isEmulator.isEmulator) {
    score -= 50;
  }
  
  // Deduct if no SIM capability on mobile
  if (checks.isMobileDevice.isMobile && !checks.hasSIMCapability.hasSIM) {
    score -= 30;
  }
  
  // Deduct for suspicious network
  if (checks.networkInfo.networkCategory === 'unknown') {
    score -= 20;
  }
  
  // Bonus for having SIM and being on mobile
  if (checks.hasSIMCapability.hasSIM && checks.isMobileDevice.isPhone) {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
};