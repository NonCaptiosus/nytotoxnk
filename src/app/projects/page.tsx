import Link from 'next/link';

export const metadata = {
  title: 'Projects',
  description: 'Check out my web development and cloud projects',
};

// Project type definition
interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
}

// Sample projects data
const projects: Project[] = [
  {
    id: '1',
    title: 'Personal Blog',
    description: 'A modern blog built with Next.js and Cloudflare Workers for the backend API. Features server-side rendering, static generation, and a simple markdown-based content management system.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Cloudflare Workers'],
    github: 'https://github.com/yourusername/blog',
    link: 'https://your-blog-url.com'
  },
  {
    id: '2',
    title: 'E-commerce Dashboard',
    description: 'An administrative dashboard for managing an e-commerce platform. Includes product management, order tracking, and customer analytics.',
    technologies: ['React', 'Redux', 'Node.js', 'MongoDB', 'Chart.js'],
    github: 'https://github.com/yourusername/ecommerce-dashboard',
  },
  {
    id: '3',
    title: 'Weather Application',
    description: 'A weather forecast application that provides real-time weather data using the OpenWeather API. Features include location search, 7-day forecast, and weather maps.',
    technologies: ['JavaScript', 'HTML/CSS', 'Weather API', 'Leaflet.js'],
    github: 'https://github.com/yourusername/weather-app',
    link: 'https://weather-app-demo.com'
  }
];

export default function ProjectsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Projects</h1>
        <p className="text-gray-600">
          A collection of my web development and cloud computing projects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                {project.github && (
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub
                  </a>
                )}
                {project.link && (
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 