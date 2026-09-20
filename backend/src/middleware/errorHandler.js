import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(status, message, error = 'error') {
    super(message);
    this.status = status;
    this.error = error;
  }
}

export const notFound = (req, res) =>
  res.status(404).json({ error: 'not_found', message: `${req.method} ${req.path} not found`, status: 404 });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Invalid input',
      status: 400,
      fields: err.flatten().fieldErrors,
    });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: err.error || 'server_error',
    message: status >= 500 ? 'Something went wrong' : err.message,
    status,
  });
};
