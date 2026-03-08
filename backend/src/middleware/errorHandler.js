const { ZodError } = require('zod');

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const notFound = (req, res, next) => {
  next(new ApiError(404, 'Not found'));
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation error', issues: err.errors });
  }
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const payload = { error: message };
  if (err.details) payload.details = err.details;
  res.status(status).json(payload);
};

module.exports = { ApiError, errorHandler, notFound };
