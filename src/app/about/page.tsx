import Image from 'next/image';

export const metadata = {
  title: 'About Me | nytotoxNK',
  description: 'Learn more about me, my skills, and my experience',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 font-serif text-primary dark:text-text-dark">
        About Me
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 font-serif text-primary dark:text-text-dark">
            Hey there, I'm Aldo!
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">
              I'm a web developer passionate about creating modern, responsive web applications using the latest technologies.
            </p>
            
            <p className="mb-4">
              My expertise spans across several domains:
            </p>
            
            <ul className="list-disc pl-5 mb-6 space-y-2">
              <li>Cybersecurity & Network Engineering</li>
              <li>Mobile & Web Development</li>
              <li>AI & Machine Learning</li>
            </ul>
            
            <p>
              I enjoy taking on challenging projects that allow me to combine my technical skills with creative problem-solving.
              Whether it's building performant web applications, securing networks, or exploring the potential of AI,
              I'm always eager to learn and grow.
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center md:justify-end">
          <div className="w-48 h-48 md:w-56 md:h-56 relative rounded-full overflow-hidden">
            {/* You can add your profile picture here */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary dark:from-text-dark dark:to-accent-dark opacity-80 flex items-center justify-center text-white text-lg font-bold">
              AD
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 font-serif text-primary dark:text-text-dark">
          Connect With Me
        </h2>
        
        <div className="flex space-x-6">
          <a
            href="https://github.com/NonCaptiosus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-secondary dark:text-accent-dark hover:text-primary dark:hover:text-text-dark transition-colors"
          >
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/aldo-diku-037722141/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-secondary dark:text-accent-dark hover:text-primary dark:hover:text-text-dark transition-colors"
          >
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
} 