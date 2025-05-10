# Skill Learning Platform

A modern web application for personalized skill development with learning roadmaps, gamification, and community features.

![Skill Learning Platform](https://via.placeholder.com/800x400?text=Skill+Learning+Platform)

## 📋 Overview

The Skill Learning Platform is a comprehensive solution designed to help users acquire new skills through structured learning paths, gamification elements, and community engagement. The platform supports two main user roles: Learners and Curators (Admins).

### Key Features

- **Personalized Learning Roadmaps**: Tailored learning paths based on user interests and goals
- **Gamification System**: XP points, badges, achievements, and leaderboards to motivate learners
- **Resource Management**: Curated learning resources for each step of the learning journey
- **Progress Tracking**: Visual tracking of learning progress and milestones
- **Community Discussions**: Forums for peer support and knowledge sharing

## 🏗️ Architecture

The application follows a modern client-server architecture:

- **Frontend**: React.js with Redux for state management
- **Backend**: Node.js with Express.js
- **Database**: SQL database with Knex.js as the query builder
- **Authentication**: JWT-based authentication system

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQL database (MySQL, PostgreSQL, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/skill-learning-platform.git
   cd skill-learning-platform
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the backend directory based on `.env.example`
   - Set up your database connection details and JWT secret

4. Set up the database:
   ```bash
   cd backend
   npm run migrate
   npm run seed  # Optional: Populate with sample data
   ```

5. Start the development servers:
   ```bash
   # Start backend server (from backend directory)
   npm start

   # Start frontend development server (from frontend directory)
   npm run dev
   ```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4500

## 🧩 Project Structure

```
skill-learning-platform/
├── backend/                  # Backend Node.js application
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   └── validations/      # Request validation
│   ├── migrations/           # Database migrations
│   ├── seeds/                # Seed data
│   └── server.js             # Entry point
│
└── frontend/                 # Frontend React application
    ├── public/               # Static assets
    └── src/
        ├── components/       # React components
        │   ├── auth/         # Authentication components
        │   ├── home/         # Home page components
        │   │   ├── curator/  # Curator-specific components
        │   │   └── learner/  # Learner-specific components
        │   ├── sections/     # Reusable section components
        │   └── ui/           # UI components
        ├── hooks/            # Custom React hooks
        ├── imports/          # API endpoints and constants
        ├── pages/            # Page components
        ├── redux/            # Redux store and slices
        └── App.jsx           # Main application component
```

## 🔐 User Roles

### Learner
- Access personalized dashboard with progress tracking
- View and join learning roadmaps
- Track progress through learning steps
- Earn XP points and badges
- Participate in discussions

### Curator (Admin)
- Manage skills and categories
- Create and edit learning roadmaps
- Add learning steps to roadmaps
- Upload and manage learning resources
- Monitor user progress

## 🎮 Gamification System

The platform implements a comprehensive gamification system to motivate learners:

- **XP Points**: Earned by completing learning steps, participating in discussions, and daily logins
- **Badges**: Awarded based on XP milestones (Beginner, Explorer, Apprentice, Adept, Expert, Master)
- **Achievements**: Special awards for specific accomplishments (First Step, Consistent Learner, etc.)
- **Streaks**: Rewards for consistent daily engagement
- **Leaderboard**: Competitive ranking based on XP and achievements

## 🧪 Testing

Run tests for the backend:
```bash
cd backend
npm test
```

Run tests for the frontend:
```bash
cd frontend
npm test
```

## 🔄 API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify OTP for registration

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile/update` - Update user profile

### Roadmaps
- `GET /api/roadmaps` - Get all roadmaps
- `GET /api/roadmaps/:id` - Get roadmap by ID
- `POST /api/roadmaps` - Create new roadmap
- `GET /api/roadmap-personalized/recommended/:user_id` - Get recommended roadmaps
- `GET /api/roadmap-personalized/trending` - Get trending roadmaps

### Steps
- `GET /api/steps/roadmap/:roadmapId` - Get steps for a roadmap
- `POST /api/steps` - Add a step to a roadmap

### Resources
- `GET /api/resources/step/:stepId` - Get resources for a step
- `POST /api/resources` - Add a resource to a step

### Gamification
- `POST /api/gamification/update` - Update user's gamification data
- `GET /api/gamification/:user_id` - Get user's gamification data
- `GET /api/gamification/leaderboard/top` - Get top users leaderboard
- `GET /api/gamification/achievements/list` - Get list of available achievements

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones

## 🛠️ Technologies Used

### Frontend
- React.js
- Redux Toolkit
- React Router
- Tailwind CSS
- Shadcn UI
- Vite

### Backend
- Node.js
- Express.js
- Knex.js
- JWT Authentication
- SQL Database

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

Project Link: [https://github.com/yourusername/skill-learning-platform](https://github.com/yourusername/skill-learning-platform)
