import { HttpError } from '../utils/HttpError.js';

// Catch-all for a route path: any method not handled above it gets 405 + an Allow header,
// which HTTP requires on a 405 so the client knows which methods do work.
export function allowOnlyMethods(allowedMethods) {
  const allow = allowedMethods.join(', ');

  return (request, response) => {
    response.set('Allow', allow);
    throw new HttpError(405, `Method ${request.method} not allowed on ${request.originalUrl}`);
  };
}
