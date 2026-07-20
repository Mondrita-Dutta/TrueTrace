const AuditLog = require('../models/AuditLog');

const logAction = (action, resource) => {
  return async (req, res, next) => {
    // We want to log the action *after* it has completed to get the final status
    // However, some actions might change the user context (like login)
    // So we hook into the res.on('finish') event
    
    res.on('finish', async () => {
      // Only log successful actions by default, or specific errors if needed
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          const userId = req.user ? req.user._id : null;
          
          await AuditLog.create({
            user: userId,
            action: action,
            resource: resource,
            details: {
              method: req.method,
              originalUrl: req.originalUrl,
              statusCode: res.statusCode,
              // Avoid logging sensitive body data like passwords
              body: action === 'Login' || action === 'Register' ? undefined : req.body,
              params: req.params,
              query: req.query
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent') || ''
          });
        } catch (error) {
          console.error('Failed to write audit log:', error);
        }
      }
    });

    next();
  };
};

module.exports = {
  logAction
};
