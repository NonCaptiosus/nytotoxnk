import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">About Me</h2>
          <p className="text-sm">This is a brief description about me. It should be more spaced out and centered.</p>
        </div>
        <div className="flex flex-col items-end">
          <Link href="/contact" className="text-sm hover:underline">Contact</Link>
          <Link href="/privacy" className="text-sm hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;