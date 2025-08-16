import React from 'react';

const About = () => {
 const features = [
 {
 icon: '🔐',
 title: 'Ultra Simple Authentication',
 description: 'Session-based authentication with plain text passwords for learning purposes'
 },
 {
 icon: '🏢',
 title: 'Company Management',
 description: 'Full CRUD operations for tracking job applications with detailed information'
 },
 {
 icon: '📅',
 title: 'Calendar Integration',
 description: 'Visual calendar showing interviews and follow-ups with color-coded statuses'
 },
 {
 icon: '📱',
 title: 'Responsive Design',
 description: 'Mobile-first approach that works seamlessly on all devices'
 },
 {
 icon: '🌙',
 title: 'Dark Mode',
 description: 'Toggle between light and dark themes with localStorage persistence'
 },
 {
 icon: '📊',
 title: 'Application Analytics',
 description: 'Dashboard with statistics and filtering capabilities'
 }
 ];

 const techStack = [
 {
 category: 'Frontend',
 technologies: ['React.js', 'Tailwind CSS', 'React Router DOM', 'React Big Calendar', 'Axios']
 },
 {
 category: 'Backend',
 technologies: ['Node.js', 'Express.js', 'express-session', 'CORS']
 },
 {
 category: 'Database',
 technologies: ['MongoDB', 'Mongoose ODM']
 },
 {
 category: 'Development',
 technologies: ['JavaScript (ES6+)', 'Nodemon', 'Concurrently']
 }
 ];

 return (
 <div className="max-w-4xl mx-auto space-y-8">
 {/* Developer Section */}
 <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
 <div className="flex flex-col md:flex-row items-center gap-6">
 <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold">
 AS
 </div>
 <div className="text-center md:text-left">
 <h2 className="text-3xl font-bold text-foreground mb-2">Created by Ayush Sharma</h2>
 <p className="text-lg text-muted-foreground mb-4">Full Stack Developer</p>
 <p className="text-foreground">
 This job tracking application was built to help job seekers organize and manage their application process efficiently. 
 Developed with modern web technologies and best practices.
 </p>
 </div>
 </div>
 </div>

 {/* Header */}
 <div className="text-center">
 <div className="mx-auto h-16 w-16 bg-primary rounded-lg flex items-center justify-center mb-4">
 <span className="text-primary-foreground font-bold text-2xl">JT</span>
 </div>
 <h1 className="text-4xl font-bold text-foreground mb-4">
 Job Application Tracker
 </h1>
 <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
 A comprehensive MERN stack application designed to help you manage your job search 
 process efficiently with modern web technologies.
 </p>
 </div>

 {/* Features Section */}
 <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
 <h2 className="text-2xl font-bold text-foreground mb-6">Features</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {features.map((feature, index) => (
 <div key={index} className="text-center">
 <div className="text-3xl mb-3">{feature.icon}</div>
 <h3 className="text-lg font-semibold text-foreground mb-2">
 {feature.title}
 </h3>
 <p className="text-muted-foreground text-sm">
 {feature.description}
 </p>
 </div>
 ))}
 </div>
 </div>

 {/* Technology Stack */}
 <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
 <h2 className="text-2xl font-bold text-foreground mb-6">Technology Stack</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {techStack.map((stack, index) => (
 <div key={index}>
 <h3 className="text-lg font-semibold text-foreground mb-3">
 {stack.category}
 </h3>
 <div className="flex flex-wrap gap-2">
 {stack.technologies.map((tech, techIndex) => (
 <span
 key={techIndex}
 className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
 >
 {tech}
 </span>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Project Information */}
 <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
 <h2 className="text-2xl font-bold text-foreground mb-6">Project Overview</h2>
 <div className="space-y-4 text-foreground">
 <p>
 This Job Application Tracker is a full-stack web application built with the MERN stack 
 (MongoDB, Express.js, React.js, Node.js). It demonstrates modern web development practices 
 while maintaining simplicity for educational purposes.
 </p>
 <p>
 The application allows users to track their job applications through various stages, 
 from initial application to final decision. Users can manage company information, 
 schedule interviews, take notes, and visualize their progress through an integrated calendar.
 </p>
 <p>
 Key architectural decisions include using session-based authentication for simplicity, 
 React Context for state management, and Tailwind CSS for responsive design. The calendar 
 integration uses React Big Calendar to provide a familiar interface for scheduling and 
 viewing upcoming events.
 </p>
 </div>
 </div>


 {/* Getting Started */}
 <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
 <h2 className="text-2xl font-bold text-foreground mb-6">Getting Started</h2>
 <div className="space-y-4">
 <div>
 <h3 className="text-lg font-semibold text-foreground mb-2">
 1. Create an Account
 </h3>
 <p className="text-muted-foreground">
 Register with a username, email, and password to start tracking your applications.
 </p>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-foreground mb-2">
 2. Add Your First Application
 </h3>
 <p className="text-muted-foreground">
 Use the Dashboard to add companies you've applied to, including position details and status.
 </p>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-foreground mb-2">
 3. Schedule Follow-ups
 </h3>
 <p className="text-muted-foreground">
 Set "Next Action Date" for interviews and follow-ups to see them on your calendar.
 </p>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-foreground mb-2">
 4. Track Your Progress
 </h3>
 <p className="text-muted-foreground">
 Update application statuses and view your progress through the dashboard statistics.
 </p>
 </div>
 </div>
 </div>

 {/* Contact & Social Section */}
 <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
 <h2 className="text-2xl font-bold text-foreground mb-6">Contact & Social</h2>
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-4 sm:space-y-0 sm:space-x-8">
 <a
 href="https://yourportfolio.com"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors group"
 >
 <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:bg-primary/90 transition-colors">
 <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
 </svg>
 </div>
 <span className="font-medium">Portfolio</span>
 </a>
 <a
 href="https://github.com/astrix-ui"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors group"
 >
 <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:bg-primary/90 transition-colors">
 <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
 </svg>
 </div>
 <span className="font-medium">GitHub</span>
 </a>
 <a
 href="https://www.linkedin.com/in/ayush-sharma-a0351b270/"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors group"
 >
 <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:bg-primary/90 transition-colors">
 <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
 <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
 </svg>
 </div>
 <span className="font-medium">LinkedIn</span>
 </a>
 <a
 href="https://instagram.com/clumsymind7878"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors group"
 >
 <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:bg-primary/90 transition-colors">
 <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
 </svg>
 </div>
 <span className="font-medium">Instagram</span>
 </a>
 </div>
 </div>

 {/* Footer */}
 <div className="text-center py-8 border-t border-border">
 <p className="text-muted-foreground">
 Ayush Sharma. All rights reserved.
 </p>
 <p className="text-sm text-muted-foreground mt-2">
 Version 1.0.0 • {new Date().getFullYear()}
 </p>
 </div>
 </div>
 );
};

export default About;
