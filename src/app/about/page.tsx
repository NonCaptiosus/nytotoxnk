import Image from 'next/image';

export const metadata = {
  title: 'About Me | nytotoxNK',
  description: 'Learn more about me, my skills, and my experience',
};

export const runtime = 'edge';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 font-serif text-primary dark:text-text-dark">
        About Me
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 font-serif text-primary dark:text-text-dark">
            Hey there, I&apos;m Aldo!
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">
              I&apos;m a web developer passionate about creating modern, responsive web applications using the latest technologies.
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
              Whether it&apos;s building performant web applications, securing networks, or exploring the potential of AI,
              I&apos;m always eager to learn and grow.
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
    </div>
  );
} 