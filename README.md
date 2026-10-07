# User Management Dashboard

React (Vite) frontend + Node.js/Express backend. Users are persisted to a JSON file (`backend/data/user.json`) — no database.

## Requirements

- Node.js 20.19+ (or 22.12+)

## Run the backend

```bash
cd backend
npm install
npm run dev        # http://localhost:3001, restarts on file changes
```

## Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:3001`, so start the backend first.

## API

| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| GET    | `/api/users`      | List all users     |
| GET    | `/api/users/:id`  | Get one user       |
| POST   | `/api/users`      | Create a user      |
| PUT    | `/api/users/:id`  | Update a user      |
| DELETE | `/api/users/:id`  | Delete a user      |

## Project structure

```
backend/
  data/user.json            seed + persisted data
  src/
    server.js               starts the HTTP server
    app.js                  builds the Express app (middleware + routes)
    routes/                 URL → controller mapping
    controllers/            request/response handling
    services/userStore.js   JSON file read/write (fs)
    validators/             input validation
    middleware/             404 + central error handler
    utils/HttpError.js      error type carrying an HTTP status
frontend/
  src/
    api/usersApi.js         fetch wrapper for the REST API
    hooks/useUsers.js       users state, loading and error
    components/             SearchBar, UserList, UserForm
    App.jsx                 page composition
```

## Screenshots

_TODO_
