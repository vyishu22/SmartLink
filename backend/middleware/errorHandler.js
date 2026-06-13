const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, messages.join(', '));
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return sendError(res, 409, `${field} '${value}' already exists.`);
  }

  if (err.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format.');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  sendError(res, statusCode, message);
};

const notFound = (req, res, next) => {
  sendError(res, 404, `Route ${req.originalUrl} not found.`);
};

module.exports = { errorHandler, notFound };
