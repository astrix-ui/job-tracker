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
