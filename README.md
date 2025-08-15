# MERN Stack Job Application Tracker

A comprehensive job application tracker built with the MERN stack featuring ultra-simple authentication, company management, and calendar integration.

## Features

- **Ultra Simple Authentication**: Plain text passwords with express-session (for learning purposes)
- **Company Management**: Full CRUD operations for job applications
- **Calendar Integration**: Visual calendar with interview scheduling
- **Responsive Design**: Mobile-first approach with light/dark theme
- **Modern UI**: Clean design using Tailwind CSS

## Technology Stack

- **Frontend**: React.js, Tailwind CSS, React Router DOM, React Big Calendar
- **Backend**: Node.js, Express.js, express-session
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Session-based (no JWT, no password hashing)

## Project Structure

```
job-tracker/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # Context providers
│   │   ├── utils/          # Helper functions
│   │   └── styles/         # Tailwind configurations
├── server/                 # Express backend
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── controllers/       # Business logic
│   ├── middleware/        # Authentication & validation
│   ├── config/            # Database & app configuration
│   └── utils/             # Server utilities
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd mern-job-tracker-starter
   npm run install-all
   ```

2. **Set up environment variables:**
   
   Create `server/.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/job-tracker
   SESSION_SECRET=simple-secret-key
   ```

3. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend React app on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user

### Companies
- `GET /api/companies` - Get all user companies
- `POST /api/companies` - Create new company
- `GET /api/companies/:id` - Get specific company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Calendar
- `GET /api/calendar/events` - Get all calendar events

## Database Schema

### User Schema
```javascript
{
  username: String (required),
  email: String (required, unique),
  password: String (required) // Plain text - for learning only
}
```

### Company Schema
```javascript
{
  userId: ObjectId (required),
  companyName: String (required),
  status: String (enum),
  nextActionDate: Date,
  interviewRounds: Number (default: 0),
  positionType: String (enum),
  positionTitle: String,
  applicationDate: Date (default: now),
  notes: String,
  salaryExpectation: Number,
  contactPerson: String
}
```

## Security Note

⚠️ **Important**: This application uses ultra-simple authentication with plain text passwords and basic session management. This is intentionally simplified for learning purposes and should **NEVER** be used in production. In real applications, always use proper password hashing (bcrypt) and secure authentication methods.

## Development Guidelines

- Follow MVC pattern for backend architecture
- Use functional components with React Hooks
- Implement custom hooks for API calls
- Use React Context for global state management
- Follow component composition patterns
- Implement proper error handling and loading states

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details