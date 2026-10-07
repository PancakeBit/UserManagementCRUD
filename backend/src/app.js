import express from 'express';
import { createUsersController } from './controllers/users.controller.js';
import { createUsersRouter } from './routes/users.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Builds the app from its dependencies. Tests can pass a store backed by a temp file.
export function createApp({ userStore }) {
  const app = express();

  app.use(express.json());

  const usersController = createUsersController(userStore);
  app.use('/api/users', createUsersRouter(usersController));

  // Order matters: these must be registered after all routes.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
