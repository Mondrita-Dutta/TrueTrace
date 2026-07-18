const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.error(`Role (${req.user?.role}) is not authorized to access this resource`, 403);
    }
    next();
  };
};

module.exports = { authorize };
