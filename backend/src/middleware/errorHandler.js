import { HttpError } from '../utils/HttpError.js';

export function notFound(req, res, next) {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

// Four arguments is what marks this as an error handler to Express.
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    ...(err.details && { details: err.details }),
  });
}
