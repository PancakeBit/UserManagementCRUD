import { STATUS_CODES } from "node:http";
import { HttpError } from "../utils/HttpError.js";

export function notFound(request, response, next) {
  next(
    new HttpError(
      404,
      `Route ${request.method} ${request.originalUrl} not found`,
    ),
  );
}

// Converts any thrown error into an HttpError that is safe to show the client,
// or returns null if it's unexpected (a bug or server fault → 500).
function toClientError(err) {
  if (err instanceof HttpError) return err;

  // Errors from express.json(): their messages come from the parser, so replace them.
  if (err.type === "entity.parse.failed")
    return new HttpError(400, "Malformed JSON body");

  const status = err.status ?? err.statusCode;
  if (status >= 400 && status < 500)
    return new HttpError(status, STATUS_CODES[status]);

  return null;
}

// Four arguments is what marks this as an error handler to Express.
export function errorHandler(err, request, response, next) {
  const clientError = toClientError(err);

  if (!clientError) {
    console.error(err);
    return response.status(500).json({ error: "Internal server error" });
  }

  response.status(clientError.status).json({
    error: clientError.message,
    ...(clientError.details && { details: clientError.details }),
  });
}
