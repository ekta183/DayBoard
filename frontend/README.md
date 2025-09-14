# DayBoard Frontend

A React.js frontend application for DayBoard - a shared productivity scheduler where users can track tasks, manage daily productivity, and view shared schedules.

## Features

- **Dark Theme UI** with modern, sleek design
- **User Authentication** (Login/Register)
- **Task Management** with percentage-based completion tracking
- **Daily Dashboard** with productivity statistics
- **Calendar View** with color-coded productivity days
- **Shared Schedules** to view other users' productivity
- **End Day Functionality** with irreversible daily completion
- **Responsive Design** that works on all devices
- **Real-time Progress Tracking** with visual indicators

## Tech Stack

- **Framework**: React.js 18 with TypeScript
- **Styling**: Custom CSS (utility-first approach)
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Build Tool**: Create React App
- **Package Manager**: npm

## Project Structure

```
frontend/
├── public/
│   ├── index.html           # Main HTML template
│   └── favicon.ico          # App icon
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AddTaskForm.tsx     # Task creation form
│   │   ├── Calendar.tsx        # Calendar view component
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── ProtectedRoute.tsx  # Route protection wrapper
│   │   └── TaskCard.tsx        # Individual task display
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx     # Authentication state management
│   ├── pages/              # Main application pages
│   │   ├── Dashboard.tsx       # Main dashboard page
│   │   ├── Login.tsx           # User login page
│   │   ├── MyCalendar.tsx      # Personal calendar view
│   │   ├── PublicSchedules.tsx # Shared schedules page
│   │   └── Register.tsx        # User registration page
│   ├── services/           # API and external services
│   │   └── api.ts              # Backend API client
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts            # App-wide types
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Application entry point
│   └── index.css           # Global styles and custom CSS framework
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Backend API running on `http://localhost:5000`

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
The frontend expects the backend API to be running on `http://localhost:5000`. If your backend runs on a different port, update the `API_BASE_URL` in `src/services/api.ts`.

### 3. Start Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## Application Features

### 🔐 Authentication
- **User Registration** with username, email, and password
- **User Login** with JWT token management
- **Protected Routes** that require authentication
- **Automatic Token Storage** in localStorage
- **Session Persistence** across browser refreshes

### 📋 Task Management
- **Create Tasks** with title, description, and total items
- **Progress Tracking** with completed/total item counts
- **Percentage Calculation** automatically computed
- **Notes Support** to add context to task progress
- **Edit/Delete** tasks (only for non-ended days)
- **Date-based Organization** of tasks

### 📊 Dashboard
- **Daily Overview** with task statistics
- **Progress Cards** showing total tasks, completed tasks, and average progress
- **Task List** with real-time progress updates
- **Date Selector** to view tasks for specific days
- **End Day Button** for irreversible daily completion

### 📅 Calendar View
- **Monthly Calendar** with navigation controls
- **Color-coded Days** based on productivity levels:
  - 🟢 **Green**: Productive days (80%+ completion)
  - 🟡 **Yellow**: Moderately productive days (50-79%)
  - 🔴 **Red**: Less productive days (0-49%)
- **Productivity Labels** and percentages displayed
- **Task Count** and completion statistics per day

### 👥 Shared Schedules
- **Public User List** of users with visible profiles
- **View Other Users' Calendars** and productivity
- **Browse by User** with easy navigation
- **Productivity Comparison** across users

### 🎨 UI/UX Features
- **Dark Theme** with carefully chosen color palette
- **Smooth Animations** and hover effects
- **Responsive Design** for mobile and desktop
- **Loading States** and user feedback
- **Form Validation** with error messages
- **Accessibility Features** with proper contrast and focus states

## Custom CSS Framework

The application uses a custom CSS utility framework with classes like:

```css
/* Layout Classes */
.flex, .grid, .min-h-screen, .max-w-4xl

/* Spacing */
.p-4, .py-2, .px-3, .mb-4, .space-x-4

/* Colors */
.bg-bg-primary, .text-text-primary, .bg-accent

/* Typography */
.text-lg, .font-semibold, .text-center
```

### Color Palette
```css
--color-bg-primary: #1a1a1a     /* Main background */
--color-bg-secondary: #2d2d2d   /* Cards, navbar */
--color-bg-tertiary: #3d3d3d    /* Hover states */
--color-text-primary: #ffffff   /* Primary text */
--color-text-secondary: #b3b3b3 /* Secondary text */
--color-accent: #4f46e5         /* Action buttons */
--color-productive: #10b981     /* Success/productive */
--color-moderate: #f59e0b       /* Warning/moderate */
--color-not-productive: #ef4444 /* Error/unproductive */
```

## API Integration

### Authentication Flow
1. User registers/logs in
2. JWT token received and stored
3. Token included in subsequent API requests
4. Automatic logout on token expiration

### API Client (`services/api.ts`)
```typescript
// Example usage
const tasks = await api.tasks.getByDate('2024-01-15');
const response = await api.auth.login({ email, password });
await api.dayRecords.endDay({ date, summary });
```

## Routing Structure

```
/ → Dashboard (protected)
/login → Login page
/register → Registration page
/calendar → Personal calendar (protected)
/public-schedules → Shared schedules (protected)
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Development

### Adding New Features
1. **Create types** in `src/types/index.ts`
2. **Add API methods** in `src/services/api.ts`
3. **Build components** in `src/components/`
4. **Create pages** in `src/pages/`
5. **Update routing** in `App.tsx`
6. **Add styles** to `index.css`

### Code Style
- **TypeScript** for type safety
- **Functional Components** with hooks
- **Custom hooks** for reusable logic
- **Props interfaces** for component contracts

## Deployment

### Build and Deploy
```bash
# Build for production
npm run build

# Deploy build folder to:
# - Netlify, Vercel, GitHub Pages
# - AWS S3 + CloudFront
# - Any static hosting service
```

## Troubleshooting

### Common Issues

**API Connection Failed**
- Ensure backend is running on port 5000
- Check CORS settings in backend

**Authentication Issues**
- Clear localStorage and re-login
- Check JWT token expiration

**Styling Issues**
- Check browser developer tools for CSS conflicts
- Ensure custom CSS classes are properly defined

## Contributing

1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature-name`
3. **Follow code style** and TypeScript conventions
4. **Test thoroughly** on different screen sizes
5. **Submit pull request** with clear description

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [TypeScript documentation](https://www.typescriptlang.org/)
- [React Router documentation](https://reactrouter.com/)
