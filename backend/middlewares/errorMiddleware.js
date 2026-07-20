const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';
  let errors = null;

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found or invalid ID';
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered. A record with this value already exists.';
    errors = err.keyValue;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((val) => val.message);
  }

  console.error(`[Error] ${req.method} ${req.originalUrl} - ${message}`);

  // Use the custom res.error if it exists, otherwise standard json
  if (typeof res.error === 'function') {
    return res.error(message, statusCode, errors);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = { errorHandler };
