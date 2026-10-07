import express from 'express';
import usersRouter from './routes/users.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/users', usersRouter);

// Order matters: these must be registered after all routes.
app.use(notFound);
app.use(errorHandler);

export default app;
