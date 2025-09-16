# DayBoard

A modern productivity tracking application with shared schedules and task management. Built with React, TypeScript, and Node.js.

## 🚀 Features

### Core Functionality
- **Task Management**: Create, edit, and track tasks with percentage completion
- **Daily Productivity**: Automatic productivity calculation based on task completion
- **Calendar View**: Visual calendar with color-coded productivity levels
- **Day Management**: End day functionality with irreversible productivity records
- **Shared Schedules**: View other users' public schedules and productivity

### User Experience
- **Dark Theme**: Modern, eye-friendly dark interface
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Auto-save functionality for seamless task updates
- **Quick Actions**: Increment/decrement buttons for fast task progress updates
- **Admin-Only Access**: Restricted access for authorized users only

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Custom CSS** for dark theme

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

## 📁 Project Structure

```
DayBoard/
├── backend/                 # Node.js API server
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── dayRecordController.js
│   ├── middleware/          # Custom middleware
│   │   └── auth.js
│   ├── models/              # MongoDB models
│   │   ├── User.js
│   │   ├── Task.js
│   │   └── DayRecord.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── dayRecords.js
│   ├── server.js            # Main server file
│   └── package.json
├── frontend/                # React application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── AddTaskForm.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── ConfirmationModal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── TaskCard.tsx
│   │   ├── context/         # React context
│   │   │   └── AuthContext.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── MyCalendar.tsx
│   │   │   ├── PublicSchedules.tsx
│   │   │   └── Register.tsx
│   │   ├── services/        # API services
│   │   │   └── api.ts
│   │   ├── types/           # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DayBoard
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/dayboard

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
```

### Database Setup

1. **Local MongoDB**: Install MongoDB locally and run `mongod`
2. **MongoDB Atlas**: Use the cloud connection string in `MONGODB_URI`

### Admin User Setup

1. Register a new user through the frontend
2. Manually update the user's role to `admin` in the database:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (admin only)

### Tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks?date=YYYY-MM-DD` - Get tasks for specific date
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Day Records
- `POST /api/day-records/end-day` - End current day
- `GET /api/day-records/day/:date` - Get day record
- `GET /api/day-records/calendar` - Get user's calendar
- `GET /api/day-records/public/:userId/calendar` - Get public calendar
- `GET /api/day-records/users` - Get all users

## 🎨 Features Overview

### Dashboard
- Task creation and management
- Real-time productivity tracking
- Day navigation (previous/next)
- End day functionality
- Productivity statistics

### Calendar
- Monthly view with productivity indicators
- Color-coded days based on productivity levels
- Task details on day click
- Public schedule viewing

### Task Management
- Create tasks with title, description, and total items
- Track completion percentage
- Add progress notes
- Quick action buttons (+1, +5, +10, complete all)
- Auto-save functionality

## 🔒 Security

- JWT-based authentication
- Admin-only access control
- Password hashing with bcrypt
- CORS protection
- Input validation

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 or similar process manager
3. Configure reverse proxy (nginx)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Update API base URL in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

