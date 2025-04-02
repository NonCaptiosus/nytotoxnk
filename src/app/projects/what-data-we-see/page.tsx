import { headers } from 'next/headers';

// Import the new client component (we'll create this next)
import ClientSpecificInfo from './ClientSpecificInfo';

export const metadata = {
  title: 'What Data We See | nytotoxNK Projects',
  description: 'Understand the information your browser sends when you visit this website.',
};

// Friend mapping based on approximate phone model identifiers in User-Agent
const friendMap: { [key: string]: string } = {
  'SM-S901': 'Ervis',     // Samsung S10 (example model, might vary) - User Agent often has model code
  'SM-G97': 'Ervis',      // Samsung S10 series (common prefix)
  'SM-S928': 'Andrea',    // Samsung S24 Ultra (example model)
  'Pixel 7': 'Kevin',     // Pixel 7
  'SM-G98': 'Romeo',     // Samsung S20 series (common prefix)
  'SM-S918': 'Boss',      // Samsung S23 Ultra (example model)
  'XQ-': 'Niko',        // Sony Xperia common prefix (e.g., XQ-CQ54 for Xperia 1 IV) - I VI might be different
};

// Function to parse User Agent (basic implementation)
function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Unknown Device'; // Default

  // Basic Browser Detection
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  // Basic OS Detection
  if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
  else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  // Basic Device Hint (often "Mobile" or missing for desktops)
  if (ua.includes('Mobile')) device = 'Mobile Device';
  else if (os !== 'Unknown' && browser !== 'Unknown') device = 'Desktop Device';
  
  // Attempt to find specific friend model
  for (const key in friendMap) {
      if (ua.includes(key)) {
          device = `Mobile Device (possibly ${key})`; // Add model hint if matched
          break;
      }
  }


  return { browser, os, device };
}

// Function to find friend name
function findFriend(ua: string): string | null {
    for (const key in friendMap) {
        if (ua.includes(key)) {
            return friendMap[key];
        }
    }
    // Add a check for Erald if a specific identifier is known
    // if (ua.includes('ERALDS_IDENTIFIER')) return 'Erald';
    return null;
}

export default function WhatDataWeSeePage() {
  const headersList = headers(); // Get headers server-side

  // Extract server-side data (prioritized)
  const ip = headersList.get('x-forwarded-for') ?? 'Not Available';
  const userAgent = headersList.get('user-agent') ?? 'Not Available';
  const referer = headersList.get('referer') ?? 'Not Available (Direct Visit or Hidden)';
  const acceptLanguage = headersList.get('accept-language') ?? 'Not Available';

  const { browser, os, device } = parseUserAgent(userAgent);
  const friendName = findFriend(userAgent);

  // Only include server-fetched data initially
  const serverDataToShow = [
    { name: 'IP Address', value: ip, importance: 1, description: 'Your public internet address. Used for routing, basic analytics, and security.' },
    { name: 'User Agent String', value: userAgent, importance: 2, description: 'Raw text your browser sends identifying itself.' },
    { name: 'Detected Browser', value: browser, importance: 3, description: 'Browser detected from User Agent. Helps optimize website display.' },
    { name: 'Detected Operating System', value: os, importance: 4, description: 'OS detected from User Agent. Helps with compatibility.' },
    { name: 'Detected Device Type', value: device, importance: 5, description: 'General device type (Mobile/Desktop) from User Agent.' },
    { name: 'Approximate Location', value: 'Requires specific setup (IP Geolocation Service)', importance: 6, description: 'Estimated city/country based on IP. Needs extra configuration.' },
    { name: 'Referring Page', value: referer, importance: 7, description: 'The page you linked from to get here (if any).' },
    { name: 'Preferred Languages', value: acceptLanguage, importance: 8, description: 'Languages your browser prefers, used for content negotiation.' },
    // Client-side data will be rendered by ClientSpecificInfo component
    { name: 'Cookies', value: 'Browser cookies may be used for sessions, preferences, or analytics (not displayed here).', importance: 11, description: 'Small data pieces stored in your browser.' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-0"> {/* Added padding for smaller screens */}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 font-serif text-primary dark:text-text-dark">
        What Data We See From You
      </h1>

      <div className="prose dark:prose-invert max-w-none mb-12">
        <p className="mb-6">
          When you visit a website, your browser automatically sends certain information to the server.
          Below is a summary of the data we can typically access from your request headers and browser environment.
          This information helps us understand our audience, improve the website, and ensure security.
        </p>

        <div className="space-y-4">
          {/* Render server data first */}
          {serverDataToShow.sort((a, b) => a.importance - b.importance).map((item) => (
            <div key={item.name} className="p-4 border rounded-lg dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-1 font-serif text-primary dark:text-text-dark">{item.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
              <p className="font-mono break-words bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">{item.value}</p>
            </div>
          ))}
          {/* Render the client component here */}
          <ClientSpecificInfo />
        </div>
      </div>

      {friendName && (
        <div className="mt-12 p-6 border rounded-lg dark:border-gray-700 bg-gradient-to-r from-primary to-secondary dark:from-primary-dark dark:to-secondary-dark text-white shadow-lg">
          <p className="text-2xl font-bold text-center">
            Hey {friendName}! 👋 Nice to see you here!
          </p>
          <p className='text-center text-sm mt-2'>(I think I recognized your device!)</p>
        </div>
      )}

      <div className="mt-12 text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none">
          <h3 className="font-semibold font-serif">Important Notes:</h3>
          <ul className="list-disc pl-5">
              <li>Data derived from headers (like specific device model, OS, or browser version) relies on the User-Agent string, which can sometimes be generic or inaccurate.</li>
              <li>IP-based geolocation provides an approximation and requires external services for accuracy; it's not enabled by default here.</li>
              <li>We prioritize user privacy and only collect data necessary for website functionality, analytics, and security.</li>
          </ul>
      </div>
    </div>
  );
} 