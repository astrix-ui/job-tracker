# Deployment Guide

This guide covers deploying the MERN Job Tracker application to various platforms.

## Prerequisites

- Node.js 14+ installed
- MongoDB database (local or cloud)
- Git repository

## Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secure_session_secret
NODE_ENV=production
```

### Client (optional)
```
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Local Development

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd mern-job-tracker-starter
   npm run setup
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

## Production Deployment

### Option 1: Render Deployment (Recommended)

1. **Prepare your repository:**
   - Ensure all changes are committed to your Git repository
   - Push to GitHub, GitLab, or Bitbucket

2. **Create a new Web Service on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "Web Service"
   - Connect your repository

3. **Configure the service:**
   ```
   Name: mern-job-tracker
   Environment: Node
   Region: Choose your preferred region
   Branch: main (or your default branch)
   Root Directory: mern-job-tracker-starter
   Build Command: npm run build
   Start Command: npm start
   ```

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   SESSION_SECRET=your_secure_random_string
   PORT=10000
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

### Option 2: Heroku Deployment

1. **Prepare for Heroku:**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login to Heroku
   heroku login
   
   # Create Heroku app
   heroku create your-job-tracker-app
   ```

2. **Configure environment variables:**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set SESSION_SECRET=your_session_secret
   heroku config:set NODE_ENV=production
   ```

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 2: Digital Ocean/VPS Deployment

1. **Server setup:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

2. **Application deployment:**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd mern-job-tracker-starter
   
   # Install dependencies
   npm run install-all
   
   # Build client
   cd client && npm run build
   
   # Start server with PM2
   cd ../server
   pm2 start server.js --name "job-tracker"
   pm2 startup
   pm2 save
   ```

3. **Nginx configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /path/to/your/app/client/build;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 3: Netlify + Railway/Render

1. **Frontend (Netlify):**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Environment variables: `REACT_APP_API_URL`

2. **Backend (Railway/Render):**
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically on push

## Database Options

### MongoDB Atlas (Recommended)
1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Add to environment variables

### Local MongoDB
```bash
# Install MongoDB
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Security Considerations

⚠️ **Important**: This application uses simplified authentication for learning purposes.

For production deployment, implement:

1. **Password Hashing:**
   ```bash
   npm install bcryptjs
   ```

2. **JWT Authentication:**
   ```bash
   npm install jsonwebtoken
   ```

3. **Input Validation:**
   ```bash
   npm install joi express-validator
   ```

4. **Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```

5. **HTTPS/SSL:**
   - Use Let's Encrypt for free SSL certificates
   - Configure Nginx with SSL

6. **Environment Security:**
   - Use strong session secrets
   - Enable secure cookies in production
   - Set proper CORS origins

## Monitoring and Maintenance

1. **Logging:**
   ```bash
   pm2 logs job-tracker
   ```

2. **Monitoring:**
   ```bash
   pm2 monit
   ```

3. **Updates:**
   ```bash
   git pull origin main
   npm run install-all
   cd client && npm run build
   pm2 restart job-tracker
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection:**
   - Check connection string
   - Verify network access
   - Check MongoDB service status

2. **Port Conflicts:**
   - Change PORT in environment variables
   - Check if ports are already in use

3. **Build Errors:**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

4. **CORS Issues:**
   - Update CORS configuration
   - Check frontend API URL

### Logs and Debugging

```bash
# Server logs
cd server && npm run dev

# Client logs
cd client && npm start

# PM2 logs (production)
pm2 logs job-tracker
```