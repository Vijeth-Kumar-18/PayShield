// Client-side system check
export const performSystemCheck = async () => {
  const checks = {
    browserInfo: checkBrowserInfo(),
    screenResolution: checkScreenResolution(),
    timezone: checkTimezone(),
    localStorage: checkLocalStorage(),
    cookiesEnabled: checkCookiesEnabled(),
    canvasFingerprint: await getCanvasFingerprint(),
    webglFingerprint: await getWebGLFingerprint(),
  };
  
  return checks;
};

const checkBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
  };
};

const checkScreenResolution = () => {
  return {
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
  };
};

const checkTimezone = () => {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: new Date().getTimezoneOffset(),
  };
};

const checkLocalStorage = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return { available: true, size: calculateLocalStorageSize() };
  } catch (e) {
    return { available: false, error: e.message };
  }
};

const calculateLocalStorageSize = () => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    total += (key.length + value.length) * 2;
  }
  return total;
};

const checkCookiesEnabled = () => {
  document.cookie = 'test_cookie=test';
  const enabled = document.cookie.indexOf('test_cookie') !== -1;
  document.cookie = 'test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  return enabled;
};

const getCanvasFingerprint = async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#f60';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#069';
  ctx.font = '14px Arial';
  ctx.fillText('PAYSHIELD', 50, 100);
  
  return canvas.toDataURL();
};

const getWebGLFingerprint = async () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) return null;
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    };
  }
  return null;
};