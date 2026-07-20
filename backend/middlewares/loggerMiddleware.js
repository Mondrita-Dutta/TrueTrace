const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`;
    
    // Log info for success, error for failures
    if (res.statusCode >= 400) {
      console.error(log);
    } else {
      console.log(log);
    }
  });

  next();
};

module.exports = { loggerMiddleware };
