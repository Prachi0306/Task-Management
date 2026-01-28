# Task Management System

A full-stack task management application with authentication, role-based access control, and comprehensive task management features.

## Features

- **Multi-user System**: Support for 50+ concurrent users
- **Authentication**: Secure JWT-based authentication system
- **Role-Based Access Control**: User and Admin roles with different permissions
- **Task Management**: Complete CRUD operations for tasks
- **Status Transitions**: Tasks can move between To-Do, In-Progress, and Completed states
- **Task Filtering**: Filter tasks by status, priority, assigned user, and search
- **Task Statistics**: Real-time statistics dashboard
- **Drag & Drop**: Intuitive Kanban board interface with drag-and-drop functionality
- **Modern UI**: Beautiful, responsive design with smooth animations

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **Vanilla JavaScript** (ES6+)
- **HTML5** & **CSS3**
- **Font Awesome** icons
- Responsive design

## API Endpoints

### Authentication APIs
1. `POST /api/auth/register` - Register a new user
2. `POST /api/auth/login` - Login user
3. `GET /api/auth/me` - Get current user
4. `GET /api/auth/users` - Get all users (Admin only)

### Task Management APIs
1. `POST /api/tasks` - Create a new task
2. `GET /api/tasks` - Get all tasks (with filtering)
3. `GET /api/tasks/:id` - Get single task
4. `PUT /api/tasks/:id` - Update task
5. `PATCH /api/tasks/:id/status` - Update task status
6. `PATCH /api/tasks/:id/assign` - Assign task to user
7. `DELETE /api/tasks/:id` - Delete task
8. `GET /api/tasks/stats` - Get task statistics

### Health Check
- `GET /api/health` - Server health check

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

### Frontend Setup

The frontend is served statically by the Express server. No separate setup is required.

## Usage

1. **Start MongoDB**: Ensure MongoDB is running on your system
2. **Start Backend**: Run `npm run dev` in the backend directory
3. **Access Application**: Open `http://localhost:5000` in your browser

### User Roles

- **User**: Can create, view, update, and delete their own tasks. Can only see tasks assigned to them or created by them.
- **Admin**: Has full access to all tasks and can manage all users.

### Task Status Flow

Tasks can transition between three states:
- **To-Do**: Newly created tasks
- **In-Progress**: Tasks currently being worked on
- **Completed**: Finished tasks

### Features

- **Create Tasks**: Click "Create Task" button to add new tasks
- **Filter Tasks**: Use the sidebar filters to filter by status, priority, or search
- **Drag & Drop**: Drag tasks between columns to change status
- **Edit Tasks**: Click the edit icon on any task card
- **Delete Tasks**: Click the delete icon (only creator can delete)
- **View Statistics**: Check the sidebar for task statistics

## Project Structure

```
Task-Management/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Task.js
│   │   ├── routers/
│   │   │   ├── authRoutes.js
│   │   │   └── taskRoutes.js
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   ├── validator/
│   │   │   ├── authValidator.js
│   │   │   └── taskValidator.js
│   │   └── server.js
│   ├── public/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── README.md
```

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- Protected API routes

## Testing

To test with multiple users:

1. Register multiple accounts (you can create admin users by setting role in registration)
2. Create tasks assigned to different users
3. Test role-based access control
4. Test task filtering and search functionality

## License

ISC

## Author

Prachi
