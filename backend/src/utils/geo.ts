import useragent from 'useragent';
import geoip from 'geoip-lite';

export interface ParsedClientInfo {
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Other';
  os: string;
  browser: string;
  country: string;
  city: string;
  referrer: string;
  trafficSource: 'Direct' | 'Social' | 'Search' | 'Email' | 'Referral';
}

export const parseClientInfo = (
  userAgentString: string,
  ipAddress: string,
  referrerHeader?: string
): ParsedClientInfo => {
  const agent = useragent.parse(userAgentString);
  const osName = agent.os.toString();
  const browserName = agent.toAgent();

  // Device classification
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Other' = 'Desktop';
  const uaLower = userAgentString.toLowerCase();
  if (/ipad|tablet|playbook|silk/i.test(uaLower)) {
    deviceType = 'Tablet';
  } else if (/mobile|iphone|android|touch|webos|hpwos/i.test(uaLower)) {
    deviceType = 'Mobile';
  }

  // Geolocation
  let country = 'United States';
  let city = 'San Francisco';

  if (ipAddress && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
    const geo = geoip.lookup(ipAddress);
    if (geo) {
      country = geo.country || 'United States';
      city = geo.city || 'Unknown';
    }
  } else {
    // Development fallback mock variations
    const mockLocations = [
      { country: 'United States', city: 'San Francisco' },
      { country: 'United Kingdom', city: 'London' },
      { country: 'Germany', city: 'Berlin' },
      { country: 'India', city: 'Mumbai' },
      { country: 'Canada', city: 'Toronto' },
      { country: 'Japan', city: 'Tokyo' },
    ];
    const pick = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    country = pick.country;
    city = pick.city;
  }

  // Referrer & Traffic source classification
  const ref = referrerHeader || 'Direct';
  let trafficSource: 'Direct' | 'Social' | 'Search' | 'Email' | 'Referral' = 'Direct';

  if (!referrerHeader || referrerHeader === 'Direct') {
    trafficSource = 'Direct';
  } else {
    const refLower = referrerHeader.toLowerCase();
    if (/twitter|x\.com|facebook|instagram|linkedin|t\.co|reddit|youtube/i.test(refLower)) {
      trafficSource = 'Social';
    } else if (/google|bing|yahoo|duckduckgo|baidu/i.test(refLower)) {
      trafficSource = 'Search';
    } else if (/mail|gmail|outlook|newsletter/i.test(refLower)) {
      trafficSource = 'Email';
    } else {
      trafficSource = 'Referral';
    }
  }

  return {
    deviceType,
    os: osName || 'Windows 11',
    browser: browserName || 'Chrome 124',
    country,
    city,
    referrer: ref,
    trafficSource,
  };
};
