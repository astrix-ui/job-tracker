import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const features = [
    {
      title: "Application Tracking",
      description: "Organize and monitor your job applications with detailed status tracking and timeline management.",
      category: "Core"
    },
    {
      title: "Calendar Integration",
      description: "Schedule interviews, follow-ups, and deadlines with an intuitive calendar interface.",
      category: "Core"
    },
    {
      title: "Professional Networking",
      description: "Connect with other job seekers, share experiences, and build your professional network.",
      category: "Social"
    },
    {
      title: "Progress Analytics",
      description: "Visualize your job search progress with comprehensive statistics and insights.",
      category: "Analytics"
    },
    {
      title: "Smart Notifications",
      description: "Stay informed with intelligent alerts for upcoming deadlines and important updates.",
      category: "Productivity"
    },
    {
      title: "Dashboard Widgets",
      description: "Quick access to connections status, upcoming events, and popular users in your network.",
      category: "Dashboard"
    },
    {
      title: "Mobile Optimized",
      description: "Seamless experience across all devices with responsive design and mobile-first approach.",
      category: "Experience"
    },
    {
      title: "Data Privacy",
      description: "Your personal information and connections remain private with secure data handling.",
      category: "Security"
    }
  ];


  const categories = ["Core", "Social", "Analytics", "Productivity", "Dashboard", "Experience", "Security"];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Job Tracker
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your job search with intelligent tracking, networking, and analytics
          </p>
          {!isAuthenticated && (
            <div className="flex justify-center">
              <button 
                onClick={handleGetStarted}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </section>


      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to make your job search more organized, efficient, and successful
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full"
              >
                {category}
              </span>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-card border border-border rounded-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-primary/20"
              >
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mb-3">
                    {feature.category}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Built with modern technology
          </h2>
          <div className="relative overflow-hidden">
            <div className="flex gap-6 pb-4 animate-scroll">
              {['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS', 'JWT', 'Mongoose', 'React Router', 'Context API', 'Axios', 'bcryptjs', 'CORS'].map((tech) => (
                <div key={tech} className="p-4 bg-card border border-border rounded-lg whitespace-nowrap flex-shrink-0">
                  <div className="text-lg font-medium text-foreground">{tech}</div>
                </div>
              ))}
            </div>
            {/* Gradient fade effect */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Our Mission
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            We believe job searching should be organized, collaborative, and insightful. 
            Our platform empowers job seekers with the tools they need to track applications, 
            build meaningful connections, and make data-driven decisions throughout their career journey.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 bg-card border border-border rounded-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-xl font-semibold text-foreground mb-3">Organize</h3>
              <p className="text-muted-foreground">
                Keep track of every application, interview, and opportunity in one centralized platform.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-xl font-semibold text-foreground mb-3">Connect</h3>
              <p className="text-muted-foreground">
                Build relationships with fellow job seekers and expand your professional network.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-xl font-semibold text-foreground mb-3">Succeed</h3>
              <p className="text-muted-foreground">
                Make informed decisions with analytics and insights that guide your job search strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Created by
          </h2>
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Ayush Sharma
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Full Stack Developer passionate about creating tools that make job searching more efficient and organized.
          </p>
          <div className="flex justify-center gap-6">
            <a 
              href="https://instagram.com/ayushsharma" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-card border border-border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-foreground font-medium">Instagram</span>
              </div>
            </a>
            <a 
              href="https://linkedin.com/in/ayushsharma" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-card border border-border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-foreground font-medium">LinkedIn</span>
              </div>
            </a>
            <a 
              href="https://github.com/ayushsharma" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-card border border-border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-foreground font-medium">GitHub</span>
              </div>
            </a>
            <a 
              href="https://ayushsharma.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-card border border-border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-foreground font-medium">Portfolio</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;