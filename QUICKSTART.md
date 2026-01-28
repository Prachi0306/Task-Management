# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher) installed
- MongoDB running locally or MongoDB Atlas connection string

## Setup Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. (Optional) Create Test Users
To create 50+ test users for testing:
```bash
node src/scripts/createTestUsers.js
```

This will create:
- 1 admin user: `admin@taskhub.com` / `admin123`
- 50 regular users: `user1@taskhub.com` to `user50@taskhub.com` / `user123`

### 4. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:5000
```

## First Steps

1. **Register a new account** or use the test credentials
2. **Login** to access the dashboard
3. **Create your first task** using the "Create Task" button
4. **Drag and drop** tasks between columns to change status
5. **Filter tasks** using the sidebar filters
6. **View statistics** in the sidebar

## API Testing

You can test the APIs using tools like Postman or curl:

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create a Task (requires authentication token)
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title":"My First Task",
    "description":"Task description",
    "status":"To-Do",
    "priority":"High",
    "assignedTo":"USER_ID_HERE"
  }'
```

## Features Overview

### For Regular Users:
- Create, view, edit, and delete your own tasks
- View tasks assigned to you
- Filter and search tasks
- Drag and drop to change task status
- View task statistics

### For Admin Users:
- All regular user features
- View and manage all tasks in the system
- Assign tasks to any user
- View all users in the system

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check your MongoDB Atlas connection string
- Verify the `MONGODB_URI` in your `.env` file

### Port Already in Use
- Change the `PORT` in your `.env` file
- Or stop the process using port 5000

### CORS Issues
- The backend is configured to accept requests from any origin in development
- For production, update CORS settings in `backend/src/server.js`

## Next Steps

- Customize the UI colors and styling in `frontend/styles.css`
- Add more task fields or features
- Implement real-time updates with WebSockets
- Add email notifications
- Deploy to a cloud platform
