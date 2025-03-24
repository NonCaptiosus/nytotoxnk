import React from 'react';

export const metadata = {
  title: 'About Me | nytotoxNK Blog',
  description: 'Learn more about the author of nytotoxNK blog',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-primary dark:text-text-dark font-serif">About Me</h1>
      
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="mb-6 text-secondary dark:text-accent-dark">
          Web developer passionate about creating modern, responsive web applications using the latest technologies. 
          Cybersecurity & Network Enthusiast | Mobile & Web Developer | Passionate About AI & Machine Learning.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4 text-primary dark:text-text-dark font-serif">Skills & Expertise</h2>
        
        <ul className="space-y-2 text-secondary dark:text-accent-dark">
          <li>• Web Development (React, Next.js, Node.js)</li>
          <li>• Cloud Technologies (AWS, Cloudflare Workers)</li>
          <li>• Cybersecurity & Networking</li>
          <li>• Mobile Development</li>
          <li>• AI & Machine Learning</li>
        </ul>
        
      </div>
    </div>
  );
} 