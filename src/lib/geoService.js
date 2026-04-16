function toRad(deg) {
  return deg * (Math.PI / 180);
}

export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getGeoFromIP(ip) {
  try {
    const targetIP =
      ip === "127.0.0.1" || ip === "::1" || ip?.startsWith("192.168")
        ? "8.8.8.8"
        : ip;

    const res = await fetch(
      `http://ip-api.com/json/${targetIP}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,proxy,hosting`,
      { next: { revalidate: 0 } } // no caching
    );
    const data = await res.json();

    if (data.status !== "success") throw new Error(data.message);

    return {
      ip: targetIP,
      city: data.city,
      region: data.regionName,
      country: data.country,
      countryCode: data.countryCode,
      lat: data.lat,
      lon: data.lon,
      isp: data.isp,
      isProxy: data.proxy,
      isVPN: data.hosting,
    };
  } catch (err) {
    console.error("Geo lookup error:", err.message);
    return null;
  }
}

export function analyzeRisk(currentGeo, lastLogin, trustedCountries = []) {
  let riskScore = 0;
  const riskFlags = [];

  if (!currentGeo) return { riskScore: 50, riskFlags: ["geo_lookup_failed"] };

  if (currentGeo.isProxy) { riskScore += 40; riskFlags.push("proxy_detected"); }
  if (currentGeo.isVPN)   { riskScore += 30; riskFlags.push("vpn_detected"); }

  if (trustedCountries.length > 0 && !trustedCountries.includes(currentGeo.countryCode)) {
    riskScore += 35;
    riskFlags.push("unusual_country");
  }

  if (lastLogin?.lat && lastLogin?.lon) {
    const distKm = getDistanceKm(
      parseFloat(lastLogin.lat), parseFloat(lastLogin.lon),
      currentGeo.lat, currentGeo.lon
    );
    const hrs = (Date.now() - new Date(lastLogin.login_at).getTime()) / (1000 * 60 * 60);

    if (hrs > 0.016) {
      const speed = distKm / hrs;
      const MAX = parseInt(process.env.MAX_TRAVEL_SPEED_KMH) || 900;
      if (speed > MAX) { riskScore += 60; riskFlags.push("impossible_travel"); }
      else if (distKm > 500) { riskScore += 20; riskFlags.push("large_location_change"); }
    }
  }

  return { riskScore: Math.min(riskScore, 100), riskFlags };
}

export function requiresExtraVerification(riskScore) {
  return riskScore >= 40;
}

// Extract real IP from Next.js request headers
export function getClientIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}