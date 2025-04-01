'use client';

import { useEffect, useState } from 'react';

export default function ClientSpecificInfo() {
  const [clientSideData, setClientSideData] = useState({
    timezone: 'Detecting...',
    screenResolution: 'Detecting...',
  });

  useEffect(() => {
    // This effect runs only in the browser after the component mounts
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    setClientSideData({ timezone, screenResolution });
  }, []); // Empty dependency array means this runs once on mount

  const clientDataToShow = [
    { name: 'Timezone (Client-Side)', value: clientSideData.timezone, importance: 9, description: 'Your local timezone detected by the browser.' },
    { name: 'Screen Resolution (Client-Side)', value: clientSideData.screenResolution, importance: 10, description: 'Your screen size detected by the browser.' },
  ];

  // We sort here to maintain the overall importance order when rendered after server data
  return (
    <>
      {clientDataToShow.sort((a, b) => a.importance - b.importance).map((item) => (
        <div key={item.name} className="p-4 border rounded-lg dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-1 font-serif text-primary dark:text-text-dark">{item.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
          <p className="font-mono break-words bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">{item.value}</p>
        </div>
      ))}
    </>
  );
} 