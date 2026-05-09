# Task Management System

[![CI](https://github.com/Prachi0306/Task-Management/actions/workflows/ci.yml/badge.svg)](https://github.com/Prachi0306/Task-Management/actions/workflows/ci.yml)

A production-grade, full-stack Task Management System with real-time collaboration, analytics, and drag-and-drop Kanban boards.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express, MongoDB, Mongoose, JWT, Socket.io, Redis |
| **Frontend** | React (Vite), Vanilla CSS, Recharts, dnd-kit |
| **Testing** | Jest, Supertest, mongodb-memory-server |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI/CD |
| **Security** | Helmet, CORS, HPP, express-rate-limit, Joi validation |

## Features

- **Authentication** — JWT-based register/login with role-based access control
- **Task CRUD** — Create, read, update, delete with field-level activity logging
- **Status Workflow** — Strict state machine (To-Do → In-Progress → Completed)
- **Drag & Drop Kanban** — Move tasks between columns with optimistic UI updates
- **Real-Time Updates** — Socket.io for instant task assignment and status notifications
- **Analytics Dashboard** — KPI cards, priority pie chart, weekly completion bar chart
- **Search & Filtering** — Full-text search, multi-param filters, date ranges, pagination
- **Caching** — Redis with automatic invalidation on mutations
- **Rate Limiting** — Redis-backed rate limiting with graceful fallback
- **API Documentation** — Swagger UI at `/api/docs`
- **Comments** — Threaded comments with @mention parsing

## Quick Start

```bash
# Clone and install
git clone https://github.com/Prachi0306/Task-Management.git
cd Task-Management
npm install
cd client && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development
npm run dev          # Backend on :5000
cd client && npm run dev  # Frontend on :5173
```

## Docker

```bash
# Run the entire stack
docker compose up --build

# Access: http://localhost:3000
```

## Testing

```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage report
```

## Project Structure

```
├── src/
│   ├── config/          # Database, Redis, Socket.io config
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Auth, validation, rate limiting, error handling
│   ├── models/          # Mongoose schemas
│   ├── repositories/    # Data access layer
│   ├── routes/          # Express routes
│   ├── services/        # Business logic
│   ├── utils/           # Helpers (AppError, JWT, logger)
│   └── validators/      # Joi validation schemas
├── client/
│   ├── src/
│   │   ├── components/  # TaskBoard, TaskCard, StatsPanel
│   │   ├── contexts/    # AuthContext, SocketContext
│   │   ├── hooks/       # useTasks
│   │   ├── pages/       # Dashboard, Login, Register
│   │   └── services/    # API client
├── tests/
│   ├── unit/            # Service unit tests
│   ├── integration/     # API integration tests
│   └── setup.js         # In-memory MongoDB setup
├── Dockerfile           # Backend container
├── client/Dockerfile    # Frontend container
└── docker-compose.yml   # Full stack orchestration
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/tasks` | List tasks (with filters) |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/stats` | Task analytics |
| GET | `/api/tasks/stats/timeline` | Weekly completion timeline |
| GET | `/api/tasks/:id` | Get a single task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| PATCH | `/api/tasks/:id/status` | Update task status |
| GET | `/api/tasks/:id/activity` | Get task activity log |
