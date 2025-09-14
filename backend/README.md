# DayBoard Backend API

A Node.js/Express backend API for DayBoard - a shared productivity scheduler application.

## Features

- **User Authentication** with JWT tokens
- **Task Management** with percentage-based completion tracking
- **Daily Productivity Calculation** with automatic scoring
- **End Day functionality** (irreversible daily completion)
- **Public Schedule Sharing** between users
- **Manual User Role Management** (set in database)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for cross-origin requests

## Project Structure

```
backend/
├── controllers/           # Route handlers and business logic
│   ├── authController.js     # Authentication (login/register)
│   ├── taskController.js     # Task CRUD operations
│   └── dayRecordController.js # Day records and productivity
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/                # MongoDB schemas
│   ├── User.js             # User model with roles
│   ├── Task.js             # Task model with completion tracking
│   └── DayRecord.js        # Daily productivity records
├── routes/                # API route definitions
│   ├── auth.js            # Authentication routes
│   ├── tasks.js           # Task management routes
│   └── dayRecords.js      # Day records routes
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables (not in git)
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayboard
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Database Setup
- Install and start MongoDB locally, or use MongoDB Atlas
- The application will automatically create the database and collections

### 4. Start Development Server
```bash
# Development with auto-restart
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |

### Task Routes (`/api/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new task | Yes |
| GET | `/?date=YYYY-MM-DD` | Get tasks for specific date | Yes |
| PUT | `/:taskId/progress` | Update task progress | Yes |
| DELETE | `/:taskId` | Delete task | Yes |

### Day Records Routes (`/api/day-records`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/end-day` | End day (irreversible) | Yes |
| GET | `/day/:date` | Get day record | Yes |
| GET | `/calendar` | Get user's calendar data | Yes |
| GET | `/public/:userId/calendar` | View public user calendar | No |
| GET | `/users` | Get all users with public profiles | No |

## Data Models

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  profileVisible: Boolean (default: true),
  createdAt: Date
}
```

### Task Model
```javascript
{
  userId: ObjectId (ref: User),
  title: String (required),
  description: String,
  totalItems: Number (required, min: 1),
  completedItems: Number (default: 0),
  completionPercentage: Number (auto-calculated),
  note: String,
  date: Date (required),
  isCompleted: Boolean (auto-calculated),
  createdAt: Date
}
```

### DayRecord Model
```javascript
{
  userId: ObjectId (ref: User),
  date: Date (required),
  isEnded: Boolean (default: false),
  endedAt: Date,
  totalTasks: Number,
  completedTasks: Number,
  overallProductivity: Number (0-100),
  productivityLabel: String (enum: ['Not Productive', 'Moderately Productive', 'Productive']),
  summary: String
}
```

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete Math Problems",
    "description": "Solve algebra questions",
    "totalItems": 4,
    "date": "2024-01-15"
  }'
```

### Update Task Progress
```bash
curl -X PUT http://localhost:5000/api/tasks/TASK_ID/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "completedItems": 2,
    "note": "Completed first 2 problems"
  }'
```

### End Day
```bash
curl -X POST http://localhost:5000/api/day-records/end-day \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "date": "2024-01-15",
    "summary": "Good productive day!"
  }'
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to receive a JWT token
2. **Include token** in Authorization header: `Bearer YOUR_JWT_TOKEN`
3. **Token expires** in 30 days
4. **Protected routes** require valid token

## User Roles

- **user**: Default role, can manage own tasks and view public schedules
- **admin**: Set manually in database, has administrative privileges

To set admin role:
```javascript
// In MongoDB shell or GUI
db.users.updateOne(
  {email: "admin@example.com"}, 
  {$set: {role: "admin"}}
)
```

## Productivity Calculation

Daily productivity is calculated based on task completion:

- **Productive (80%+)**: Most tasks completed
- **Moderately Productive (50-79%)**: Half or more tasks completed  
- **Not Productive (0-49%)**: Less than half tasks completed

## Error Handling

The API returns consistent error responses:

```javascript
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Development

### Running Tests
```bash
npm test
```

### Code Structure
- **Controllers**: Handle HTTP requests and responses
- **Models**: Define database schemas and business logic
- **Middleware**: Handle cross-cutting concerns (auth, logging)
- **Routes**: Define API endpoints and map to controllers

### Adding New Features
1. Create/update models in `/models`
2. Add business logic in `/controllers`
3. Define routes in `/routes`
4. Update this README

## Security Features

- **Password hashing** with bcrypt
- **JWT token authentication**
- **Input validation** and sanitization
- **CORS** enabled for frontend integration
- **Environment variables** for sensitive data

## Production Deployment

1. Set production environment variables
2. Use process manager (PM2)
3. Set up reverse proxy (Nginx)
4. Configure SSL/HTTPS
5. Set up database backups
6. Monitor application logs

```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "dayboard-api"
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create Pull Request

## License

This project is licensed under the MIT License.