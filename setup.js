#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up MERN Job Tracker...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 14) {
  console.error('❌ Node.js version 14 or higher is required');
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Create .env file from example if it doesn't exist
const envPath = path.join(__dirname, 'server', '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  try {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    const serverEnvContent = envExample
      .split('\n')
      .filter(line => !line.startsWith('REACT_APP_'))
      .join('\n');
    
    fs.writeFileSync(envPath, serverEnvContent);
    console.log('✅ Created server/.env file from template');
  } catch (error) {
    console.warn('⚠️  Could not create .env file:', error.message);
  }
}

// Install dependencies
console.log('\n📦 Installing dependencies...');

try {
  console.log('Installing server dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  
  console.log('Installing root dependencies...');
  execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
  
  console.log('✅ All dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Display setup completion message
console.log('\n🎉 Setup completed successfully!\n');
console.log('📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Update server/.env with your MongoDB connection string if needed');
console.log('3. Run "npm run dev" to start both client and server');
console.log('\n📚 Available commands:');
console.log('  npm run dev        - Start both client and server in development mode');
console.log('  npm run server     - Start only the server');
console.log('  npm run client     - Start only the client');
console.log('\n🌐 The application will be available at:');
console.log('  Frontend: http://localhost:3000');
console.log('  Backend:  http://localhost:5000');
console.log('\n⚠️  Security Notice:');
console.log('This application uses simplified authentication for learning purposes.');
console.log('Do not use in production without implementing proper security measures.');