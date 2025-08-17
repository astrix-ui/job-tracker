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
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4 min-w-max">
              {['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS', 'JWT', 'Mongoose', 'React Router', 'Context API', 'Axios', 'bcryptjs', 'CORS'].map((tech) => (
                <div key={tech} className="p-4 bg-card border border-border rounded-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300 whitespace-nowrap">
                  <div className="text-lg font-medium text-foreground">{tech}</div>
                </div>
              ))}
            </div>
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
              className="p-3 bg-card border border-border rounded-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-primary/20"
            >
              <span className="text-foreground font-medium">Instagram</span>
            </a>
            <a 
              href="https://linkedin.com/in/ayushsharma" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-card border border-border rounded-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-primary/20"
            >
              <span className="text-foreground font-medium">LinkedIn</span>
            </a>
            <a 
              href="https://github.com/ayushsharma" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-card border border-border rounded-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-primary/20"
            >
              <span className="text-foreground font-medium">GitHub</span>
            </a>
            <a 
              href="https://ayushsharma.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-card border border-border rounded-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-primary/20"
            >
              <span className="text-foreground font-medium">Portfolio</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;